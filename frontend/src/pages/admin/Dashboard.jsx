import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext.jsx'

const Dashboard = () => {
  const { products, orders } = useContext(ShopContext)

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalProducts = products.length
  const totalOrders = orders.length
  const bestsellerCount = products.filter(p => p.bestseller).length

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: '▣', color: 'bg-blue-50 text-blue-600', link: '/admin/products' },
    { label: 'Total Orders', value: totalOrders, icon: '🛒', color: 'bg-green-50 text-green-600', link: '/admin/orders' },
    { label: 'Revenue', value: `$${totalRevenue}`, icon: '$', color: 'bg-amber-50 text-amber-600', link: '/admin/orders' },
    { label: 'Bestsellers', value: bestsellerCount, icon: '☆', color: 'bg-rose-50 text-rose-600', link: '/admin/products' },
  ]

  const recentOrders = orders.slice(0, 5)

  return (
    <div>
      <h1 className="font-prata text-2xl text-neutral-900 mb-2">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-8">Welcome back, Admin. Here's what's happening today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-neutral-900 font-medium hover:underline">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-gray-400 text-sm">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-50">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-neutral-900">{order.id}</td>
                      <td className="py-4 text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="py-4 font-bold text-neutral-900">${order.total}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/add-product" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-neutral-900 hover:text-white transition-all group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Add New Product</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">Create a new product listing</p>
              </div>
            </Link>
            <Link to="/admin/products" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-neutral-900 hover:text-white transition-all group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Manage Products</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">Edit, delete, or update products</p>
              </div>
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-neutral-900 hover:text-white transition-all group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <p className="font-semibold text-sm">View Orders</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">Check and manage customer orders</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard