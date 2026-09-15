import React, { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import ProductCard from '../components/ProductCard'
import { assets } from "../assets/frontend_assets/assets";
import { api } from '../utils/api'
import UserAvatar from '../components/UserAvatar'

const Product = () => {
  const { productId } = useParams()
  const { products, currency, addToCart, wishlist, toggleWishlist, user } = useContext(ShopContext)
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [showSizeError, setShowSizeError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

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

  useEffect(() => {
    if (!productId) return
    api.getProductReviews(productId).then((res) => setReviews(res.reviews || [])).catch(() => setReviews([]))
  }, [productId])

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : product?.averageRating || 0

  const handleReviewSubmit = async (event) => {
    event.preventDefault()
    setReviewError('')
    if (!user) {
      setReviewError('Please sign in to leave a review.')
      return
    }
    setReviewSubmitting(true)
    try {
      const result = await api.submitProductReview(product._id, { rating: reviewRating, comment: reviewComment })
      setReviews((current) => [result.review, ...current.filter((review) => review.userId !== result.review.userId)])
      setReviewComment('')
    } catch (error) {
      setReviewError(error.message || 'Unable to submit your review.')
    } finally {
      setReviewSubmitting(false)
    }
  }

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
                <img key={i} src={i < Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon} alt="star" className="w-4 h-4" />
              ))}
              <span className="text-sm text-gray-400 ml-1">
                {reviews.length ? `${averageRating.toFixed(1)} (${reviews.length} reviews)` : 'No reviews yet'}
              </span>
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

      {/* Reviews */}
      <section className="section-padding py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Customer feedback</p>
              <h2 className="font-prata text-3xl text-neutral-900">Reviews & Ratings</h2>
            </div>
            <span className="text-sm text-gray-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
          </div>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-neutral-50 rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <label className="text-sm font-medium text-neutral-900">Your rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button type="button" key={rating} onClick={() => setReviewRating(rating)} aria-label={`${rating} stars`}>
                      <img src={rating <= reviewRating ? assets.star_icon : assets.star_dull_icon} alt="" className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Share your experience with this product..."
                className="input-field min-h-24 resize-y mb-3"
                maxLength={1000}
                required
              />
              {reviewError && <p className="text-sm text-red-600 mb-3">{reviewError}</p>}
              <button disabled={reviewSubmitting} className="btn-primary disabled:opacity-50">
                {reviewSubmitting ? 'Publishing...' : 'Publish Review'}
              </button>
            </form>
          ) : (
            <p className="bg-neutral-50 rounded-xl p-5 text-sm text-gray-600 mb-8">
              <Link to="/login" className="font-medium text-neutral-900 underline">Sign in</Link> to rate and review this product.
            </p>
          )}

          <div className="space-y-5">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">Be the first to share your opinion.</p>
            ) : reviews.map((review) => (
              <article key={review.id} className="border-b border-gray-100 pb-5">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={review.userName} size="sm" />
                    <p className="font-medium text-neutral-900">{review.userName}</p>
                  </div>
                  <time className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</time>
                </div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <img key={rating} src={rating <= review.rating ? assets.star_icon : assets.star_dull_icon} alt="" className="w-3.5 h-3.5" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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