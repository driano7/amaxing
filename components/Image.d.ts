// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Tipos del componente Image.
 *
 * components/Image.js es JavaScript y TypeScript infiere sus props como
 * obligatorios (width, height, layout), lo que rompe cualquier llamada que
 * use solo `fill` o solo `src` + `sizes`. Esta declaracion los hace
 * opcionales, que es como funciona el componente en la practica.
 */
import type { ImgHTMLAttributes, ReactElement } from 'react'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> & {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  layout?: 'fill' | 'fixed' | 'intrinsic' | 'constrained'
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: string
  blurDataURL?: string
  unoptimized?: boolean
}

declare const Image: (props: ImageProps) => ReactElement
export default Image
