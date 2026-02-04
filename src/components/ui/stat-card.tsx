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
}

const variantStyles = {
  default: {
    icon: "bg-secondary text-foreground",
    glow: "",
  },
  hot: {
    icon: "bg-gradient-to-br from-red-500 to-orange-500 text-white",
    glow: "shadow-lg shadow-red-500/20",
  },
  warm: {
    icon: "bg-gradient-to-br from-amber-500 to-yellow-400 text-black",
    glow: "shadow-lg shadow-amber-500/20",
  },
  cold: {
    icon: "bg-gradient-to-br from-blue-500 to-cyan-400 text-white",
    glow: "shadow-lg shadow-blue-500/20",
  },
  primary: {
    icon: "bg-gradient-to-br from-primary to-cyan-400 text-primary-foreground",
    glow: "shadow-glow-sm",
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
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-5 border border-border/50 relative overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-3xl font-display font-bold tracking-tight mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full",
              trend.positive 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            )}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          styles.icon,
          styles.glow
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
