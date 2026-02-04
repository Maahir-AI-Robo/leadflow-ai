import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Loader2, Mail, MessageCircle, Phone, Linkedin, Users } from "lucide-react";
import { useFollowUps, type FollowUp } from "@/hooks/useFollowUps";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";

interface Lead {
  id: string;
  name: string;
}

interface ScheduleFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
}

const channelOptions = [
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "call", label: "Phone Call", icon: Phone },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "meeting", label: "Meeting", icon: Users },
];

const quickOptions = [
  { label: "In 1 hour", getValue: () => addHours(new Date(), 1) },
  { label: "Tomorrow 9am", getValue: () => setMinutes(setHours(addDays(new Date(), 1), 9), 0) },
  { label: "In 3 days", getValue: () => setMinutes(setHours(addDays(new Date(), 3), 10), 0) },
  { label: "Next week", getValue: () => setMinutes(setHours(addDays(new Date(), 7), 10), 0) },
];

export function ScheduleFollowUpDialog({ open, onOpenChange, lead }: ScheduleFollowUpDialogProps) {
  const { createFollowUp, isCreating } = useFollowUps();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [priority, setPriority] = useState<FollowUp["priority"]>("normal");
  const [channel, setChannel] = useState<string>("");

  const handleQuickSelect = (getValue: () => Date) => {
    const date = getValue();
    setScheduledAt(format(date, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !scheduledAt) return;

    await createFollowUp({
      lead_id: lead?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      scheduled_at: new Date(scheduledAt).toISOString(),
      priority,
      channel: channel as FollowUp["channel"] || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setPriority("normal");
    setChannel("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Follow-up
          </DialogTitle>
          <DialogDescription>
            {lead ? `Schedule a follow-up with ${lead.name}` : "Schedule a new follow-up task"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick options */}
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(option.getValue)}
                className="text-xs rounded-lg"
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Send proposal, Follow up on meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled">Date & Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as FollowUp["priority"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any notes for this follow-up..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !scheduledAt || isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
