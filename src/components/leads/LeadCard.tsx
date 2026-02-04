import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { LeadBadge } from "@/components/ui/lead-badge";
import { Building2, Star, ArrowRight, X, Sparkles } from "lucide-react";
import { useState } from "react";

export interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  score: "hot" | "warm" | "cold";
  scoreValue: number;
  lastActivity?: string;
  aiSummary?: string;
}

interface LeadCardProps {
  lead: Lead;
  onSwipeLeft?: (id: string) => void;
  onSwipeRight?: (id: string) => void;
  onStar?: (id: string) => void;
  onClick?: (lead: Lead) => void;
  className?: string;
}

export function LeadCard({
  lead,
  onSwipeLeft,
  onSwipeRight,
  onStar,
  onClick,
  className,
}: LeadCardProps) {
  const [isStarred, setIsStarred] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const leftIndicatorOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const leftIndicatorScale = useTransform(x, [-100, -50, 0], [1.2, 1, 0.8]);
  const rightIndicatorScale = useTransform(x, [0, 50, 100], [0.8, 1, 1.2]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onSwipeLeft?.(lead.id);
    } else if (info.offset.x > 100) {
      onSwipeRight?.(lead.id);
    }
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStarred(!isStarred);
    onStar?.(lead.id);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <motion.div
      className={cn("relative touch-pan-y", className)}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      {/* Swipe indicators - Enhanced */}
      <motion.div
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-destructive rounded-2xl p-3 shadow-lg"
        style={{ opacity: leftIndicatorOpacity, scale: leftIndicatorScale }}
      >
        <X className="w-6 h-6 text-destructive-foreground" />
      </motion.div>
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-success rounded-2xl p-3 shadow-lg"
        style={{ opacity: rightIndicatorOpacity, scale: rightIndicatorScale }}
      >
        <ArrowRight className="w-6 h-6 text-success-foreground" />
      </motion.div>

      {/* Card content - Enhanced */}
      <motion.div
        className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border/40 cursor-pointer backdrop-blur-xl touch-target"
        onClick={() => onClick?.(lead)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar - Enhanced */}
          <div className="relative flex-shrink-0">
            {lead.avatar ? (
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-border/30 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center ring-2 ring-border/30 shadow-md">
                <span className="text-lg sm:text-xl font-semibold text-foreground">
                  {getInitials(lead.name)}
                </span>
              </div>
            )}
            {/* Score indicator - Enhanced */}
            <motion.div 
              className={cn(
                "absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg ring-2 ring-background",
                lead.score === "hot" && "bg-gradient-to-br from-red-500 to-orange-500 text-white",
                lead.score === "warm" && "bg-gradient-to-br from-amber-500 to-yellow-400 text-black",
                lead.score === "cold" && "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
              )}
              whileHover={{ scale: 1.2 }}
            >
              {lead.scoreValue}
            </motion.div>
          </div>

          {/* Info - Enhanced */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate text-base">
                {lead.name}
              </h3>
              <LeadBadge score={lead.score} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {lead.role}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{lead.company}</span>
            </div>
          </div>

          {/* Star button - Enhanced */}
          <motion.button
            onClick={handleStar}
            className="p-2.5 rounded-xl hover:bg-secondary/80 transition-colors touch-target-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Star
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isStarred
                  ? "fill-warning text-warning drop-shadow-[0_0_6px_hsl(var(--warning)/0.5)]"
                  : "text-muted-foreground"
              )}
            />
          </motion.button>
        </div>

        {/* AI Summary preview - Enhanced */}
        {lead.aiSummary && (
          <motion.div 
            className="mt-4 pt-4 border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {lead.aiSummary}
              </p>
            </div>
          </motion.div>
        )}

        {/* Last activity - Enhanced */}
        {lead.lastActivity && (
          <p className="text-[10px] text-muted-foreground/70 mt-3 pl-1">
            Last activity: {lead.lastActivity}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
