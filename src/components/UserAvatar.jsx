import React from 'react'

const AVATAR_COLORS = [
  ['#0f766e', '#ccfbf1'],
  ['#1d4ed8', '#dbeafe'],
  ['#7c3aed', '#ede9fe'],
  ['#be123c', '#ffe4e6'],
  ['#b45309', '#fef3c7'],
  ['#047857', '#d1fae5'],
  ['#4338ca', '#e0e7ff'],
  ['#a21caf', '#fae8ff'],
]

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function getColor(name = '') {
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const UserAvatar = ({ name, size = 'md', className = '' }) => {
  const [foreground, background] = getColor(name)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-[10px]' : size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-xs'

  return (
    <div
      className={`${sizeClass} ${className} rounded-full flex items-center justify-center font-bold tracking-wide flex-shrink-0`}
      style={{ color: foreground, backgroundColor: background }}
      aria-label={`${name || 'User'} profile picture`}
      title={name || 'User'}
    >
      {getInitials(name)}
    </div>
  )
}

export default UserAvatar
