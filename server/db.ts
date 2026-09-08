import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'user' | 'admin'
  phone?: string
  fullName?: string
  province?: string
  district?: string
  municipality?: string
  ward?: string
  tole?: string
  houseNo?: string
  postalCode?: string
  deliveryInstructions?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  createdAt: string
  resetToken?: string | null
  resetTokenExpiry?: number | null
}

export interface Order {
  id: string
  userId?: string | null
  userEmail: string
  date: string
  items: Record<string, Record<string, number>>
  total: number
  currency: string
  status: string
  deliveryInfo: {
    fullName: string
    phone: string
    email: string
    province: string
    district: string
    municipality: string
    ward: string
    tole: string
    houseNo?: string
    postalCode?: string
    deliveryInstructions?: string
    // Legacy fallbacks
    firstName?: string
    lastName?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  payment: {
    method: 'esewa' | 'khalti' | 'bank_transfer' | 'cod' | 'card' | string
    status: string
    transactionId?: string
    esewaId?: string
    khaltiNumber?: string
    bankName?: string
    senderAccount?: string
    cardLast4?: string
    cardBrand?: string
    paidAt?: string | null
    amount: number
    currency: string
  }
}

export interface UserData {
  cart: Record<string, Record<string, number>>
  wishlist: string[]
}

export interface DBData {
  users: User[]
  userData: Record<string, UserData>
  orders: Order[]
  products: any[]
  sessions: Record<string, { userId: string; createdAt: number }>
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'store.json')

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'pachheuri_salt_key').digest('hex')
}

// Initial DB state localized for Nepal
const initialData: DBData = {
  users: [
    {
      id: 'admin_1',
      name: 'Store Administrator',
      email: 'admin@123.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      phone: '+977 9868713835',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      ward: '1',
      tole: 'Durbarmarg',
      country: 'Nepal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_demo_1',
      name: 'Pooja Shrestha',
      email: 'demo@user.com',
      passwordHash: hashPassword('password123'),
      role: 'user',
      phone: '+977 9841234567',
      fullName: 'Pooja Shrestha',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      ward: '3',
      tole: 'Lazimpat, Uttar Dhoka',
      houseNo: 'House 42',
      postalCode: '44600',
      deliveryInstructions: 'Near Embassy of France, please call 10 mins prior',
      address: 'Lazimpat, Uttar Dhoka, Ward 3',
      city: 'Kathmandu',
      state: 'Bagmati Province',
      zip: '44600',
      country: 'Nepal',
      createdAt: new Date().toISOString(),
    },
  ],
  userData: {
    admin_1: {
      cart: {},
      wishlist: [],
    },
    user_demo_1: {
      cart: {},
      wishlist: ['aaaaa', 'aaaab'],
    },
  },
  orders: [
    {
      id: 'ORD1720000000001',
      userId: 'user_demo_1',
      userEmail: 'demo@user.com',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      items: {
        aaaaa: { M: 1, L: 1 },
      },
      total: 2650,
      currency: 'NPR',
      status: 'Delivered',
      deliveryInfo: {
        fullName: 'Pooja Shrestha',
        firstName: 'Pooja',
        lastName: 'Shrestha',
        email: 'demo@user.com',
        phone: '+977 9841234567',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        ward: '3',
        tole: 'Lazimpat, Uttar Dhoka',
        houseNo: 'House 42',
        postalCode: '44600',
        deliveryInstructions: 'Near Embassy of France, please call 10 mins prior',
        address: 'Lazimpat, Uttar Dhoka, Ward 3',
        city: 'Kathmandu',
        state: 'Bagmati Province',
        zip: '44600',
        country: 'Nepal',
      },
      payment: {
        method: 'esewa',
        status: 'Paid',
        transactionId: 'ESEWA_9841_TXN284910',
        esewaId: '9841234567',
        paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        amount: 2650,
        currency: 'NPR',
      },
    },
  ],
  products: [],
  sessions: {},
}

let inMemoryDB: DBData | null = null

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readDB(): DBData {
  if (inMemoryDB) return inMemoryDB

  ensureDataDir()
  if (!fs.existsSync(DB_FILE)) {
    inMemoryDB = JSON.parse(JSON.stringify(initialData))
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDB, null, 2), 'utf-8')
    return inMemoryDB
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    inMemoryDB = JSON.parse(raw)
    // Ensure all top-level keys exist
    if (!inMemoryDB) inMemoryDB = JSON.parse(JSON.stringify(initialData))
    if (!inMemoryDB.users) inMemoryDB.users = initialData.users
    if (!inMemoryDB.userData) inMemoryDB.userData = initialData.userData
    if (!inMemoryDB.orders) inMemoryDB.orders = initialData.orders
    if (!inMemoryDB.products) inMemoryDB.products = initialData.products
    if (!inMemoryDB.sessions) inMemoryDB.sessions = initialData.sessions

    // Ensure default admin always exists for easy access
    const hasAdmin = inMemoryDB.users.some((u) => u.email === 'admin@123.com')
    if (!hasAdmin) {
      inMemoryDB.users.push(initialData.users[0])
    }

    return inMemoryDB
  } catch (err) {
    console.error('Error reading store.json, reinitializing:', err)
    inMemoryDB = JSON.parse(JSON.stringify(initialData))
    return inMemoryDB
  }
}

export function writeDB(data: DBData): void {
  inMemoryDB = data
  try {
    ensureDataDir()
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing store.json:', err)
  }
}

export { hashPassword }
