import React, { useState, useEffect, useContext } from 'react'
import { ShopContext } from "../../context/ShopContext";
import { useParams, useNavigate } from "react-router-dom";
const AddProduct = () => {
  const { productId } = useParams()
  const { products, addProduct, updateProduct } = useContext(ShopContext)
  const navigate = useNavigate()
  const isEdit = !!productId

  const existing = isEdit ? products.find((p) => p._id === productId) : null

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
      while (imgArr.length < 4) imgArr.push(null)
      setImages(imgArr.slice(0, 4))
    }
  }, [isEdit, existing])

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL']
  const categories = ['Men', 'Women', 'Kids']
  const subCategories = ['Topwear', 'Bottomwear', 'Winterwear', 'Shoes', 'Accessories']

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleImageChange = (idx, e) => {
    if (e.target.files[0]) {
      const newImages = [...images]
      newImages[idx] = URL.createObjectURL(e.target.files[0])
      setImages(newImages)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const productData = {
      ...formData,
      price: Number(formData.price),
      salePrice: formData.onSale ? Number(formData.salePrice) : null,
      image: images.filter((img) => img !== null),
    }
    if (isEdit) {
      updateProduct(productId, productData)
    } else {
      addProduct(productData)
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate('/admin/products')
    }, 1500)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-neutral-900 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="font-prata text-2xl text-neutral-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>
      <p className="text-sm text-gray-400 mb-8">{isEdit ? 'Update product details' : 'Create a new product listing'}</p>

      {saved && (
        <div className="bg-green-50 text-green-700 text-sm px-5 py-3 rounded-xl mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Product {isEdit ? 'updated' : 'added'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm max-w-4xl">
        {/* Images */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-neutral-900 mb-4">Product Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <label key={idx} className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-neutral-900 transition-all overflow-hidden bg-gray-50">
                {img ? (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <img src={assets.upload_area} alt="Upload" className="w-8 h-8 mx-auto opacity-40 mb-1" />
                    <span className="text-[10px] text-gray-400">Upload</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(idx, e)} />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Product Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm" placeholder="e.g. Men Cotton T-shirt" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Description</label>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm resize-none" placeholder="Product description..." required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Price ($)</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm" placeholder="100" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Stock Quantity</label>
            <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm" placeholder="100" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Sub Category</label>
            <select value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm">
              {subCategories.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-neutral-900 mb-3">Available Sizes</label>
          <div className="flex flex-wrap gap-3">
            {allSizes.map((size) => (
              <button key={size} type="button" onClick={() => toggleSize(size)} className={`w-14 h-14 rounded-xl text-sm font-semibold transition-all ${formData.sizes.includes(size) ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 scale-105' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-neutral-900'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.bestseller ? 'bg-neutral-900 border-neutral-900' : 'border-gray-300'}`}>
              {formData.bestseller && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" className="hidden" checked={formData.bestseller} onChange={(e) => setFormData({...formData, bestseller: e.target.checked})} />
            <span className="text-sm font-medium text-neutral-900">Bestseller</span>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.featured ? 'bg-neutral-900 border-neutral-900' : 'border-gray-300'}`}>
              {formData.featured && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" className="hidden" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} />
            <span className="text-sm font-medium text-neutral-900">Featured</span>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.onSale ? 'bg-neutral-900 border-neutral-900' : 'border-gray-300'}`}>
              {formData.onSale && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" className="hidden" checked={formData.onSale} onChange={(e) => setFormData({...formData, onSale: e.target.checked})} />
            <span className="text-sm font-medium text-neutral-900">On Sale</span>
          </label>
        </div>

        {/* Sale Price */}
        {formData.onSale && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Sale Price ($)</label>
            <input type="number" value={formData.salePrice} onChange={(e) => setFormData({...formData, salePrice: e.target.value})} className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm" placeholder="80" required={formData.onSale} />
          </div>
        )}

        <div className="flex gap-4">
          <button type="submit" className="bg-neutral-900 text-white px-10 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95">
            {isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="border-2 border-gray-200 text-neutral-900 px-10 py-3.5 rounded-full font-semibold text-sm hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all active:scale-95">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct