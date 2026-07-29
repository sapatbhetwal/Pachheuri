import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from "../assets/frontend_assets/assets";
const PlaceOrder = () => {
  const { getCartAmount, delivery_fee, currency, placeOrder, cartItems } = useContext(ShopContext)
  const navigate = useNavigate()
  const [method, setMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.values(formData).some((v) => !v)) {
      alert('Please fill in all fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const orderId = placeOrder(formData)
      setLoading(false)
      alert(`Order placed successfully! Order ID: ${orderId}`)
      navigate('/orders')
    }, 1500)
  }

  if (Object.keys(cartItems).length === 0) {
    return (
      <div className="section-padding py-20 text-center">
        <h2 className="font-prata text-2xl mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Shop Now</button>
      </div>
    )
  }

  return (
    <div className="section-padding py-10 min-h-screen">
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
        <span>Cart</span>
        <span>/</span>
        <span className="text-neutral-900 font-medium">Checkout</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
        {/* Delivery Info */}
        <div className="flex-1">
          <h2 className="font-prata text-2xl text-neutral-900 mb-6">Delivery Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="input-field" required />
            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="input-field" required />
          </div>
          <div className="mb-4">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="input-field" required />
          </div>
          <div className="mb-4">
            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="input-field" required />
          </div>
          <div className="mb-4">
            <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} className="input-field" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="input-field" required />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="input-field" required />
            <input type="text" name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} className="input-field" required />
          </div>
          <div className="mb-4">
            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-neutral-50 p-6 rounded-sm mb-6">
            <h3 className="font-prata text-xl text-neutral-900 mb-6">Order Total</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{currency}{getCartAmount()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">{currency}{delivery_fee}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{currency}{getCartAmount() + delivery_fee}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Payment Method</h3>
            <div className="space-y-3">
              <label onClick={() => setMethod('stripe')} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${method === 'stripe' ? 'border-neutral-900 bg-white' : 'border-gray-200'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'stripe' ? 'border-neutral-900' : 'border-gray-300'}`}>
                  {method === 'stripe' && <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>}
                </div>
                <img src={assets.stripe_logo} alt="Stripe" className="h-5 object-contain" />
              </label>

              <label onClick={() => setMethod('razorpay')} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${method === 'razorpay' ? 'border-neutral-900 bg-white' : 'border-gray-200'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'razorpay' ? 'border-neutral-900' : 'border-gray-300'}`}>
                  {method === 'razorpay' && <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>}
                </div>
                <img src={assets.razorpay_logo} alt="Razorpay" className="h-5 object-contain" />
              </label>

              <label onClick={() => setMethod('cod')} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${method === 'cod' ? 'border-neutral-900 bg-white' : 'border-gray-200'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'cod' ? 'border-neutral-900' : 'border-gray-300'}`}>
                  {method === 'cod' && <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>}
                </div>
                <span className="text-sm font-medium">Cash on Delivery</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlaceOrder