
import React, { useState, useEffect, useContext } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/frontend_assets/assets'

const AddProduct = () => {
  const { productId } = useParams()
  const { products, addProduct, updateProduct } = useContext(ShopContext)
  const navigate = useNavigate()

  const isEdit = !!productId

  const existing = isEdit
    ? products.find((p) => p._id === productId)
    : null

  const [images, setImages] = useState([null, null, null, null])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Men',
    subCategory: 'Topwear',
    sizes: [],
    bestseller: false,
    stock: 100,
    featured: false,
    onSale: false,
    salePrice: '',
  })

  const [saved, setSaved] = useState(false)

  const [isProcessingImg, setIsProcessingImg] = useState(false)
  const [urlInputIndex, setUrlInputIndex] = useState(null)
  const [customUrl, setCustomUrl] = useState('')

  // Load existing product when editing
  useEffect(() => {
    if (isEdit && existing) {
      setFormData({
        name: existing.name || '',
        description: existing.description || '',
        price: existing.price || '',
        category: existing.category || 'Men',
        subCategory: existing.subCategory || 'Topwear',
        sizes: existing.sizes || [],
        bestseller: existing.bestseller || false,
        stock: existing.stock || 100,
        featured: existing.featured || false,
        onSale: existing.onSale || false,
        salePrice: existing.salePrice || '',
      })

      const imgArr = [...(existing.image || [])]
      while (imgArr.length < 4) {
        imgArr.push(null)
      }
      setImages(imgArr.slice(0, 4))
    }
  }, [isEdit, existing])

  // Available sizes
  const allSizes = ['S', 'M', 'L', 'XL', 'XXL']

  // Main categories
  const categories = ['Men', 'Women', 'Kids']

  // Product sub-categories
  const subCategories = [
    'Topwear',
    'Bottomwear',
    'Winterwear',
    'Summerwear',
    'Shoes',
    'Accessories',
  ]

  // Toggle product size
  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  // Convert uploaded image file into a persistent, optimized Base64 Data URL for the database
  const handleImageChange = (idx, e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    setIsProcessingImg(true)
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const maxDim = 1200
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85)

        setImages((prev) => {
          const next = [...prev]
          next[idx] = compressedBase64
          return next
        })
        setIsProcessingImg(false)
      }
      img.onerror = () => {
        setIsProcessingImg(false)
      }
      img.src = uploadEvent.target.result
    }
    reader.onerror = () => {
      setIsProcessingImg(false)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (idx, e) => {
    e.stopPropagation()
    e.preventDefault()
    setImages((prev) => {
      const next = [...prev]
      next[idx] = null
      return next
    })
  }

  const handleApplyUrl = (idx) => {
    if (customUrl.trim()) {
      setImages((prev) => {
        const next = [...prev]
        next[idx] = customUrl.trim()
        return next
      })
      setCustomUrl('')
      setUrlInputIndex(null)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      salePrice: formData.onSale ? Number(formData.salePrice) : null,
      image: images.filter((img) => img !== null),
    }

    if (isEdit) {
      await updateProduct(productId, productData)
    } else {
      await addProduct(productData)
    }

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
      navigate('/admin/products')
    }, 1200)
  }

  return (
    <div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">

        <button
          onClick={() => navigate('/admin/products')}
          className="text-gray-400 hover:text-neutral-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <h1 className="font-prata text-2xl text-neutral-900">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

      </div>

      <p className="text-sm text-gray-400 mb-8">
        {isEdit
          ? 'Update product details'
          : 'Create a new product listing'}
      </p>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 text-green-700 text-sm px-5 py-3 rounded-xl mb-6 flex items-center gap-2">

          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>

          Product {isEdit ? 'updated' : 'added'} successfully!

        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm max-w-4xl"
      >

        {/* Product Images */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-neutral-900">
              Product Images / Assets
            </label>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Persistent DB Storage
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Upload image files (PNG, JPG) or enter direct URLs. All assets are permanently stored in the local database.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-neutral-900 transition-all">
                  {img ? (
                    <>
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => removeImage(idx, e)}
                        className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-all cursor-pointer"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                      <img
                        src={assets.upload_area}
                        alt="Upload"
                        className="w-8 h-8 mx-auto opacity-40 mb-1"
                      />
                      <span className="text-[10px] font-medium text-gray-500">
                        {isProcessingImg ? 'Saving...' : 'Upload File'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(idx, e)}
                      />
                    </label>
                  )}
                </div>

                {/* Direct URL input toggle */}
                <div className="flex justify-between items-center text-[11px]">
                  <label className="text-gray-500 hover:text-neutral-900 cursor-pointer flex items-center gap-1">
                    <span>Choose file</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(idx, e)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInputIndex(urlInputIndex === idx ? null : idx)
                      setCustomUrl(img || '')
                    }}
                    className="text-neutral-600 hover:text-neutral-900 font-medium underline"
                  >
                    {urlInputIndex === idx ? 'Cancel' : 'Paste URL'}
                  </button>
                </div>

                {urlInputIndex === idx && (
                  <div className="flex gap-1 mt-1">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded w-full outline-none focus:border-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyUrl(idx)}
                      className="bg-neutral-900 text-white text-[11px] px-2 py-1 rounded cursor-pointer"
                    >
                      Set
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Product Name */}
          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Product Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
              placeholder="e.g. Claire Nepal Floral Bodycon Maxi Dress"
              required
            />

          </div>

          {/* Description */}
          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Description
            </label>

            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm resize-none"
              placeholder="Product description..."
              required
            />

          </div>

          {/* Price */}
          <div>

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Price ($)
            </label>

            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
              placeholder="100"
              required
            />

          </div>

          {/* Stock */}
          <div>

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Stock Quantity
            </label>

            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
              placeholder="100"
              required
            />

          </div>

          {/* Category */}
          <div>

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Category
            </label>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

          </div>

          {/* Sub Category */}
          <div>

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Sub Category
            </label>

            <select
              value={formData.subCategory}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subCategory: e.target.value,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
            >

              {subCategories.map((subCategory) => (
                <option
                  key={subCategory}
                  value={subCategory}
                >
                  {subCategory}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* Sizes */}
        <div className="mb-6">

          <label className="block text-sm font-semibold text-neutral-900 mb-3">
            Available Sizes
          </label>

          <div className="flex flex-wrap gap-3">

            {allSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`
                  w-14 h-14 rounded-xl text-sm font-semibold transition-all
                  ${
                    formData.sizes.includes(size)
                      ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 scale-105'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-neutral-900'
                  }
                `}
              >
                {size}
              </button>
            ))}

          </div>
        </div>

        {/* Product Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {/* Bestseller */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">

            <div
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                ${
                  formData.bestseller
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'border-gray-300'
                }
              `}
            >
              {formData.bestseller && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            <input
              type="checkbox"
              className="hidden"
              checked={formData.bestseller}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bestseller: e.target.checked,
                })
              }
            />

            <span className="text-sm font-medium text-neutral-900">
              Bestseller
            </span>

          </label>

          {/* Featured */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">

            <div
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                ${
                  formData.featured
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'border-gray-300'
                }
              `}
            >
              {formData.featured && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            <input
              type="checkbox"
              className="hidden"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  featured: e.target.checked,
                })
              }
            />

            <span className="text-sm font-medium text-neutral-900">
              Featured
            </span>

          </label>

          {/* On Sale */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">

            <div
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                ${
                  formData.onSale
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'border-gray-300'
                }
              `}
            >
              {formData.onSale && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            <input
              type="checkbox"
              className="hidden"
              checked={formData.onSale}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  onSale: e.target.checked,
                })
              }
            />

            <span className="text-sm font-medium text-neutral-900">
              On Sale
            </span>

          </label>

        </div>

        {/* Sale Price */}
        {formData.onSale && (
          <div className="mb-8">

            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Sale Price ($)
            </label>

            <input
              type="number"
              value={formData.salePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salePrice: e.target.value,
                })
              }
              className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
              placeholder="80"
              required={formData.onSale}
            />

          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">

          <button
            type="submit"
            className="bg-neutral-900 text-white px-10 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95"
          >
            {isEdit ? 'Update Product' : 'Add Product'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="border-2 border-gray-200 text-neutral-900 px-10 py-3.5 rounded-full font-semibold text-sm hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all active:scale-95"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  )
}

export default AddProduct
