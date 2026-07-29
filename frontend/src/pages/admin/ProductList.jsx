import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext.jsx'

const ProductList = () => {
  const { products, deleteProduct, toggleBestseller, currency } = useContext(ShopContext)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const categories = ['All', 'Men', 'Women', 'Kids']

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteProduct(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-prata text-2xl text-neutral-900 mb-1">Products</h1>
          <p className="text-sm text-gray-400">Manage your product catalog</p>
        </div>
        <Link to="/admin/add-product" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filterCategory === cat ? 'bg-neutral-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-neutral-900'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-gray-400 text-sm">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-400">
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Sizes</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image[0]} alt={product.name} className="w-12 h-16 object-cover rounded-lg bg-gray-100" />
                        <div>
                          <p className="font-semibold text-neutral-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.subCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900">{currency}{product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {product.sizes.map((s) => (
                          <span key={s} className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center text-[10px] font-semibold text-gray-500">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleBestseller(product._id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${product.bestseller ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.bestseller ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                        {product.bestseller ? 'Bestseller' : 'Regular'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                          className="p-2 text-gray-400 hover:text-neutral-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className={`p-2 rounded-lg transition-colors ${deleteConfirm === product._id ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                          title={deleteConfirm === product._id ? 'Click again to confirm' : 'Delete'}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
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

export default ProductList