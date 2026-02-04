import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

const glassCardVariants = cva(
  "glass-card rounded-2xl transition-all duration-300 backdrop-blur-xl",
  {
    variants: {
      variant: {
        default: "border border-border/40 bg-card/60",
        elevated: "border border-border/30 shadow-lg bg-card/70",
        glow: "border border-primary/30 shadow-glow-sm hover:shadow-glow bg-card/60",
        interactive: "border border-border/40 hover:border-primary/40 hover:shadow-glow-sm cursor-pointer bg-card/60 card-depth press-effect",
        solid: "border border-border/50 bg-card shadow-md",
      },
      padding: {
        none: "p-0",
        xs: "p-3",
        sm: "p-4",
        md: "p-5 sm:p-6",
        lg: "p-6 sm:p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

interface GlassCardProps extends HTMLMotionProps<"div">, VariantProps<typeof glassCardVariants> {
  /** Disable entrance animation */
  noAnimation?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, noAnimation, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(glassCardVariants({ variant, padding }), className)}
        initial={noAnimation ? false : { opacity: 0, y: 16 }}
        animate={noAnimation ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
