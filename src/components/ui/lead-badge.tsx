import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const leadBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-200",
  {
    variants: {
      score: {
        hot: "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25",
        warm: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/25",
        cold: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
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
}

export function LeadBadge({ score, size, className, children }: LeadBadgeProps) {
  const label = children || (score === "hot" ? "Hot" : score === "cold" ? "Cold" : "Warm");
  
  return (
    <span className={cn(leadBadgeVariants({ score, size }), className)}>
      {label}
    </span>
  );
}
