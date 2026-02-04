import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { LeadBadge } from "@/components/ui/lead-badge";
import { Building2, Star, ArrowRight, X } from "lucide-react";
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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const leftIndicatorOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

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
      className={cn("relative", className)}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      {/* Swipe indicators */}
      <motion.div
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-destructive rounded-full p-3"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <X className="w-6 h-6 text-destructive-foreground" />
      </motion.div>
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-success rounded-full p-3"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <ArrowRight className="w-6 h-6 text-success-foreground" />
      </motion.div>

      {/* Card content */}
      <div
        className="glass-card rounded-3xl p-5 border border-border/50 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => onClick?.(lead)}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {lead.avatar ? (
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-border/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center ring-2 ring-border/50">
                <span className="text-lg font-semibold text-foreground">
                  {getInitials(lead.name)}
                </span>
              </div>
            )}
            {/* Score indicator ring */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              lead.score === "hot" && "bg-gradient-to-br from-red-500 to-orange-500 text-white",
              lead.score === "warm" && "bg-gradient-to-br from-amber-500 to-yellow-400 text-black",
              lead.score === "cold" && "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
            )}>
              {lead.scoreValue}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate pr-2">
                {lead.name}
              </h3>
              <LeadBadge score={lead.score} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground truncate mb-1">
              {lead.role}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{lead.company}</span>
            </div>
          </div>

          {/* Star button */}
          <button
            onClick={handleStar}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Star
              className={cn(
                "w-5 h-5 transition-all duration-200",
                isStarred
                  ? "fill-warning text-warning scale-110"
                  : "text-muted-foreground"
              )}
            />
          </button>
        </div>

        {/* AI Summary preview */}
        {lead.aiSummary && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground line-clamp-2">
              <span className="text-primary font-medium">AI: </span>
              {lead.aiSummary}
            </p>
          </div>
        )}

        {/* Last activity */}
        {lead.lastActivity && (
          <p className="text-[10px] text-muted-foreground mt-3">
            Last activity: {lead.lastActivity}
          </p>
        )}
      </div>
    </motion.div>
  );
}
