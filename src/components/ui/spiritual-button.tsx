import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const spiritualButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-spiritual text-primary-foreground shadow-spiritual hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-mystic hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        golden:
          "bg-gradient-golden text-foreground shadow-golden hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        ghost:
          "text-primary hover:bg-primary/10",
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-12 px-6",
        lg: "h-14 px-8 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface SpiritualButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof spiritualButtonVariants> {
  asChild?: boolean;
}

const SpiritualButton = React.forwardRef<HTMLButtonElement, SpiritualButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(spiritualButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
SpiritualButton.displayName = "SpiritualButton";

export { SpiritualButton, spiritualButtonVariants };
