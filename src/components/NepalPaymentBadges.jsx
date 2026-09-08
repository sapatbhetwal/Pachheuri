import React from 'react'

export const EsewaBadge = ({ className = 'h-5' }) => (
  <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight text-[#41a124] ${className}`}>
    <span className="w-5 h-5 rounded-full bg-[#60bb46] text-white flex items-center justify-center text-xs font-black shadow-sm">
      e
    </span>
    <span className="text-sm font-black tracking-tight text-neutral-900">
      e<span className="text-[#60bb46]">Sewa</span>
    </span>
  </span>
)

export const KhaltiBadge = ({ className = 'h-5' }) => (
  <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight text-[#5c2d91] ${className}`}>
    <span className="w-5 h-5 rounded-md bg-[#5c2d91] text-white flex items-center justify-center text-xs font-black shadow-sm">
      K
    </span>
    <span className="text-sm font-black tracking-tight text-[#5c2d91]">
      khalti
    </span>
  </span>
)

export const FonepayBadge = ({ className = 'h-5' }) => (
  <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight text-[#d32f2f] ${className}`}>
    <span className="w-5 h-5 rounded-md bg-[#d32f2f] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
      fp
    </span>
    <span className="text-sm font-bold tracking-tight text-neutral-900">
      fone<span className="text-[#d32f2f]">pay</span>
      <span className="text-[11px] font-normal text-gray-500 ml-1">/ Mobile Banking</span>
    </span>
  </span>
)

export const SctCardBadge = ({ className = 'h-5' }) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-white font-extrabold text-[10px] tracking-wider">
      SCT
    </span>
    <span className="px-1.5 py-0.5 rounded bg-blue-900 text-white font-extrabold text-[10px] tracking-wider">
      VISA
    </span>
    <span className="px-1.5 py-0.5 rounded bg-red-700 text-white font-extrabold text-[10px] tracking-wider">
      MC
    </span>
  </span>
)

export const CodBadge = ({ className = 'h-5' }) => (
  <span className={`inline-flex items-center gap-1.5 text-neutral-800 ${className}`}>
    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span className="text-sm font-semibold text-neutral-900">Cash on Delivery</span>
  </span>
)
