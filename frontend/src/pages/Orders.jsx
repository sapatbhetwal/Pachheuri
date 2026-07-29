import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'

const Orders = () => {
  const { orders, products, currency } = useContext(ShopContext)

  if (orders.length === 0) {
    return (
      <div className="section-padding py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-prata text-2xl text-neutral-900 mb-3">No orders yet</h2>
        <p className="text-gray-500 text-sm mb-8">You haven't placed any orders.</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="section-padding py-10 min-h-screen">
      <Title text1="My" text2="Orders" />
      <div className="space-y-6 max-w-4xl mx-auto">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-sm font-medium text-neutral-900">{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-neutral-900">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                <p className="text-sm font-medium text-neutral-900">{currency}{order.total}</p>
              </div>
              <div>
                <span className="inline-block bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">{order.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(order.items).map(([itemId, sizes]) => {
                const product = products.find((p) => p._id === itemId)
                if (!product) return null
                return Object.entries(sizes).map(([size, qty]) => (
                  <div key={`${itemId}-${size}`} className="flex items-center gap-4">
                    <img src={product.image[0]} alt={product.name} className="w-14 h-16 object-cover rounded-sm bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-gray-500">Size: {size} | Qty: {qty}</p>
                    </div>
                    <p className="text-sm font-medium">{currency}{product.price * qty}</p>
                  </div>
                ))
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders