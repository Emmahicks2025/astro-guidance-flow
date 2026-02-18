import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spiritualCardVariants = cva(
  "rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-soft text-card-foreground",
        elevated: "bg-card border border-border shadow-lg hover:shadow-xl text-card-foreground",
        spiritual: "bg-gradient-spiritual text-white shadow-spiritual [&_p]:text-white/80 [&_span]:text-white [&_h3]:text-white [&_h4]:text-white",
        mystic: "bg-gradient-mystic text-white shadow-mystic [&_p]:text-white/80 [&_span]:text-white [&_h3]:text-white [&_h4]:text-white",
        golden: "bg-gradient-golden text-white shadow-golden [&_p]:text-white/80 [&_span]:text-white [&_h3]:text-white [&_h4]:text-white",
        glass: "bg-card/60 backdrop-blur-lg border border-border/50 shadow-soft text-card-foreground",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface SpiritualCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spiritualCardVariants> {}

const SpiritualCard = React.forwardRef<HTMLDivElement, SpiritualCardProps>(
  ({ className, variant, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spiritualCardVariants({ variant, interactive, className }))}
        {...props}
      />
    );
  }
);
SpiritualCard.displayName = "SpiritualCard";

const SpiritualCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
SpiritualCardHeader.displayName = "SpiritualCardHeader";

const SpiritualCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
SpiritualCardTitle.displayName = "SpiritualCardTitle";

const SpiritualCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm opacity-80", className)}
    {...props}
  />
));
SpiritualCardDescription.displayName = "SpiritualCardDescription";

const SpiritualCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
SpiritualCardContent.displayName = "SpiritualCardContent";

const SpiritualCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
SpiritualCardFooter.displayName = "SpiritualCardFooter";

export {
  SpiritualCard,
  SpiritualCardHeader,
  SpiritualCardFooter,
  SpiritualCardTitle,
  SpiritualCardDescription,
  SpiritualCardContent,
  spiritualCardVariants,
};
