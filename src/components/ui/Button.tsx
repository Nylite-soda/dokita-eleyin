// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const variants = {
      primary: 'bg-brand-darkBlue text-white hover:bg-opacity-90',
      secondary: 'bg-brand-lightBlue text-ink hover:bg-white',
      ghost: 'bg-transparent border border-white text-white hover:bg-white hover:text-brand-darkBlue',
      outline: 'bg-transparent border border-brand-darkBlue text-brand-darkBlue hover:bg-brand-darkBlue hover:text-white',
    }

    const sizes = {
      sm: 'px-4 py-1.5 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg',
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
