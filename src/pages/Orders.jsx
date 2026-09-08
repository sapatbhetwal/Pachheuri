import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'

const Orders = () => {
  const { orders, products, currency, user } = useContext(ShopContext)

  if (!user && orders.length === 0) {
    return (
      <div className="section-padding py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-prata text-2xl text-neutral-900 mb-3">Sign in to view your orders</h2>
        <p className="text-gray-500 text-sm mb-6">
          Log in to see your order history, delivery tracking, and payment receipts.
        </p>
        <Link to="/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="section-padding py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-prata text-2xl text-neutral-900 mb-3">No orders yet</h2>
        <p className="text-gray-500 text-sm mb-8">You haven't placed any orders yet.</p>
        <Link to="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="section-padding py-10 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Title text1="My" text2="Orders" />
        {user && (
          <span className="text-xs text-gray-500 font-mono">
            Showing orders for {user.email}
          </span>
        )}
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-sm font-mono font-medium text-neutral-900">{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-neutral-900">
                  {new Date(order.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {currency}
                  {(order.total || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.status === 'Shipped'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Payment & Shipping Summary banner */}
            <div className="bg-neutral-50 rounded-lg p-3.5 mb-4 text-xs flex flex-wrap items-center justify-between gap-2 border border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 font-medium">Payment:</span>
                <span className="font-semibold text-neutral-900">
                  {order.payment?.method === 'esewa'
                    ? `eSewa (${order.payment?.esewaId || 'Online'})`
                    : order.payment?.method === 'khalti'
                    ? `Khalti (${order.payment?.khaltiNumber || 'Online'})`
                    : order.payment?.method === 'bank_transfer'
                    ? `Bank Transfer (${order.payment?.bankName || 'Fonepay'})`
                    : order.payment?.method === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : `${order.payment?.cardBrand || 'Card'} ending in ${order.payment?.cardLast4 || '••••'}`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    order.payment?.status?.includes('Paid')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.payment?.status || 'Paid'}
                </span>
              </div>

              {order.payment?.transactionId && (
                <div className="text-gray-400 font-mono text-[11px]">
                  Ref: {order.payment.transactionId}
                </div>
              )}

              {order.deliveryInfo && (
                <div className="w-full text-gray-600 pt-2 border-t border-gray-200/60 mt-1 leading-relaxed">
                  <span className="font-medium text-gray-700">Delivery Address: </span>
                  {order.deliveryInfo.fullName || `${order.deliveryInfo.firstName || ''} ${order.deliveryInfo.lastName || ''}`.trim()}
                  {order.deliveryInfo.phone ? ` • Ph: ${order.deliveryInfo.phone}` : ''}
                  <br />
                  <span className="text-gray-500">
                    {[
                      order.deliveryInfo.houseNo ? `House ${order.deliveryInfo.houseNo}` : null,
                      order.deliveryInfo.tole || order.deliveryInfo.address,
                      order.deliveryInfo.ward ? `Ward ${order.deliveryInfo.ward}` : null,
                      order.deliveryInfo.municipality,
                      order.deliveryInfo.district || order.deliveryInfo.city,
                      order.deliveryInfo.province || order.deliveryInfo.state,
                      order.deliveryInfo.postalCode ? `Postal: ${order.deliveryInfo.postalCode}` : null,
                      'Nepal',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  {order.deliveryInfo.deliveryInstructions && (
                    <span className="block text-[11px] text-amber-700 mt-0.5">
                      Note: {order.deliveryInfo.deliveryInstructions}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {Object.entries(order.items || {}).map(([itemId, sizes]) => {
                const product = products.find((p) => p._id === itemId)
                if (!product) return null
                return Object.entries(sizes).map(([size, qty]) => (
                  <div key={`${itemId}-${size}`} className="flex items-center gap-4">
                    <img
                      src={Array.isArray(product.image) ? product.image[0] : product.image}
                      alt={product.name}
                      className="w-14 h-16 object-cover rounded-md bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: <span className="font-semibold text-neutral-700">{size}</span> | Qty:{' '}
                        <span className="font-semibold text-neutral-700">{qty}</span>
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {currency}
                      {product.price * qty}
                    </p>
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
