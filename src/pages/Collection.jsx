import React, { useContext, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductCard from '../components/ProductCard'
import { assets } from "../assets/frontend_assets/assets";

const Collection = () => {
  const { products } = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const [filterProducts, setFilterProducts] = useState(products)
  const [category, setCategory] = useState(searchParams.get('category') ? [searchParams.get('category')] : [])
  const [subCategory, setSubCategory] = useState([])
  const [sort, setSort] = useState('relevant')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['Men', 'Women', 'Kids']
  const subCategories = ['Topwear', 'Bottomwear', 'Winterwear']

  const toggleCategory = (cat) => {
    setCategory((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleSubCategory = (sub) => {
    setSubCategory((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    )
  }

  useEffect(() => {
    let filtered = [...products]
    if (category.length > 0) {
      filtered = filtered.filter((p) => category.includes(p.category))
    }
    if (subCategory.length > 0) {
      filtered = filtered.filter((p) => subCategory.includes(p.subCategory))
    }
    switch (sort) {
      case 'low-high':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'high-low':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => b.date - a.date)
        break
      default:
        break
    }
    setFilterProducts(filtered)
  }, [category, subCategory, sort, products])

  return (
    <div className="section-padding py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <Title text1="All" text2="Collections" />
        <div className="flex items-center gap-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden border border-gray-300 rounded-sm px-3 py-2 text-sm"
          >
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                Categories
                <img src={assets.dropdown_icon} alt="" className="w-3 h-3 rotate-180" />
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${category.includes(cat) ? 'bg-neutral-900 border-neutral-900' : 'border-gray-300 group-hover:border-neutral-900'}`}>
                      {category.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={category.includes(cat)} onChange={() => toggleCategory(cat)} />
                    <span className="text-sm text-gray-600">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                Type
                <img src={assets.dropdown_icon} alt="" className="w-3 h-3 rotate-180" />
              </h3>
              <div className="space-y-2">
                {subCategories.map((sub) => (
                  <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${subCategory.includes(sub) ? 'bg-neutral-900 border-neutral-900' : 'border-gray-300 group-hover:border-neutral-900'}`}>
                      {subCategory.includes(sub) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={subCategory.includes(sub)} onChange={() => toggleSubCategory(sub)} />
                    <span className="text-sm text-gray-600">{sub}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-6">{filterProducts.length} products found</p>
          {filterProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filterProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              <button
                onClick={() => { setCategory([]); setSubCategory([]) }}
                className="mt-4 text-sm text-neutral-900 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Collection