import React, { useContext } from 'react'
import { ShopContext } from '../../context/ShopContext.jsx'
import UserAvatar from '../../components/UserAvatar'

const Users = () => {
  const { adminUsers, activityLogs } = useContext(ShopContext)
  const userNames = Object.fromEntries(adminUsers.map((user) => [user.id, user.name]))

  return (
    <div>
      <h1 className="font-prata text-2xl text-neutral-900 mb-2">Users & Activity</h1>
      <p className="text-sm text-gray-400 mb-8">Customer accounts, email addresses, and recent account activity.</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-neutral-900">Registered Users</h2>
            <span className="text-sm text-gray-400">{adminUsers.length} total</span>
          </div>
          {adminUsers.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No customers registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={user.name} size="sm" />
                          <span className="font-medium text-neutral-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">{user.email}</td>
                      <td className="py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-neutral-900">Activity Logs</h2>
            <span className="text-sm text-gray-400">{activityLogs.length} events</span>
          </div>
          {activityLogs.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No activity recorded yet.</p>
          ) : (
            <div className="space-y-1 max-h-[30rem] overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm text-neutral-900">
                      <span className="font-medium">{userNames[log.userId] || 'User'}</span> {log.detail.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{log.action.replaceAll('_', ' ')}</p>
                  </div>
                  <time className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</time>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Users
