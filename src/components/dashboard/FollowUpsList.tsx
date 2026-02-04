import { formatDistanceToNow, format, isPast, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  Linkedin,
  Users,
  MoreVertical,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useFollowUps, type FollowUp } from "@/hooks/useFollowUps";

interface FollowUpsListProps {
  maxHeight?: string;
  showCompleted?: boolean;
}

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  call: Phone,
  linkedin: Linkedin,
  meeting: Users,
  other: Calendar,
};

const priorityColors = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-warning",
  urgent: "text-destructive",
};

export function FollowUpsList({ maxHeight = "400px", showCompleted = false }: FollowUpsListProps) {
  const { followUps, isLoading, completeFollowUp, deleteFollowUp } = useFollowUps();

  const filteredFollowUps = followUps.filter((f) => 
    showCompleted ? true : f.status !== "completed"
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-4 rounded-2xl bg-secondary/50 border border-border/30">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredFollowUps.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10"
      >
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-secondary/80 flex items-center justify-center">
          <Calendar className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No follow-ups scheduled</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Schedule one from the leads page</p>
      </motion.div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-2">
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredFollowUps.map((followUp, index) => (
            <motion.div
              key={followUp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.05 }}
            >
              <FollowUpItem
                followUp={followUp}
                onComplete={() => completeFollowUp(followUp.id)}
                onDelete={() => deleteFollowUp(followUp.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}

function FollowUpItem({
  followUp,
  onComplete,
  onDelete,
}: {
  followUp: FollowUp;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const scheduledDate = new Date(followUp.scheduled_at);
  const isOverdue = isPast(scheduledDate) && followUp.status === "pending";
  const isCompleted = followUp.status === "completed";
  const ChannelIcon = followUp.channel ? channelIcons[followUp.channel] || Calendar : Calendar;

  return (
    <motion.div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200",
        isCompleted && "opacity-60 bg-secondary/30 border-border/30",
        isOverdue && !isCompleted && "border-destructive/40 bg-destructive/5",
        !isOverdue && !isCompleted && "bg-secondary/60 border-border/40 hover:border-primary/30"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <motion.button
        onClick={onComplete}
        disabled={isCompleted}
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all touch-target-sm",
          isCompleted
            ? "bg-success/20 text-success"
            : isOverdue
            ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
            : "bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-glow-sm"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isOverdue ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <ChannelIcon className="w-5 h-5" />
        )}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className={cn(
              "font-medium text-sm",
              isCompleted && "line-through",
              priorityColors[followUp.priority]
            )}>
              {followUp.title}
            </p>
            {followUp.lead && (
              <p className="text-xs text-muted-foreground">
                {followUp.lead.name}
                {followUp.lead.company && ` · ${followUp.lead.company}`}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {!isCompleted && (
                <DropdownMenuItem onClick={onComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={cn(
              "text-xs",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              {isToday(scheduledDate)
                ? `Today at ${format(scheduledDate, "h:mm a")}`
                : formatDistanceToNow(scheduledDate, { addSuffix: true })}
            </span>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5 rounded-full">
              Overdue
            </Badge>
          )}
          {followUp.priority === "urgent" && !isOverdue && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5 rounded-full">
              Urgent
            </Badge>
          )}
          {followUp.priority === "high" && !isOverdue && (
            <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
              High
            </Badge>
          )}
        </div>

        {followUp.description && (
          <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
            {followUp.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
