import React, { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import ProductCard from '../components/ProductCard'
import { assets } from "../assets/frontend_assets/assets";

const Product = () => {
  const { productId } = useParams()
  const { products, currency, addToCart, wishlist, toggleWishlist } = useContext(ShopContext)
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [showSizeError, setShowSizeError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const found = products.find((p) => p._id === productId)
    if (found) {
      setProduct(found)
      setSelectedImage(0)
      setSelectedSize('')
      setShowSizeError(false)
      setAddedToCart(false)
    }
  }, [productId, products])

  const relatedProducts = products
    .filter((p) => p.category === product?.category && p._id !== productId)
    .slice(0, 4)

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true)
      return
    }
    const success = addToCart(product._id, selectedSize)
    if (success) {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  if (!product) {
    return (
      <div className="section-padding py-20 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/shop" className="text-sm text-neutral-900 underline mt-4 inline-block">Back to Shop</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="section-padding py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Images */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
              {product.image.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-24 lg:w-24 lg:h-28 border-2 rounded-sm overflow-hidden transition-colors ${selectedImage === idx ? 'border-neutral-900' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 bg-gray-100 rounded-sm overflow-hidden aspect-[3/4]">
              <img src={product.image[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category} / {product.subCategory}</p>
              <button onClick={() => toggleWishlist(product._id)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill={wishlist.includes(product._id) ? '#ef4444' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke={wishlist.includes(product._id) ? '#ef4444' : 'currentColor'} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </button>
            </div>

            <h1 className="font-prata text-2xl lg:text-3xl text-neutral-900 mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <img key={i} src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="star" className="w-4 h-4" />
              ))}
              <span className="text-sm text-gray-400 ml-1">(128 reviews)</span>
            </div>

            <p className="text-2xl font-semibold text-neutral-900 mb-6">{currency}{product.price}</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{product.description}</p>

            <div className="mb-8">
              <p className="text-sm font-medium mb-3">Select Size {showSizeError && <span className="text-red-500 text-xs ml-2">Please select a size</span>}</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setShowSizeError(false) }}
                    className={`w-12 h-12 border rounded-sm text-sm font-medium transition-all ${selectedSize === size ? 'bg-neutral-900 text-white border-neutral-900' : 'border-gray-300 hover:border-neutral-900'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                className={`flex-1 sm:flex-none px-10 py-3.5 rounded-sm font-medium text-sm transition-all active:scale-95 ${addedToCart ? 'bg-green-600 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-700'}`}
              >
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <Link to="/cart" className="btn-outline text-center">View Cart</Link>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <img src={assets.exchange_icon} alt="" className="w-5 h-5" />
                <span>30-day easy exchange policy</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <img src={assets.quality_icon} alt="" className="w-5 h-5" />
                <span>100% premium quality guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="section-padding py-16 bg-neutral-50">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-[1px] bg-neutral-300"></div>
              <p className="text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">You May Also Like</p>
              <div className="w-8 h-[1px] bg-neutral-300"></div>
            </div>
            <h2 className="font-prata text-3xl text-neutral-900">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Product