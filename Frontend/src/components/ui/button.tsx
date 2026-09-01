/**
 * @file        : Frontend/src/components/ui/button.tsx
 * @description : primitive عرضي للأزرار بدون أي منطق خاص بالـ business.
 * @updated     : [{ "date": "02/09/2026", "version": "1.1.0", "by": ["v0"], "comment": "توحيد variants والأحجام والأشكال" }]
 */

import { React, Slot, cva, cn, type VariantProps } from '@a'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-transparent hover:bg-muted',
        ghost: 'hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-8 px-2',
        sm: 'h-9 px-3',
        default: 'h-10 px-4',
        lg: 'h-11 px-6',
        xl: 'h-12 px-8',
        icon: 'size-10',
      },
      shape: {
        default: 'rounded-md',
        rounded: 'rounded-lg',
        pill: 'rounded-full',
        square: 'rounded-none',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'default', size: 'default', shape: 'default', fullWidth: false },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, fullWidth, asChild = false, startIcon, endIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, shape, fullWidth, className }))} {...props}>{startIcon}{children}{endIcon}</Comp>
  },
)
Button.displayName = 'Button'

