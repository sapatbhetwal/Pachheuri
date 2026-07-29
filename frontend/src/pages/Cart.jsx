import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from "../assets/frontend_assets/assets";
const Cart = () => {
  const { products, currency, cartItems, updateQuantity, getCartAmount, delivery_fee } = useContext(ShopContext)
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')

  const cartProducts = []
  for (const itemId in cartItems) {
    const product = products.find((p) => p._id === itemId)
    if (product) {
      for (const size in cartItems[itemId]) {
        cartProducts.push({
          ...product,
          size,
          quantity: cartItems[itemId][size],
        })
      }
    }
  }

  if (cartProducts.length === 0) {
    return (
      <div className="section-padding py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <img src={assets.cart_icon} alt="" className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="font-prata text-2xl text-neutral-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="section-padding py-10 min-h-screen">
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <span>/</span>
        <span className="text-neutral-900">Cart</span>
      </div>

      <h1 className="font-prata text-3xl text-neutral-900 mb-10">Shopping Cart ({cartProducts.length} items)</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-200">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-6 mt-4">
            {cartProducts.map((item, idx) => (
              <div key={`${item._id}-${item.size}`} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center pb-6 border-b border-gray-100">
                <div className="col-span-6 flex gap-4">
                  <Link to={`/product/${item._id}`} className="w-24 h-28 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.image[0]} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <Link to={`/product/${item._id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-600 mb-1">{item.name}</Link>
                    <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                    <p className="text-xs text-gray-500">Size: <span className="font-medium text-neutral-900">{item.size}</span></p>
                    <button
                      onClick={() => updateQuantity(item._id, item.size, 0)}
                      className="flex items-center gap-1 text-xs text-red-500 mt-2 md:hidden"
                    >
                      <img src={assets.bin_icon} alt="" className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>

                <div className="col-span-2 text-center hidden md:block">
                  <p className="text-sm font-medium">{currency}{item.price}</p>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center border border-gray-300 rounded-sm">
                    <button onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm">-</button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm">+</button>
                  </div>
                </div>

                <div className="col-span-2 text-right hidden md:block">
                  <p className="text-sm font-semibold">{currency}{item.price * item.quantity}</p>
                  <button onClick={() => updateQuantity(item._id, item.size, 0)} className="mt-1 hover:opacity-70">
                    <img src={assets.bin_icon} alt="Remove" className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/shop" className="text-sm text-neutral-900 underline hover:text-gray-600">← Continue Shopping</Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-neutral-50 p-6 rounded-sm">
            <h3 className="font-prata text-xl text-neutral-900 mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{currency}{getCartAmount()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">{currency}{delivery_fee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">{currency}0</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">{currency}{getCartAmount() + delivery_fee}</span>
              </div>
            </div>

            <button onClick={() => navigate('/place-order')} className="w-full btn-primary text-center">
              Proceed to Checkout
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Have a coupon?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
                <button className="bg-neutral-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-neutral-700 transition-colors">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart