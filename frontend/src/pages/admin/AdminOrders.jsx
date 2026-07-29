import React, { useContext } from 'react'
import { ShopContext } from '../../context/ShopContext.jsx'

const AdminOrders = () => {
  const { orders, products, currency } = useContext(ShopContext)

  return (
    <div>
      <h1 className="font-prata text-2xl text-neutral-900 mb-2">All Orders</h1>
      <p className="text-sm text-gray-400 mb-8">Manage and track customer orders</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-gray-400">No orders placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-400">
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-neutral-900">{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-2">
                        {Object.entries(order.items).slice(0, 3).map(([itemId]) => {
                          const product = products.find((p) => p._id === itemId)
                          return product ? <img key={itemId} src={product.image[0]} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-100" /> : null
                        })}
                        {Object.keys(order.items).length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">+{Object.keys(order.items).length - 3}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-neutral-900">{order.firstName} {order.lastName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.email}</p>
                    </td>
                    <td className="px-6 py-5 font-bold text-neutral-900">{currency}{order.total}</td>
                    <td className="px-6 py-5">
                      <select defaultValue={order.status} className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg outline-none border border-amber-100 cursor-pointer">
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders