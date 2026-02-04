import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "hot" | "warm" | "cold" | "primary";
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    icon: "bg-secondary text-foreground",
    glow: "",
    ring: "",
  },
  hot: {
    icon: "bg-gradient-to-br from-red-500 to-orange-500 text-white",
    glow: "shadow-lg shadow-red-500/25",
    ring: "ring-1 ring-red-500/20",
  },
  warm: {
    icon: "bg-gradient-to-br from-amber-500 to-yellow-400 text-black",
    glow: "shadow-lg shadow-amber-500/25",
    ring: "ring-1 ring-amber-500/20",
  },
  cold: {
    icon: "bg-gradient-to-br from-blue-500 to-cyan-400 text-white",
    glow: "shadow-lg shadow-blue-500/25",
    ring: "ring-1 ring-blue-500/20",
  },
  primary: {
    icon: "bg-gradient-to-br from-primary to-cyan-400 text-primary-foreground",
    glow: "shadow-glow-sm",
    ring: "ring-1 ring-primary/20",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  delay = 0,
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border/40 relative overflow-hidden group",
        onClick && "cursor-pointer press-effect",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-20 group-hover:opacity-40 transition-opacity" />
      
      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full" 
           style={{ transition: 'transform 0.8s ease-in-out' }} />
      
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/80 truncate">{subtitle}</p>
          )}
          {trend && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                "inline-flex items-center gap-1 mt-2 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full",
                trend.positive 
                  ? "bg-success/20 text-success" 
                  : "bg-destructive/20 text-destructive"
              )}
            >
              <span className="text-sm">{trend.positive ? "↑" : "↓"}</span>
              {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>
        
        <motion.div 
          className={cn(
            "w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0",
            styles.icon,
            styles.glow,
            styles.ring
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
        </motion.div>
      </div>
    </motion.div>
  );
}
