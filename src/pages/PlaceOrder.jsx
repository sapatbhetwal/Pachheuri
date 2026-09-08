import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import {
  PROVINCES,
  NEPAL_DISTRICTS_BY_PROVINCE,
  COMMON_MUNICIPALITIES,
  POSTAL_CODES_BY_DISTRICT,
  NEPAL_COMMERCIAL_BANKS,
  isValidNepalPhone,
  getDeliveryFeeByDistrict,
} from '../data/nepalLocationData'
import {
  EsewaBadge,
  KhaltiBadge,
  FonepayBadge,
  SctCardBadge,
  CodBadge,
} from '../components/NepalPaymentBadges'

// Luhn algorithm helper
function checkLuhn(cardNo) {
  const digits = cardNo.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let isEven = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10)
    if (isEven) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    isEven = !isEven
  }
  return sum % 10 === 0
}

function getCardBrand(num) {
  const clean = num.replace(/\D/g, '')
  if (/^5081|^604|^62/.test(clean)) return 'SCT (Smart Choice Technologies)'
  if (/^4/.test(clean)) return 'Visa'
  if (/^5[1-5]|^2[2-7]/.test(clean)) return 'Mastercard'
  if (/^3[47]/.test(clean)) return 'American Express'
  return ''
}

const PlaceOrder = () => {
  const { getCartAmount, currency, placeOrder, cartItems, user, profile } =
    useContext(ShopContext)
  const navigate = useNavigate()

  // Nepal Payment Methods: esewa, khalti, bank_transfer, cod, card
  const [method, setMethod] = useState('esewa')
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [successOrder, setSuccessOrder] = useState(null)

  // Nepal Delivery Information Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    ward: '10',
    tole: '',
    houseNo: '',
    postalCode: '44600',
    country: 'Nepal',
    deliveryInstructions: '',
  })

  // Payment fields for each method
  const [esewaData, setEsewaData] = useState({
    esewaId: '',
    mpin: '',
  })

  const [khaltiData, setKhaltiData] = useState({
    khaltiNumber: '',
    khaltiPin: '',
  })

  const [bankData, setBankData] = useState({
    bankName: 'Nabil Bank Ltd.',
    senderAccount: '',
    referenceId: '',
  })

  const [cardData, setCardData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  })

  const [fieldErrors, setFieldErrors] = useState({})

  // Prefill with user profile if authenticated
  useEffect(() => {
    if (user) {
      const province = profile?.province || 'Bagmati Province'
      const district = profile?.district || (NEPAL_DISTRICTS_BY_PROVINCE[province]?.[0] || 'Kathmandu')
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile?.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '',
        province: profile?.province || prev.province,
        district: district,
        municipality: profile?.municipality || profile?.city || prev.municipality,
        ward: profile?.ward || prev.ward,
        tole: profile?.tole || profile?.address || prev.tole,
        houseNo: profile?.houseNo || prev.houseNo,
        postalCode: profile?.postalCode || profile?.zip || POSTAL_CODES_BY_DISTRICT[district] || '44600',
        country: 'Nepal',
        deliveryInstructions: profile?.deliveryInstructions || prev.deliveryInstructions,
      }))
    }
  }, [user, profile])

  // Dynamic delivery fee calculation based on selected district
  const currentDeliveryFee = getDeliveryFeeByDistrict(formData.district)
  const cartSubtotal = getCartAmount()
  const orderTotal = cartSubtotal + currentDeliveryFee

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value
    const districtList = NEPAL_DISTRICTS_BY_PROVINCE[newProvince] || []
    const firstDistrict = districtList[0] || 'Kathmandu'
    const muniList = COMMON_MUNICIPALITIES[firstDistrict] || []
    setFormData((prev) => ({
      ...prev,
      province: newProvince,
      district: firstDistrict,
      municipality: muniList[0] || '',
      postalCode: POSTAL_CODES_BY_DISTRICT[firstDistrict] || '44600',
    }))
  }

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value
    const muniList = COMMON_MUNICIPALITIES[newDistrict] || []
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      municipality: muniList[0] || prev.municipality,
      postalCode: POSTAL_CODES_BY_DISTRICT[newDistrict] || prev.postalCode,
    }))
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }))
    }
  }

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 19)
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardData({ ...cardData, cardNumber: formatted })
    if (fieldErrors.cardNumber) {
      setFieldErrors((prev) => ({ ...prev, cardNumber: null }))
    }
  }

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (raw.length > 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2)
    }
    setCardData({ ...cardData, expiryDate: raw })
    if (fieldErrors.expiryDate) {
      setFieldErrors((prev) => ({ ...prev, expiryDate: null }))
    }
  }

  // Format CVV (3-4 digits)
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCardData({ ...cardData, cvv: raw })
    if (fieldErrors.cvv) {
      setFieldErrors((prev) => ({ ...prev, cvv: null }))
    }
  }

  // Quick fill test credentials for Nepal payment gateways
  const handleFillTestPayment = (type) => {
    setErrorBanner('')
    setFieldErrors({})

    if (type === 'esewa') {
      setEsewaData({
        esewaId: '9841234567',
        mpin: '1234',
      })
    } else if (type === 'khalti') {
      setKhaltiData({
        khaltiNumber: '9801234567',
        khaltiPin: '1234',
      })
    } else if (type === 'bank') {
      setBankData({
        bankName: 'Nabil Bank Ltd.',
        senderAccount: '019010002847190',
        referenceId: `FPAY-NP-${Math.floor(10000 + Math.random() * 90000)}`,
      })
    } else if (type === 'sct_card') {
      setCardData({
        cardHolder: formData.fullName || 'Aayush Shrestha',
        cardNumber: '5081 2233 4455 6677',
        expiryDate: '10/28',
        cvv: '567',
      })
    } else if (type === 'visa_card') {
      setCardData({
        cardHolder: formData.fullName || 'Aayush Shrestha',
        cardNumber: '4242 4242 4242 4242',
        expiryDate: '12/28',
        cvv: '123',
      })
    }
  }

  const validatePaymentDetails = () => {
    const errors = {}

    if (method === 'esewa') {
      if (!esewaData.esewaId || !esewaData.esewaId.trim()) {
        errors.esewaId = 'eSewa ID (Mobile Number) is required'
      } else if (!/^(\+977)?[9][78]\d{8}$/.test(esewaData.esewaId.replace(/\s+/g, ''))) {
        errors.esewaId = 'Enter a valid 10-digit Nepal mobile number'
      }
      if (!esewaData.mpin || !esewaData.mpin.trim()) {
        errors.esewaMpin = '4-digit MPIN is required'
      } else if (!/^\d{4}$/.test(esewaData.mpin.trim())) {
        errors.esewaMpin = 'MPIN must be exactly 4 digits'
      }
    } else if (method === 'khalti') {
      if (!khaltiData.khaltiNumber || !khaltiData.khaltiNumber.trim()) {
        errors.khaltiNumber = 'Khalti Mobile Number is required'
      } else if (!/^(\+977)?[9][78]\d{8}$/.test(khaltiData.khaltiNumber.replace(/\s+/g, ''))) {
        errors.khaltiNumber = 'Enter a valid 10-digit Nepal mobile number'
      }
      if (!khaltiData.khaltiPin || !khaltiData.khaltiPin.trim()) {
        errors.khaltiPin = '4-digit Khalti PIN is required'
      } else if (!/^\d{4}$/.test(khaltiData.khaltiPin.trim())) {
        errors.khaltiPin = 'PIN must be exactly 4 digits'
      }
    } else if (method === 'bank_transfer') {
      if (!bankData.bankName) {
        errors.bankName = 'Please select a bank'
      }
      if (!bankData.senderAccount?.trim() && !bankData.referenceId?.trim()) {
        errors.bankAccount = 'Please provide Sender Account or Fonepay Ref ID'
      }
    } else if (method === 'card') {
      const rawNum = cardData.cardNumber.replace(/\D/g, '')
      if (!cardData.cardHolder.trim()) {
        errors.cardHolder = 'Cardholder name is required'
      }
      if (!rawNum) {
        errors.cardNumber = 'Card number is required'
      } else if (rawNum.length < 13 || rawNum.length > 19) {
        errors.cardNumber = 'Card number must be 13-19 digits'
      } else if (!checkLuhn(rawNum)) {
        errors.cardNumber = 'Invalid card number (checksum failed)'
      }

      if (!cardData.expiryDate) {
        errors.expiryDate = 'Expiry date required'
      } else {
        const match = cardData.expiryDate.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/)
        if (!match) {
          errors.expiryDate = 'Use MM/YY'
        } else {
          const month = parseInt(match[1], 10)
          let year = parseInt(match[2], 10)
          if (year < 100) year += 2000
          const now = new Date()
          const currentYear = now.getFullYear()
          const currentMonth = now.getMonth() + 1
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            errors.expiryDate = 'Card has expired'
          }
        }
      }

      if (!cardData.cvv) {
        errors.cvv = 'CVV required'
      } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
        errors.cvv = '3-4 digits'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorBanner('')

    // 1. Validate Nepal Delivery Fields
    if (!formData.fullName.trim()) {
      setErrorBanner('Please enter your full name.')
      return
    }
    if (!formData.phone.trim()) {
      setErrorBanner('Please enter your phone number in Nepal.')
      return
    }
    if (!isValidNepalPhone(formData.phone)) {
      setErrorBanner('Please enter a valid Nepal phone number (e.g. 9841234567 or +977 98...)')
      return
    }
    if (!formData.province) {
      setErrorBanner('Please select a province.')
      return
    }
    if (!formData.district) {
      setErrorBanner('Please select a district.')
      return
    }
    if (!formData.municipality?.trim()) {
      setErrorBanner('Please specify your municipality / rural municipality.')
      return
    }
    if (!formData.ward?.trim()) {
      setErrorBanner('Please specify your ward number.')
      return
    }
    if (!formData.tole?.trim()) {
      setErrorBanner('Please provide your tole / street / neighborhood.')
      return
    }
    if (!formData.postalCode?.trim()) {
      setErrorBanner('Please provide your Nepal postal code.')
      return
    }

    // 2. Validate Payment Details
    if (method !== 'cod') {
      const isPaymentValid = validatePaymentDetails()
      if (!isPaymentValid) {
        setErrorBanner('Please check the required payment fields highlighted below.')
        return
      }
    }

    setLoading(true)

    try {
      // Build delivery payload compatible with both Nepal structure & legacy fields
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0] || 'Customer'
      const lastName = nameParts.slice(1).join(' ') || ''
      const legacyAddress = `${formData.houseNo ? `House ${formData.houseNo}, ` : ''}${formData.tole}, Ward ${formData.ward}, ${formData.municipality}`

      const deliveryPayload = {
        ...formData,
        firstName,
        lastName,
        address: legacyAddress,
        city: formData.district,
        state: formData.province,
        zip: formData.postalCode,
        country: 'Nepal',
        deliveryFee: currentDeliveryFee,
      }

      let paymentPayload = null
      if (method === 'esewa') {
        paymentPayload = {
          esewaId: esewaData.esewaId.trim(),
          mpin: esewaData.mpin.trim(),
        }
      } else if (method === 'khalti') {
        paymentPayload = {
          khaltiNumber: khaltiData.khaltiNumber.trim(),
          khaltiPin: khaltiData.khaltiPin.trim(),
        }
      } else if (method === 'bank_transfer') {
        paymentPayload = {
          bankName: bankData.bankName,
          senderAccount: bankData.senderAccount.trim(),
          referenceId: bankData.referenceId.trim(),
        }
      } else if (method === 'card') {
        paymentPayload = {
          cardHolder: cardData.cardHolder.trim(),
          cardNumber: cardData.cardNumber,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
        }
      }

      const order = await placeOrder({
        deliveryInfo: deliveryPayload,
        method,
        paymentDetails: paymentPayload,
      })

      setLoading(false)
      setSuccessOrder(order)
    } catch (err) {
      setLoading(false)
      setErrorBanner(err.message || 'Order placement failed. Please review your details and try again.')
    }
  }

  if (Object.keys(cartItems).length === 0 && !successOrder) {
    return (
      <div className="section-padding py-20 text-center">
        <h2 className="font-prata text-2xl mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary cursor-pointer">
          Shop Now
        </button>
      </div>
    )
  }

  // --- Success State View ---
  if (successOrder) {
    const isCod = successOrder.payment?.method === 'cod'
    return (
      <div className="section-padding py-16 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-gray-100 rounded-2xl shadow-xl p-8 md:p-10 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-prata text-2xl text-neutral-900 mb-2">
            {isCod ? 'Order Confirmed!' : 'Payment Confirmed & Order Placed!'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Thank you, {successOrder.deliveryInfo.fullName || successOrder.deliveryInfo.firstName}. Your order has been placed successfully in Nepal.
          </p>

          <div className="bg-neutral-50 rounded-xl p-5 mb-6 text-left text-sm space-y-3 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-medium text-neutral-900">{successOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold text-neutral-900">
                {successOrder.payment?.method === 'esewa'
                  ? 'eSewa Nepal'
                  : successOrder.payment?.method === 'khalti'
                  ? 'Khalti Digital Wallet'
                  : successOrder.payment?.method === 'bank_transfer'
                  ? `Bank Transfer (${successOrder.payment?.bankName || 'Fonepay'})`
                  : successOrder.payment?.method === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : `${successOrder.payment?.cardBrand || 'Card'} (${successOrder.payment?.cardLast4 || '••'})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <span className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full text-xs ${
                successOrder.payment?.status?.includes('Paid')
                  ? 'text-emerald-700 bg-emerald-100/60'
                  : 'text-amber-700 bg-amber-100/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  successOrder.payment?.status?.includes('Paid') ? 'bg-emerald-600' : 'bg-amber-600'
                }`}></span>
                {successOrder.payment?.status || (isCod ? 'Pending on Delivery' : 'Paid')}
              </span>
            </div>
            {successOrder.payment?.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-neutral-700">{successOrder.payment.transactionId}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500 block mb-0.5">Delivery Destination:</span>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {[
                  successOrder.deliveryInfo.tole,
                  `Ward ${successOrder.deliveryInfo.ward}`,
                  successOrder.deliveryInfo.municipality,
                  successOrder.deliveryInfo.district,
                  successOrder.deliveryInfo.province,
                  'Nepal',
                ]
                  .filter(Boolean)
                  .join(', ')}
                {successOrder.deliveryInfo.phone ? ` • Ph: ${successOrder.deliveryInfo.phone}` : ''}
              </p>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-neutral-900 text-base">
              <span>Total Amount</span>
              <span>
                {currency}
                {(successOrder.total || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all shadow cursor-pointer"
            >
              View Order History
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const detectedBrand = getCardBrand(cardData.cardNumber)
  const districtList = NEPAL_DISTRICTS_BY_PROVINCE[formData.province] || []
  const municipalitySuggestions = COMMON_MUNICIPALITIES[formData.district] || []

  return (
    <div className="section-padding py-10 min-h-screen">
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
        <Link to="/cart" className="hover:text-neutral-900">Cart</Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium">Checkout & Nepal Payment</span>
      </div>

      {errorBanner && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
        {/* Delivery Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-prata text-2xl text-neutral-900">Nepal Delivery Information</h2>
            {user && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">
                Verified Customer
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Aayush Shrestha"
                value={formData.fullName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nepal Phone Number (+977) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-medium">🇳🇵 +977</span>
              <input
                type="tel"
                name="phone"
                placeholder="98XXXXXXXX or 01-XXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="input-field pl-20"
                required
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Supports NTC, Ncell, Smart Cell, or Kathmandu landline numbers</p>
          </div>

          {/* Province & District dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Province *</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleProvinceChange}
                className="input-field bg-white"
                required
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleDistrictChange}
                className="input-field bg-white"
                required
              >
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Municipality & Ward */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Municipality / Rural Municipality *
              </label>
              <input
                type="text"
                name="municipality"
                placeholder="e.g. Kathmandu Metropolitan City"
                value={formData.municipality}
                onChange={handleChange}
                list="checkout-municipality-list"
                className="input-field"
                required
              />
              <datalist id="checkout-municipality-list">
                {municipalitySuggestions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ward No. *</label>
              <input
                type="number"
                name="ward"
                min="1"
                max="35"
                placeholder="e.g. 10"
                value={formData.ward}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Tole / Street and House No */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tole / Street / Neighborhood *
              </label>
              <input
                type="text"
                name="tole"
                placeholder="e.g. New Road, Baneshwor, Thamel, Lakeside"
                value={formData.tole}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">House / Flat No.</label>
              <input
                type="text"
                name="houseNo"
                placeholder="e.g. 14 / Flat 3B"
                value={formData.houseNo}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Postal Code & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nepal Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                placeholder="e.g. 44600"
                value={formData.postalCode}
                onChange={handleChange}
                className="input-field font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value="Nepal"
                readOnly
                disabled
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Landmark / Delivery Instructions */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nearby Landmark / Delivery Instructions
            </label>
            <input
              type="text"
              name="deliveryInstructions"
              placeholder="e.g. Near Bhatbhateni Supermarket, Opposite to Global IME Bank"
              value={formData.deliveryInstructions}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="w-full lg:w-[460px]">
          <div className="bg-neutral-50 p-6 rounded-sm mb-6 border border-gray-100">
            <h3 className="font-prata text-xl text-neutral-900 mb-5">Order Summary (NPR)</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cart Items Total</span>
                <span className="font-medium">
                  {currency}
                  {cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Shipping / Delivery Fee</span>
                  <span className="text-[11px] text-gray-400">
                    {formData.district === 'Kathmandu' || formData.district === 'Lalitpur' || formData.district === 'Bhaktapur'
                      ? 'Inside Valley Flat Rate'
                      : 'Outside Valley Flat Rate'}
                  </span>
                </div>
                <span className="font-medium">
                  {currency}
                  {currentDeliveryFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold text-lg text-neutral-900">
                <span>Total Payable</span>
                <span className="text-neutral-900">
                  {currency}
                  {orderTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
              Select Nepal Payment Method
            </h3>
            <div className="space-y-2.5">
              {/* 1. eSewa */}
              <label
                onClick={() => setMethod('esewa')}
                className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                  method === 'esewa'
                    ? 'border-[#60bb46] bg-emerald-50/40 shadow-sm ring-1 ring-[#60bb46]/30'
                    : 'border-gray-200 bg-white hover:bg-neutral-50/60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    method === 'esewa' ? 'border-[#60bb46]' : 'border-gray-300'
                  }`}
                >
                  {method === 'esewa' && <div className="w-2 h-2 bg-[#60bb46] rounded-full"></div>}
                </div>
                <EsewaBadge />
                <span className="text-xs text-gray-500 ml-auto font-medium">Digital Wallet</span>
              </label>

              {/* 2. Khalti */}
              <label
                onClick={() => setMethod('khalti')}
                className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                  method === 'khalti'
                    ? 'border-[#5c2d91] bg-purple-50/40 shadow-sm ring-1 ring-[#5c2d91]/30'
                    : 'border-gray-200 bg-white hover:bg-neutral-50/60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    method === 'khalti' ? 'border-[#5c2d91]' : 'border-gray-300'
                  }`}
                >
                  {method === 'khalti' && <div className="w-2 h-2 bg-[#5c2d91] rounded-full"></div>}
                </div>
                <KhaltiBadge />
                <span className="text-xs text-gray-500 ml-auto font-medium">Digital Wallet</span>
              </label>

              {/* 3. Mobile Banking / Bank Transfer */}
              <label
                onClick={() => setMethod('bank_transfer')}
                className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                  method === 'bank_transfer'
                    ? 'border-[#d32f2f] bg-red-50/40 shadow-sm ring-1 ring-[#d32f2f]/30'
                    : 'border-gray-200 bg-white hover:bg-neutral-50/60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    method === 'bank_transfer' ? 'border-[#d32f2f]' : 'border-gray-300'
                  }`}
                >
                  {method === 'bank_transfer' && <div className="w-2 h-2 bg-[#d32f2f] rounded-full"></div>}
                </div>
                <FonepayBadge />
                <span className="text-xs text-gray-500 ml-auto font-medium">Nepal Banks</span>
              </label>

              {/* 4. SCT & Cards */}
              <label
                onClick={() => setMethod('card')}
                className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                  method === 'card'
                    ? 'border-neutral-900 bg-neutral-50/80 shadow-sm ring-1 ring-neutral-900/20'
                    : 'border-gray-200 bg-white hover:bg-neutral-50/60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    method === 'card' ? 'border-neutral-900' : 'border-gray-300'
                  }`}
                >
                  {method === 'card' && <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">Card Payment</span>
                  <SctCardBadge />
                </div>
                <span className="text-xs text-gray-500 ml-auto font-medium">Debit / Credit</span>
              </label>

              {/* 5. Cash on Delivery (COD) */}
              <label
                onClick={() => setMethod('cod')}
                className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                  method === 'cod'
                    ? 'border-neutral-900 bg-neutral-50/80 shadow-sm ring-1 ring-neutral-900/20'
                    : 'border-gray-200 bg-white hover:bg-neutral-50/60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    method === 'cod' ? 'border-neutral-900' : 'border-gray-300'
                  }`}
                >
                  {method === 'cod' && <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>}
                </div>
                <CodBadge />
                <span className="text-xs text-gray-500 ml-auto font-medium">Doorstep Cash</span>
              </label>
            </div>
          </div>

          {/* --- Form Section for eSewa --- */}
          {method === 'esewa' && (
            <div className="mb-6 p-4 bg-white border border-[#60bb46]/40 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60bb46] animate-pulse"></span>
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    eSewa Gateway (Nepal)
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#41a124] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  UAT Sandbox Active
                </span>
              </div>

              {/* Quick fill test helper */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center justify-between gap-2">
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold">Test Account:</span> 9841234567 • MPIN: 1234
                </div>
                <button
                  type="button"
                  onClick={() => handleFillTestPayment('esewa')}
                  className="bg-emerald-200 hover:bg-emerald-300 text-emerald-950 px-2.5 py-1 rounded font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Auto-fill Test eSewa
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  eSewa ID / Registered Mobile *
                </label>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={esewaData.esewaId}
                  onChange={(e) => {
                    setEsewaData({ ...esewaData, esewaId: e.target.value })
                    if (fieldErrors.esewaId) setFieldErrors((p) => ({ ...p, esewaId: null }))
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                    fieldErrors.esewaId ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#60bb46]'
                  }`}
                />
                {fieldErrors.esewaId && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.esewaId}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  eSewa 4-digit MPIN *
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={esewaData.mpin}
                  onChange={(e) => {
                    setEsewaData({ ...esewaData, mpin: e.target.value.replace(/\D/g, '') })
                    if (fieldErrors.esewaMpin) setFieldErrors((p) => ({ ...p, esewaMpin: null }))
                  }}
                  className={`w-full px-3 py-2 text-sm font-mono tracking-widest border rounded-md outline-none transition-colors ${
                    fieldErrors.esewaMpin ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#60bb46]'
                  }`}
                />
                {fieldErrors.esewaMpin && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.esewaMpin}</p>}
              </div>
            </div>
          )}

          {/* --- Form Section for Khalti --- */}
          {method === 'khalti' && (
            <div className="mb-6 p-4 bg-white border border-[#5c2d91]/40 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5c2d91] animate-pulse"></span>
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Khalti Payment Gateway
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#5c2d91] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  Sandbox Active
                </span>
              </div>

              {/* Quick fill test helper */}
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-lg p-2.5 text-xs text-purple-900 flex items-center justify-between gap-2">
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold">Test Khalti:</span> 9801234567 • PIN: 1234
                </div>
                <button
                  type="button"
                  onClick={() => handleFillTestPayment('khalti')}
                  className="bg-purple-200 hover:bg-purple-300 text-purple-950 px-2.5 py-1 rounded font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Auto-fill Test Khalti
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Khalti Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={khaltiData.khaltiNumber}
                  onChange={(e) => {
                    setKhaltiData({ ...khaltiData, khaltiNumber: e.target.value })
                    if (fieldErrors.khaltiNumber) setFieldErrors((p) => ({ ...p, khaltiNumber: null }))
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                    fieldErrors.khaltiNumber ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#5c2d91]'
                  }`}
                />
                {fieldErrors.khaltiNumber && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.khaltiNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Khalti 4-digit PIN *
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={khaltiData.khaltiPin}
                  onChange={(e) => {
                    setKhaltiData({ ...khaltiData, khaltiPin: e.target.value.replace(/\D/g, '') })
                    if (fieldErrors.khaltiPin) setFieldErrors((p) => ({ ...p, khaltiPin: null }))
                  }}
                  className={`w-full px-3 py-2 text-sm font-mono tracking-widest border rounded-md outline-none transition-colors ${
                    fieldErrors.khaltiPin ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#5c2d91]'
                  }`}
                />
                {fieldErrors.khaltiPin && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.khaltiPin}</p>}
              </div>
            </div>
          )}

          {/* --- Form Section for Mobile Banking / Bank Transfer --- */}
          {method === 'bank_transfer' && (
            <div className="mb-6 p-4 bg-white border border-[#d32f2f]/30 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f]"></span>
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Fonepay & Mobile Banking
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#d32f2f] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  Nepal Banking Network
                </span>
              </div>

              {/* Bank Account Info Card */}
              <div className="bg-neutral-50 rounded-lg p-3 text-xs border border-gray-200/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Name:</span>
                  <span className="font-semibold text-neutral-900">AURA LUXURY NEPAL PVT. LTD.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Number:</span>
                  <span className="font-mono font-bold text-neutral-900">019010002847190</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Branch:</span>
                  <span className="font-medium text-neutral-800">New Road, Kathmandu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fonepay Merchant ID:</span>
                  <span className="font-mono text-neutral-800">FPAY-9982-AURA</span>
                </div>
              </div>

              {/* Quick fill test helper */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleFillTestPayment('bank')}
                  className="bg-red-50 hover:bg-red-100 text-[#d32f2f] px-2.5 py-1 rounded font-medium text-[11px] border border-red-200 transition-colors cursor-pointer"
                >
                  Auto-fill Test Bank Info
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Your Nepal Bank *
                </label>
                <select
                  value={bankData.bankName}
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                  className="input-field bg-white"
                >
                  {NEPAL_COMMERCIAL_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Bank Account No. *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0192837465"
                    value={bankData.senderAccount}
                    onChange={(e) => {
                      setBankData({ ...bankData, senderAccount: e.target.value })
                      if (fieldErrors.bankAccount) setFieldErrors((p) => ({ ...p, bankAccount: null }))
                    }}
                    className={`w-full px-3 py-2 text-sm font-mono border rounded-md outline-none transition-colors ${
                      fieldErrors.bankAccount ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#d32f2f]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FPAY-NP-99824"
                    value={bankData.referenceId}
                    onChange={(e) => {
                      setBankData({ ...bankData, referenceId: e.target.value })
                      if (fieldErrors.bankAccount) setFieldErrors((p) => ({ ...p, bankAccount: null }))
                    }}
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-md outline-none focus:border-[#d32f2f]"
                  />
                </div>
              </div>
              {fieldErrors.bankAccount && <p className="text-[11px] text-red-600">{fieldErrors.bankAccount}</p>}
            </div>
          )}

          {/* --- Form Section for Card (SCT / Visa / Mastercard) --- */}
          {method === 'card' && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    SCT / International Cards
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Sandbox Active
                </span>
              </div>

              {/* Quick-fill helper */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold">Test Cards:</span> SCT or Visa
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillTestPayment('sct_card')}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    Use SCT Card
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillTestPayment('visa_card')}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    Use Visa
                  </button>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cardholder Name *</label>
                <input
                  type="text"
                  placeholder="Full Name as on card"
                  value={cardData.cardHolder}
                  onChange={(e) => {
                    setCardData({ ...cardData, cardHolder: e.target.value })
                    if (fieldErrors.cardHolder) setFieldErrors((p) => ({ ...p, cardHolder: null }))
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                    fieldErrors.cardHolder ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-neutral-900'
                  }`}
                />
                {fieldErrors.cardHolder && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.cardHolder}</p>}
              </div>

              {/* Card Number */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-gray-700">Card Number *</label>
                  {detectedBrand && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {detectedBrand}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="5081 2233 4455 6677 or 4242 4242 4242 4242"
                    value={cardData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={23}
                    className={`w-full px-3 py-2 text-sm font-mono border rounded-md outline-none transition-colors ${
                      fieldErrors.cardNumber ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-neutral-900'
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                {fieldErrors.cardNumber && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.cardNumber}</p>}
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className={`w-full px-3 py-2 text-sm font-mono border rounded-md outline-none transition-colors ${
                      fieldErrors.expiryDate ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-neutral-900'
                    }`}
                  />
                  {fieldErrors.expiryDate && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.expiryDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Security Code (CVV) *</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleCvvChange}
                    maxLength={4}
                    className={`w-full px-3 py-2 text-sm font-mono border rounded-md outline-none transition-colors ${
                      fieldErrors.cvv ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-neutral-900'
                    }`}
                  />
                  {fieldErrors.cvv && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          {/* --- Notice for Cash on Delivery --- */}
          {method === 'cod' && (
            <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-xs text-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No Advance Payment Required</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Pay in cash directly to our delivery partner when your package arrives at your doorstep in{' '}
                <span className="font-semibold text-neutral-900">{formData.tole || formData.district || 'Nepal'}</span>.
                Please keep exact change of <span className="font-bold text-neutral-900">{currency}{orderTotal.toLocaleString('en-IN')}</span> ready.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing Nepal Payment...
              </span>
            ) : (
              <span>
                {method === 'cod'
                  ? `Confirm Order (Pay ${currency}${orderTotal.toLocaleString('en-IN')} on Delivery)`
                  : method === 'esewa'
                  ? `Pay ${currency}${orderTotal.toLocaleString('en-IN')} with eSewa`
                  : method === 'khalti'
                  ? `Pay ${currency}${orderTotal.toLocaleString('en-IN')} with Khalti`
                  : method === 'bank_transfer'
                  ? `Confirm ${currency}${orderTotal.toLocaleString('en-IN')} Bank Transfer`
                  : `Pay ${currency}${orderTotal.toLocaleString('en-IN')} with Card`}
              </span>
            )}
          </button>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-4 text-gray-400 text-xs mb-1">
              <span>🇳🇵 Local Delivery in Nepal</span>
              <span>•</span>
              <span>100% Genuine Brands</span>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Encrypted Nepal Payment Gateway Sandbox
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PlaceOrder
