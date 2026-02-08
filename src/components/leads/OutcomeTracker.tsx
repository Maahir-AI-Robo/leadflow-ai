import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Eye,
  MessageSquare,
  XCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface OutcomeTrackerProps {
  messageLogId: string;
  channel: string;
  leadName: string;
  onDone?: () => void;
}

const outcomes = [
  { key: "sent", label: "Sent", icon: Send, color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { key: "read", label: "Read", icon: Eye, color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" },
  { key: "responded", label: "Responded", icon: MessageSquare, color: "bg-green-500/20 text-green-500 border-green-500/30" },
  { key: "ignored", label: "Ignored", icon: XCircle, color: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
] as const;

type OutcomeKey = typeof outcomes[number]["key"];

export function OutcomeTracker({ messageLogId, channel, leadName, onDone }: OutcomeTrackerProps) {
  const [selected, setSelected] = useState<OutcomeKey | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);

    try {
      const now = new Date().toISOString();
      const updates: Record<string, unknown> = {
        [`user_confirmed_${selected}`]: true,
        [`user_confirmed_${selected}_at`]: now,
        outcome_sentiment: notes || null,
      };

      // Also update the status field
      if (selected === "responded") {
        updates.status = "responded";
        updates.responded_at = now;
      } else if (selected === "read") {
        updates.status = "read";
        updates.read_at = now;
      } else if (selected === "sent") {
        updates.status = "sent";
      }

      const { error } = await supabase
        .from("message_logs")
        .update(updates)
        .eq("id", messageLogId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["message-logs"] });
      toast.success("Outcome recorded", {
        description: `Marked as "${selected}" for ${leadName}`,
      });
      onDone?.();
    } catch (err) {
      toast.error("Failed to save outcome");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 p-4 rounded-2xl bg-secondary/50 border border-border"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">What happened?</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Did you send the {channel} message to {leadName}?
      </p>

      <div className="grid grid-cols-2 gap-2">
        {outcomes.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium",
              selected === key
                ? color + " border-current"
                : "bg-background border-border hover:border-muted-foreground/30"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Textarea
              placeholder="Add notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full"
              size="sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirm Outcome
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
