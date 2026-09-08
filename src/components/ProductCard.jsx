import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from "../assets/frontend_assets/assets";

const ProductCard = ({ product }) => {
  const { currency, wishlist, toggleWishlist } = useContext(ShopContext)
  const isWishlisted = wishlist.includes(product._id)

  return (
    <div className="group relative">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative overflow-hidden bg-gray-100 rounded-sm mb-3 aspect-[3/4]">
          <img
            src={product.image[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.bestseller && (
            <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] font-medium px-2.5 py-1 tracking-wider uppercase">
              Bestseller
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist(product._id)
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isWishlisted ? '#ef4444' : 'none'}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke={isWishlisted ? '#ef4444' : 'currentColor'}
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </button>

      <div className="px-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-medium text-neutral-900 mb-1.5 line-clamp-1 hover:text-neutral-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <img
              key={i}
              src={i < 4 ? assets.star_icon : assets.star_dull_icon}
              alt="star"
              className="w-3 h-3"
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">(24)</span>
        </div>
        <p className="text-sm font-semibold text-neutral-900">{currency}{product.price}</p>
      </div>
    </div>
  )
}

export default ProductCard