import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva('button', {
  variants: {
    variant: {
      default: '',
      outline: 'button-outline',
      ghost: 'button-ghost',
    },
    size: {
      default: '',
      sm: 'button-sm',
      lg: 'button-lg',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
