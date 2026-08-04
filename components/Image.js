import NextImage from 'next/image'

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
      {...rest}
    />
  )
}

export default Image
