import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Mail,
  Linkedin,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MessageLog } from "@/hooks/useMessageLogs";

interface MessageHistoryProps {
  messages: MessageLog[];
  isLoading?: boolean;
  maxHeight?: string;
}

const channelIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  linkedin: Linkedin,
};

const channelColors = {
  whatsapp: "text-green-500",
  email: "text-primary",
  linkedin: "text-blue-500",
};

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
  sent: { icon: CheckCircle2, color: "text-blue-500", label: "Sent" },
  delivered: { icon: CheckCircle2, color: "text-green-500", label: "Delivered" },
  read: { icon: Eye, color: "text-cyan-500", label: "Read" },
  failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
  responded: { icon: Reply, color: "text-success", label: "Responded" },
};

export function MessageHistory({ messages, isLoading, maxHeight = "300px" }: MessageHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No messages sent yet</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-2">
      <div className="space-y-3">
        {messages.map((message) => {
          const ChannelIcon = channelIcons[message.channel];
          const status = statusConfig[message.status];
          const StatusIcon = status.icon;
          const isExpanded = expandedId === message.id;

          return (
            <div
              key={message.id}
              className="p-3 rounded-xl bg-secondary/50 border border-border"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    message.channel === "whatsapp" && "bg-green-500/20",
                    message.channel === "email" && "bg-primary/20",
                    message.channel === "linkedin" && "bg-blue-500/20"
                  )}
                >
                  <ChannelIcon
                    className={cn("w-4 h-4", channelColors[message.channel])}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {message.lead?.name || message.recipient}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          status.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(message.sent_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {message.subject && (
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      {message.subject}
                    </p>
                  )}

                  <p
                    className={cn(
                      "text-sm text-muted-foreground mt-1",
                      !isExpanded && "line-clamp-2"
                    )}
                  >
                    {message.body}
                  </p>

                  {message.body.length > 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : message.id)
                      }
                      className="h-6 px-2 mt-1 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Show more
                        </>
                      )}
                    </Button>
                  )}

                  {message.error_message && (
                    <p className="text-xs text-destructive mt-1">
                      Error: {message.error_message}
                    </p>
                  )}

                  {message.campaign?.name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Campaign: {message.campaign.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
