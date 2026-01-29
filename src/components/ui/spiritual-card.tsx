import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spiritualCardVariants = cva(
  "rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-soft",
        elevated: "bg-card border border-border shadow-lg hover:shadow-xl",
        spiritual: "bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-spiritual",
        mystic: "bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-mystic",
        golden: "bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 shadow-golden",
        glass: "bg-card/60 backdrop-blur-lg border border-border/50 shadow-soft",
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
      "text-xl font-semibold leading-none tracking-tight text-foreground",
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
    className={cn("text-sm text-muted-foreground", className)}
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
