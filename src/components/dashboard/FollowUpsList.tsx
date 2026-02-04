import { useState } from "react";
import { formatDistanceToNow, format, isPast, isToday } from "date-fns";
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
          <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
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
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No follow-ups scheduled</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-2">
      <div className="space-y-2">
        {filteredFollowUps.map((followUp) => (
          <FollowUpItem
            key={followUp.id}
            followUp={followUp}
            onComplete={() => completeFollowUp(followUp.id)}
            onDelete={() => deleteFollowUp(followUp.id)}
          />
        ))}
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
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-colors",
        isCompleted && "opacity-60 bg-secondary/30",
        isOverdue && !isCompleted && "border-destructive/50 bg-destructive/5",
        !isOverdue && !isCompleted && "bg-secondary/50 border-border"
      )}
    >
      <button
        onClick={onComplete}
        disabled={isCompleted}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
          isCompleted
            ? "bg-success/20 text-success"
            : isOverdue
            ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
            : "bg-primary/20 text-primary hover:bg-primary/30"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isOverdue ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <ChannelIcon className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCompleted && (
                <DropdownMenuItem onClick={onComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className={cn(
            "text-xs",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}>
            {isToday(scheduledDate)
              ? `Today at ${format(scheduledDate, "h:mm a")}`
              : formatDistanceToNow(scheduledDate, { addSuffix: true })}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Overdue
            </Badge>
          )}
          {followUp.priority === "urgent" && !isOverdue && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Urgent
            </Badge>
          )}
          {followUp.priority === "high" && !isOverdue && (
            <Badge className="text-[10px] px-1.5 py-0 bg-warning text-warning-foreground">
              High
            </Badge>
          )}
        </div>

        {followUp.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {followUp.description}
          </p>
        )}
      </div>
    </div>
  );
}
