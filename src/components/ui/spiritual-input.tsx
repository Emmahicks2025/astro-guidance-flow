import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpiritualInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const SpiritualInput = React.forwardRef<HTMLInputElement, SpiritualInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-14 w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground shadow-soft transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
SpiritualInput.displayName = "SpiritualInput";

export { SpiritualInput };
