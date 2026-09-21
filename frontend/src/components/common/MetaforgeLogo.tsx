import React from 'react'

interface MetaforgeLogoProps {
  variant?: 'light' | 'dark' // light = for dark backgrounds (white text), dark = for light backgrounds (navy text)
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function MetaforgeLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: MetaforgeLogoProps) {
  const heightMap = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-13',
    xl: 'h-15',
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {variant === 'light' ? (
        <img
          src="/metaforge-white-logo.png"
          alt="metaforge logo"
          className={`${heightMap[size]} w-auto object-contain mix-blend-screen`}
        />
      ) : (
        <img
          src="/metaforge-logo.png"
          alt="metaforge logo"
          className={`${heightMap[size]} w-auto object-contain`}
        />
      )}
    </div>
  )
}
