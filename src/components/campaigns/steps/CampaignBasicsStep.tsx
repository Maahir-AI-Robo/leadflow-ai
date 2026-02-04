import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Linkedin } from "lucide-react";
import type { CampaignDraft } from "@/hooks/useCampaignBuilder";

interface CampaignBasicsStepProps {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  onNext: () => void;
  onCancel: () => void;
}

const channels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];

const tones = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
];

const campaignTypes = [
  { id: "outreach", label: "Cold Outreach" },
  { id: "followup", label: "Follow-up" },
  { id: "nurture", label: "Nurture" },
  { id: "reengagement", label: "Re-engagement" },
];

export function CampaignBasicsStep({
  draft,
  updateDraft,
  onNext,
  onCancel,
}: CampaignBasicsStepProps) {
  const isValid = draft.name.trim() !== "" && draft.goal.trim() !== "";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="campaignName">Campaign Name *</Label>
        <Input
          id="campaignName"
          value={draft.name}
          onChange={(e) => updateDraft({ name: e.target.value })}
          placeholder="Q1 Enterprise Outreach"
          className="rounded-xl bg-secondary"
        />
      </div>

      <div className="space-y-2">
        <Label>Campaign Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {campaignTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => updateDraft({ type: type.id })}
              className={cn(
                "p-3 rounded-xl text-sm font-medium transition-all text-left",
                draft.type === type.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Channel</Label>
        <div className="flex gap-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <button
                key={channel.id}
                onClick={() => updateDraft({ channel: channel.id })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all",
                  draft.channel === channel.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tone</Label>
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => updateDraft({ tone: tone.id })}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                draft.tone === tone.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">Campaign Goal *</Label>
        <Textarea
          id="goal"
          value={draft.goal}
          onChange={(e) => updateDraft({ goal: e.target.value })}
          placeholder="Schedule a 15-minute demo call to showcase our AI lead generation platform"
          className="rounded-xl bg-secondary min-h-[80px] resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
