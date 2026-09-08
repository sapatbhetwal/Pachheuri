import React, { useContext } from 'react'
import { ShopContext } from '../../context/ShopContext.jsx'

const AdminOrders = () => {
  const { orders, products, currency, updateOrderStatus } = useContext(ShopContext)

  return (
    <div>
      <h1 className="font-prata text-2xl text-neutral-900 mb-2">All Orders</h1>
      <p className="text-sm text-gray-400 mb-8">Manage and track customer orders across all accounts</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-400">No orders placed yet in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-400">
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const custName =
                    order.deliveryInfo
                      ? `${order.deliveryInfo.firstName} ${order.deliveryInfo.lastName}`.trim()
                      : `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer'
                  const custEmail = order.deliveryInfo?.email || order.userEmail || order.email || ''

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <p className="font-mono font-bold text-neutral-900">{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex -space-x-2">
                          {Object.entries(order.items || {})
                            .slice(0, 3)
                            .map(([itemId]) => {
                              const product = products.find((p) => p._id === itemId)
                              const img = Array.isArray(product?.image) ? product.image[0] : product?.image
                              return img ? (
                                <img
                                  key={itemId}
                                  src={img}
                                  alt=""
                                  className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-100"
                                />
                              ) : null
                            })}
                          {Object.keys(order.items || {}).length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                              +{Object.keys(order.items).length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-neutral-900">{custName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{custEmail}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs">
                          <span className="font-semibold text-neutral-900 block">
                            {order.payment?.method === 'esewa'
                              ? 'eSewa'
                              : order.payment?.method === 'khalti'
                              ? 'Khalti'
                              : order.payment?.method === 'bank_transfer'
                              ? `Bank (${order.payment?.bankName || 'Fonepay'})`
                              : order.payment?.method === 'cod'
                              ? 'Cash on Delivery'
                              : `${order.payment?.cardBrand || 'Card'} (${order.payment?.cardLast4 || '••'})`}
                          </span>
                          <p className={`text-[11px] font-medium ${
                            order.payment?.status?.includes('Paid') ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {order.payment?.status || 'Paid'}
                          </p>
                          {order.payment?.transactionId && (
                            <span className="text-[10px] text-gray-400 font-mono block">
                              {order.payment.transactionId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-neutral-900">
                        {currency}
                        {(order.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg outline-none border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
