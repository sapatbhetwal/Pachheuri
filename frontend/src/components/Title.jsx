import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div className="text-center mb-10">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-8 h-[1px] bg-neutral-300"></div>
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">{text1}</p>
        <div className="w-8 h-[1px] bg-neutral-300"></div>
      </div>
      <h2 className="font-prata text-3xl md:text-4xl text-neutral-900">{text2}</h2>
    </div>
  )
}

export default Title