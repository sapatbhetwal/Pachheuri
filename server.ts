import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import crypto from 'crypto'
import { createServer as createViteServer } from 'vite'
import { readDB, writeDB, hashPassword, User, Order } from './server/db'

const PORT = 3000

// Helper: Luhn algorithm check for credit cards
function isValidLuhn(digits: string): boolean {
  let sum = 0
  let isEven = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10)
    if (isNaN(digit)) return false
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa'
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard'
  if (/^(62|81|97|50)/.test(digits)) return 'SCT (Smart Choice)'
  if (/^3[47]/.test(digits)) return 'American Express'
  if (/^6(?:011|5)/.test(digits)) return 'Discover'
  return 'Debit/Credit Card'
}

interface CardValidationResult {
  valid: boolean
  errors: Record<string, string>
  brand?: string
  last4?: string
}

function validateCardDetails(card: {
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
  cvv?: string
}): CardValidationResult {
  const errors: Record<string, string> = {}
  const rawNumber = (card.cardNumber || '').replace(/[\s-]/g, '')
  const cardHolder = (card.cardHolder || '').trim()
  const expiry = (card.expiryDate || '').trim()
  const cvv = (card.cvv || '').trim()

  // 1. Card Number
  if (!rawNumber) {
    errors.cardNumber = 'Card number is required'
  } else if (!/^\d{13,19}$/.test(rawNumber)) {
    errors.cardNumber = 'Card number must be 13 to 19 digits'
  } else if (!isValidLuhn(rawNumber)) {
    errors.cardNumber = 'Card number is invalid (checksum failed)'
  }

  // 2. Cardholder Name
  if (!cardHolder) {
    errors.cardHolder = 'Cardholder name is required'
  } else if (cardHolder.length < 2) {
    errors.cardHolder = 'Please enter a valid full name'
  }

  // 3. Expiry Date (MM/YY or MM/YYYY)
  if (!expiry) {
    errors.expiryDate = 'Expiry date is required'
  } else {
    const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/)
    if (!match) {
      errors.expiryDate = 'Expiry must be in MM/YY format'
    } else {
      const month = parseInt(match[1], 10)
      let year = parseInt(match[2], 10)
      if (year < 100) year += 2000
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Card has expired'
      } else if (year > currentYear + 20) {
        errors.expiryDate = 'Expiry year is too far in future'
      }
    }
  }

  // 4. CVV
  if (!cvv) {
    errors.cvv = 'CVV is required'
  } else if (!/^\d{3,4}$/.test(cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits'
  }

  const valid = Object.keys(errors).length === 0
  return {
    valid,
    errors,
    brand: valid ? detectCardBrand(rawNumber) : undefined,
    last4: rawNumber.length >= 4 ? rawNumber.slice(-4) : undefined,
  }
}

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: User
  token?: string
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  const db = readDB()
  const session = db.sessions[token]
  if (!session) {
    return next()
  }

  const user = db.users.find((u) => u.id === session.userId)
  if (user) {
    req.user = user
    req.token = token
  }
  next()
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }
  next()
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }
  next()
}

async function startServer() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '15mb' }))
  app.use(authenticateToken)

  // --- API Routes ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() })
  })

  // --- 1. Authentication Endpoints ---

  // Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email address format' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }

    const db = readDB()
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' })
    }

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    db.users.push(newUser)
    db.userData[newUser.id] = { cart: {}, wishlist: [] }

    // Create session token
    const token = 'tok_' + crypto.randomBytes(24).toString('hex')
    db.sessions[token] = { userId: newUser.id, createdAt: Date.now() }
    writeDB(db)

    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    res.status(201).json({ success: true, token, user: safeUser })
  })

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const db = readDB()
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex')
    db.sessions[token] = { userId: user.id, createdAt: Date.now() }
    writeDB(db)

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    res.json({ success: true, token, user: safeUser })
  })

  // Admin Login
  app.post('/api/auth/admin-login', (req, res) => {
    const { email, password } = req.body
    const cleanEmail = (email || '').trim().toLowerCase()

    if (cleanEmail === 'admin@123.com' && password === 'admin123') {
      const db = readDB()
      let admin = db.users.find((u) => u.email.toLowerCase() === cleanEmail)
      if (!admin) {
        admin = {
          id: 'admin_1',
          name: 'Administrator',
          email: 'admin@123.com',
          passwordHash: hashPassword('admin123'),
          role: 'admin',
          createdAt: new Date().toISOString(),
        }
        db.users.push(admin)
      }

      const token = 'adm_' + crypto.randomBytes(24).toString('hex')
      db.sessions[token] = { userId: admin.id, createdAt: Date.now() }
      writeDB(db)

      return res.json({
        success: true,
        token,
        user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
      })
    }

    // Otherwise check regular user with admin role
    const db = readDB()
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail && u.role === 'admin')
    if (user && user.passwordHash === hashPassword(password)) {
      const token = 'adm_' + crypto.randomBytes(24).toString('hex')
      db.sessions[token] = { userId: user.id, createdAt: Date.now() }
      writeDB(db)
      return res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: 'admin' },
      })
    }

    return res.status(401).json({ success: false, error: 'Invalid admin credentials' })
  })

  // Current session info
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const u = req.user!
    res.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        address: u.address,
        city: u.city,
        state: u.state,
        zip: u.zip,
        country: u.country,
      },
    })
  })

  // Logout
  app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
    if (req.token) {
      const db = readDB()
      delete db.sessions[req.token]
      writeDB(db)
    }
    res.json({ success: true, message: 'Logged out successfully' })
  })

  // Forgot Password
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const db = readDB()
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!user) {
      // Don't leak user existence for security, but return friendly message
      return res.json({
        success: true,
        message: 'If that email exists in our records, password reset instructions have been generated.',
      })
    }

    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetExpiry = Date.now() + 30 * 60 * 1000 // 30 minutes

    user.resetToken = resetToken
    user.resetTokenExpiry = resetExpiry
    writeDB(db)

    const resetUrl = `/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`

    res.json({
      success: true,
      message: 'Password reset instructions have been sent.',
      resetToken,
      resetUrl,
      demoHint: `Click the reset link or visit: ${resetUrl}`,
    })
  })

  // Reset Password
  app.post('/api/auth/reset-password', (req, res) => {
    const { email, token, newPassword } = req.body
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, token, and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const db = readDB()
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        u.resetToken === token &&
        u.resetTokenExpiry &&
        u.resetTokenExpiry > Date.now()
    )

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset link. Please request a new one.',
      })
    }

    user.passwordHash = hashPassword(newPassword)
    user.resetToken = null
    user.resetTokenExpiry = null
    writeDB(db)

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in.',
    })
  })

  // --- 2. User Private Account Data ---

  // Get User Profile
  app.get('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const u = req.user!
    res.json({
      success: true,
      profile: {
        id: u.id,
        name: u.name,
        fullName: u.fullName || u.name,
        email: u.email,
        phone: u.phone || '',
        province: u.province || '',
        district: u.district || '',
        municipality: u.municipality || '',
        ward: u.ward || '',
        tole: u.tole || '',
        houseNo: u.houseNo || '',
        postalCode: u.postalCode || '',
        deliveryInstructions: u.deliveryInstructions || '',
        address: u.address || '',
        city: u.city || '',
        state: u.state || '',
        zip: u.zip || '',
        country: u.country || 'Nepal',
      },
    })
  })

  // Update User Profile
  app.put('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const u = req.user!
    const {
      name,
      fullName,
      phone,
      province,
      district,
      municipality,
      ward,
      tole,
      houseNo,
      postalCode,
      deliveryInstructions,
      address,
      city,
      state,
      zip,
      country,
    } = req.body
    const db = readDB()
    const target = db.users.find((usr) => usr.id === u.id)
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (name) target.name = name.trim()
    if (fullName) target.fullName = fullName.trim()
    if (phone !== undefined) target.phone = phone.trim()
    if (province !== undefined) target.province = province.trim()
    if (district !== undefined) target.district = district.trim()
    if (municipality !== undefined) target.municipality = municipality.trim()
    if (ward !== undefined) target.ward = String(ward).trim()
    if (tole !== undefined) target.tole = tole.trim()
    if (houseNo !== undefined) target.houseNo = houseNo.trim()
    if (postalCode !== undefined) target.postalCode = postalCode.trim()
    if (deliveryInstructions !== undefined) target.deliveryInstructions = deliveryInstructions.trim()

    // Formulate backwards-compatible composite address if not specified directly
    const compositeAddress = [
      target.houseNo ? `House ${target.houseNo}` : '',
      target.tole || '',
      target.ward ? `Ward ${target.ward}` : '',
      target.municipality || '',
    ]
      .filter(Boolean)
      .join(', ')

    target.address = address !== undefined ? address.trim() : (compositeAddress || target.address)
    target.city = city !== undefined ? city.trim() : (target.district || target.city)
    target.state = state !== undefined ? state.trim() : (target.province || target.state)
    target.zip = postalCode !== undefined ? postalCode.trim() : (zip !== undefined ? zip.trim() : target.zip)
    target.country = country !== undefined ? country.trim() : 'Nepal'

    writeDB(db)
    res.json({ success: true, profile: target })
  })

  // Get User Cart
  app.get('/api/user/cart', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    const userData = db.userData[req.user!.id] || { cart: {}, wishlist: [] }
    res.json({ success: true, cart: userData.cart || {} })
  })

  // Update User Cart
  app.put('/api/user/cart', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    if (!db.userData[req.user!.id]) {
      db.userData[req.user!.id] = { cart: {}, wishlist: [] }
    }
    db.userData[req.user!.id].cart = req.body.cart || {}
    writeDB(db)
    res.json({ success: true, cart: db.userData[req.user!.id].cart })
  })

  // Get User Wishlist
  app.get('/api/user/wishlist', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    const userData = db.userData[req.user!.id] || { cart: {}, wishlist: [] }
    res.json({ success: true, wishlist: userData.wishlist || [] })
  })

  // Toggle Item in Wishlist
  app.post('/api/user/wishlist/toggle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.body
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' })
    }

    const db = readDB()
    if (!db.userData[req.user!.id]) {
      db.userData[req.user!.id] = { cart: {}, wishlist: [] }
    }

    let list = db.userData[req.user!.id].wishlist || []
    if (list.includes(productId)) {
      list = list.filter((id) => id !== productId)
    } else {
      list.push(productId)
    }

    db.userData[req.user!.id].wishlist = list
    writeDB(db)
    res.json({ success: true, wishlist: list })
  })

  // Get User Orders (Protected: users can ONLY access their own orders)
  app.get('/api/user/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    const u = req.user!
    const userOrders = db.orders.filter(
      (o) => o.userId === u.id || o.userEmail.toLowerCase() === u.email.toLowerCase()
    )
    res.json({ success: true, orders: userOrders })
  })

  // --- 3. Payment & Order Processing ---

  // Validate card endpoint
  const handleValidateCard = (req: Request, res: Response) => {
    const result = validateCardDetails(req.body)
    if (!result.valid) {
      return res.status(400).json({ success: false, errors: result.errors })
    }
    res.json({ success: true, brand: result.brand, last4: result.last4 })
  }
  app.post('/api/payment/validate-card', handleValidateCard)
  app.post('/api/payments/validate-card', handleValidateCard)

  // Place Order with Nepal Payment Processing
  app.post('/api/orders', (req: AuthenticatedRequest, res: Response) => {
    const { deliveryInfo, items, method, paymentDetails, total } = req.body

    // Delivery info validation for Nepal
    if (!deliveryInfo) {
      return res.status(400).json({ success: false, error: 'Complete delivery information is required' })
    }

    const recipientName = (deliveryInfo.fullName || `${deliveryInfo.firstName || ''} ${deliveryInfo.lastName || ''}`).trim()
    const email = (deliveryInfo.email || '').trim().toLowerCase()
    const phone = (deliveryInfo.phone || '').trim()
    const province = (deliveryInfo.province || deliveryInfo.state || '').trim()
    const district = (deliveryInfo.district || deliveryInfo.city || '').trim()
    const municipality = (deliveryInfo.municipality || '').trim()
    const ward = (deliveryInfo.ward || '').toString().trim()
    const tole = (deliveryInfo.tole || deliveryInfo.address || '').trim()

    if (!recipientName) {
      return res.status(400).json({ success: false, error: 'Recipient full name is required' })
    }
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' })
    }
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Contact phone number (+977 format) is required' })
    }
    if (!province) {
      return res.status(400).json({ success: false, error: 'Province is required' })
    }
    if (!district) {
      return res.status(400).json({ success: false, error: 'District is required' })
    }
    if (!municipality) {
      return res.status(400).json({ success: false, error: 'Municipality / Rural Municipality is required' })
    }
    if (!ward) {
      return res.status(400).json({ success: false, error: 'Ward number is required' })
    }
    if (!tole) {
      return res.status(400).json({ success: false, error: 'Tole / Street address is required' })
    }

    // Items check
    if (!items || Object.keys(items).length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot checkout with an empty cart' })
    }

    let paymentRecord: Order['payment']
    const normalizedMethod = (method || '').toLowerCase()

    if (normalizedMethod === 'esewa') {
      const esewaId = (paymentDetails?.esewaId || '').trim()
      const mpin = (paymentDetails?.mpin || '').trim()

      if (!esewaId) {
        return res.status(400).json({
          success: false,
          error: 'eSewa ID (Mobile Number or Email) is required for payment',
        })
      }
      if (!mpin || mpin.length < 4) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your 4-digit eSewa MPIN',
        })
      }

      const txnId = 'ESEWA_' + Date.now().toString(36).toUpperCase() + '_' + crypto.randomBytes(3).toString('hex').toUpperCase()
      paymentRecord = {
        method: 'esewa',
        status: 'Paid',
        transactionId: txnId,
        esewaId,
        paidAt: new Date().toISOString(),
        amount: total,
        currency: 'NPR',
      }
    } else if (normalizedMethod === 'khalti') {
      const khaltiNumber = (paymentDetails?.khaltiNumber || '').trim()
      const mpin = (paymentDetails?.mpin || '').trim()

      if (!khaltiNumber) {
        return res.status(400).json({
          success: false,
          error: 'Registered Khalti Mobile number is required',
        })
      }
      if (!mpin || mpin.length < 4) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your 4-digit Khalti MPIN',
        })
      }

      const txnId = 'KHALTI_' + Date.now().toString(36).toUpperCase() + '_' + crypto.randomBytes(3).toString('hex').toUpperCase()
      paymentRecord = {
        method: 'khalti',
        status: 'Paid',
        transactionId: txnId,
        khaltiNumber,
        paidAt: new Date().toISOString(),
        amount: total,
        currency: 'NPR',
      }
    } else if (normalizedMethod === 'bank_transfer') {
      const bankName = (paymentDetails?.bankName || '').trim()
      const referenceId = (paymentDetails?.referenceId || paymentDetails?.senderAccount || '').trim()

      if (!bankName) {
        return res.status(400).json({
          success: false,
          error: 'Please select or enter the originating bank name',
        })
      }
      if (!referenceId) {
        return res.status(400).json({
          success: false,
          error: 'Please provide the transaction reference ID / Sender Account / Voucher Remarks',
        })
      }

      const txnId = 'FP_' + (referenceId ? referenceId.toUpperCase() : Date.now().toString(36).toUpperCase())
      paymentRecord = {
        method: 'bank_transfer',
        status: 'Paid (Fonepay / Bank Verified)',
        transactionId: txnId,
        bankName,
        senderAccount: paymentDetails?.senderAccount || referenceId,
        paidAt: new Date().toISOString(),
        amount: total,
        currency: 'NPR',
      }
    } else if (normalizedMethod === 'cod') {
      paymentRecord = {
        method: 'cod',
        status: 'Pending (Cash on Delivery)',
        paidAt: null,
        amount: total,
        currency: 'NPR',
      }
    } else if (normalizedMethod === 'card' || normalizedMethod === 'stripe' || normalizedMethod === 'razorpay') {
      const cardResult = validateCardDetails(paymentDetails || {})
      if (!cardResult.valid) {
        return res.status(400).json({
          success: false,
          error: 'Payment card validation failed. Please review your card details.',
          errors: cardResult.errors,
        })
      }

      const txnId = 'CARD_' + Date.now().toString(36).toUpperCase() + '_' + crypto.randomBytes(3).toString('hex').toUpperCase()
      paymentRecord = {
        method: 'card',
        status: 'Paid',
        transactionId: txnId,
        cardLast4: cardResult.last4,
        cardBrand: cardResult.brand,
        paidAt: new Date().toISOString(),
        amount: total,
        currency: 'NPR',
      }
    } else {
      return res.status(400).json({
        success: false,
        error: `Unsupported payment method: ${method}. Please choose eSewa, Khalti, Bank Transfer, Card, or Cash on Delivery.`,
      })
    }

    const db = readDB()
    const orderId = 'ORD' + Date.now()

    // Structured Nepal delivery info
    const fullDeliveryInfo: Order['deliveryInfo'] = {
      fullName: recipientName,
      phone,
      email,
      province,
      district,
      municipality,
      ward,
      tole,
      houseNo: deliveryInfo.houseNo || '',
      postalCode: deliveryInfo.postalCode || '',
      deliveryInstructions: deliveryInfo.deliveryInstructions || '',
      // Legacy compatibility
      firstName: recipientName.split(' ')[0],
      lastName: recipientName.split(' ').slice(1).join(' ') || '',
      address: `${tole}, Ward ${ward}, ${municipality}`,
      city: district,
      state: province,
      zip: deliveryInfo.postalCode || '44600',
      country: 'Nepal',
    }

    const newOrder: Order = {
      id: orderId,
      userId: req.user ? req.user.id : null,
      userEmail: email,
      date: new Date().toISOString(),
      items,
      total,
      currency: 'NPR',
      status: 'Processing',
      deliveryInfo: fullDeliveryInfo,
      payment: paymentRecord,
    }

    db.orders.unshift(newOrder)

    // If authenticated user, clear user's cart in DB and save address to profile for future reuse
    if (req.user) {
      if (db.userData[req.user.id]) {
        db.userData[req.user.id].cart = {}
      }
      const u = db.users.find((usr) => usr.id === req.user!.id)
      if (u) {
        u.fullName = recipientName
        u.phone = phone
        u.province = province
        u.district = district
        u.municipality = municipality
        u.ward = ward
        u.tole = tole
        u.houseNo = deliveryInfo.houseNo || u.houseNo
        u.postalCode = deliveryInfo.postalCode || u.postalCode
        u.deliveryInstructions = deliveryInfo.deliveryInstructions || u.deliveryInstructions
        u.address = fullDeliveryInfo.address
        u.city = district
        u.state = province
        u.country = 'Nepal'
      }
    }

    writeDB(db)

    let successMessage = 'Payment processed successfully! Your order has been placed.'
    if (paymentRecord.method === 'cod') {
      successMessage = 'Order placed successfully with Cash on Delivery!'
    } else if (paymentRecord.method === 'esewa') {
      successMessage = 'eSewa payment verified successfully! Your order has been placed.'
    } else if (paymentRecord.method === 'khalti') {
      successMessage = 'Khalti payment verified successfully! Your order has been placed.'
    } else if (paymentRecord.method === 'bank_transfer') {
      successMessage = 'Bank transfer reference recorded! Order is being processed.'
    }

    res.status(201).json({
      success: true,
      orderId,
      order: newOrder,
      message: successMessage,
    })
  })

  // --- 4. Admin Management Endpoints ---

  app.get('/api/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    res.json({ success: true, orders: db.orders })
  })

  app.put('/api/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' })
    }

    const db = readDB()
    const order = db.orders.find((o) => o.id === req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    order.status = status
    writeDB(db)
    res.json({ success: true, order })
  })

  // --- 5. Products Endpoints ---

  app.get('/api/products', (req, res) => {
    const db = readDB()
    res.json({ success: true, products: db.products || [] })
  })

  app.post('/api/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { name, description, price, category, subCategory, sizes, bestseller, image } = req.body
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name and price are required' })
    }

    const db = readDB()
    const newProduct = {
      _id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price) || 0,
      category: category || 'Women',
      subCategory: subCategory || 'Topwear',
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L'],
      bestseller: Boolean(bestseller),
      image: image || [],
      date: Date.now(),
    }

    if (!Array.isArray(db.products)) {
      db.products = []
    }
    db.products.unshift(newProduct)
    writeDB(db)

    res.status(201).json({ success: true, product: newProduct })
  })

  app.put('/api/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    const prod = (db.products || []).find((p) => p._id === req.params.id)
    if (!prod) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    const { name, description, price, category, subCategory, sizes, bestseller, image } = req.body
    if (name) prod.name = name.trim()
    if (description !== undefined) prod.description = description.trim()
    if (price !== undefined) prod.price = Number(price)
    if (category) prod.category = category
    if (subCategory) prod.subCategory = subCategory
    if (sizes) prod.sizes = sizes
    if (bestseller !== undefined) prod.bestseller = Boolean(bestseller)
    if (image) prod.image = image

    writeDB(db)
    res.json({ success: true, product: prod })
  })

  app.delete('/api/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = readDB()
    const index = (db.products || []).findIndex((p) => p._id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    db.products.splice(index, 1)
    writeDB(db)
    res.json({ success: true, message: 'Product deleted' })
  })

  // --- Vite Middleware for Development / Static Production Serving ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(process.cwd(), 'dist')
    app.use(express.static(distPath))
    // Express 5 route matching
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pachheuri full-stack server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
