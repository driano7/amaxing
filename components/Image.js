import NextImage from 'next/image'

// Hosts conocidos que next/image puede optimizar (deben estar en next.config images.domains)
const KNOWN_HOSTS = new Set([
  'images.unsplash.com',
  'imageio.forbes.com',
  'mmx.prnewswire.com',
  'gcaptain.com',
  'avatars.githubusercontent.com',
])

const isKnownHost = (src) => {
  try {
    return KNOWN_HOSTS.has(new URL(src, 'http://localhost').hostname)
  } catch {
    return false
  }
}

// eslint-disable-next-line jsx-a11y/alt-text
const Image = ({ src, alt, fill, width, height, layout, ...rest }) => {
  // If fill is used, ensure parent has relative positioning
  // If no width/height/fill provided, default to fill with responsive behavior
  const shouldFill = fill || (!width && !height && layout !== 'fixed')

  return (
    <NextImage
      src={src}
      alt={alt}
      fill={shouldFill}
      width={shouldFill ? undefined : width}
      height={shouldFill ? undefined : height}
      layout={shouldFill ? 'fill' : layout}
      unoptimized={typeof src === 'string' && !isKnownHost(src)}
      {...rest}
    />
  )
}

export default Image
