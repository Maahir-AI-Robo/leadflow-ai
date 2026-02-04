import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Flame, Sun, Snowflake } from "lucide-react";

const leadBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold tracking-wide transition-all duration-200",
  {
    variants: {
      score: {
        hot: "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 ring-1 ring-red-400/30",
        warm: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/30",
        cold: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/30",
      },
      size: {
        sm: "px-2.5 py-1 text-[10px]",
        md: "px-3.5 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      score: "warm",
      size: "md",
    },
  }
);

interface LeadBadgeProps extends VariantProps<typeof leadBadgeVariants> {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

const scoreIcons = {
  hot: Flame,
  warm: Sun,
  cold: Snowflake,
};

export function LeadBadge({ score, size, className, children, showIcon = false }: LeadBadgeProps) {
  const label = children || (score === "hot" ? "Hot" : score === "cold" ? "Cold" : "Warm");
  const Icon = score ? scoreIcons[score] : null;
  
  return (
    <motion.span 
      className={cn(leadBadgeVariants({ score, size }), className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {showIcon && Icon && <Icon className={cn(
        size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"
      )} />}
      {label}
    </motion.span>
  );
}
