import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignDraft, CampaignTemplate } from "@/hooks/useCampaignBuilder";
import type { UseMutationResult } from "@tanstack/react-query";

interface GenerateMessagesStepProps {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  generateSequence: UseMutationResult<CampaignTemplate[], Error, number>;
  onNext: () => void;
  onBack: () => void;
}

export function GenerateMessagesStep({
  draft,
  updateDraft,
  generateSequence,
  onNext,
  onBack,
}: GenerateMessagesStepProps) {
  const [numberOfSteps, setNumberOfSteps] = useState(3);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleGenerate = () => {
    generateSequence.mutate(numberOfSteps);
  };

  const updateTemplate = (index: number, updates: Partial<CampaignTemplate>) => {
    const newTemplates = [...draft.templates];
    newTemplates[index] = { ...newTemplates[index], ...updates };
    updateDraft({ templates: newTemplates });
  };

  const hasTemplates = draft.templates.length > 0;

  return (
    <div className="space-y-4">
      {/* AI Generation Section */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">AI Message Generator</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a personalized {numberOfSteps}-step sequence based on your
              campaign settings and selected leads.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <Label className="text-sm whitespace-nowrap">Number of steps:</Label>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumberOfSteps(n)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                      numberOfSteps === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateSequence.isPending}
              className="mt-4 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
            >
              {generateSequence.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {hasTemplates ? "Regenerate Sequence" : "Generate Sequence"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Templates */}
      {hasTemplates && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            Message Sequence ({draft.templates.length} steps)
          </h3>

          {draft.templates.map((template, index) => (
            <div
              key={index}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedStep(expandedStep === index ? null : index)
                }
                className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                    {template.step}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {template.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {template.delay_days === 0
                        ? "Send immediately"
                        : `Wait ${template.delay_days} day${template.delay_days > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                {expandedStep === index ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expandedStep === index && (
                <div className="p-3 space-y-3 bg-card">
                  <div className="space-y-2">
                    <Label className="text-xs">Subject / Hook</Label>
                    <Input
                      value={template.subject}
                      onChange={(e) =>
                        updateTemplate(index, { subject: e.target.value })
                      }
                      className="rounded-lg bg-secondary text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Message Body</Label>
                    <Textarea
                      value={template.body}
                      onChange={(e) =>
                        updateTemplate(index, { body: e.target.value })
                      }
                      className="rounded-lg bg-secondary text-sm min-h-[120px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">
                      Delay (days):
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={template.delay_days}
                      onChange={(e) =>
                        updateTemplate(index, {
                          delay_days: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-20 rounded-lg bg-secondary text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasTemplates && !generateSequence.isPending && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">
            Click generate to create your AI-powered sequence
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 rounded-xl"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasTemplates}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
