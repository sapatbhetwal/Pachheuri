import React, { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from "../assets/frontend_assets/assets";
const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch, products } = useContext(ShopContext)
  const [suggestions, setSuggestions] = useState([])
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (search.trim()) {
      const filtered = products
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [search, products])

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSearch])

  if (!showSearch) return null

  return (
    <div className="bg-gray-50 border-b border-gray-200 animate-fade-in-up">
      <div className="section-padding py-4">
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-sm px-4 py-2.5 focus-within:border-neutral-900 transition-colors">
            <img src={assets.search_icon} alt="Search" className="w-4 h-4 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <button onClick={() => { setSearch(''); setShowSearch(false) }}>
              <img src={assets.cross_icon} alt="Close" className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-sm z-50">
              {suggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    navigate(`/product/${product._id}`)
                    setSearch('')
                    setShowSearch(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <img src={product.image[0]} alt={product.name} className="w-10 h-10 object-cover rounded-sm" />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchBar