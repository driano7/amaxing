import * as React from 'react'
import { cn } from '@/lib/utils/cx'

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-orange-500 text-white hover:bg-orange-600',
      outline: 'border border-white/20 bg-transparent text-white hover:bg-white/10',
      ghost: 'text-white hover:bg-white/10',
      link: 'text-orange-500 underline-offset-4 hover:underline',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
