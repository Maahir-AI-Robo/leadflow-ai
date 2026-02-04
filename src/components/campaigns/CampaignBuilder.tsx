import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCampaignBuilder } from "@/hooks/useCampaignBuilder";
import { CampaignBasicsStep } from "./steps/CampaignBasicsStep";
import { SelectLeadsStep } from "./steps/SelectLeadsStep";
import { GenerateMessagesStep } from "./steps/GenerateMessagesStep";
import { ReviewPublishStep } from "./steps/ReviewPublishStep";
import { cn } from "@/lib/utils";

interface CampaignBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { number: 1, title: "Basics" },
  { number: 2, title: "Leads" },
  { number: 3, title: "Messages" },
  { number: 4, title: "Review" },
];

export function CampaignBuilder({ open, onOpenChange }: CampaignBuilderProps) {
  const builder = useCampaignBuilder();

  const handleClose = () => {
    builder.resetBuilder();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-4 rounded-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl">
            Create Campaign
          </DialogTitle>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <button
                  onClick={() => builder.goToStep(s.number)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                    builder.step === s.number
                      ? "bg-primary text-primary-foreground"
                      : builder.step > s.number
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <span className="font-semibold">{s.number}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1",
                      builder.step > s.number ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={builder.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {builder.step === 1 && (
                <CampaignBasicsStep
                  draft={builder.draft}
                  updateDraft={builder.updateDraft}
                  onNext={builder.nextStep}
                  onCancel={handleClose}
                />
              )}
              {builder.step === 2 && (
                <SelectLeadsStep
                  draft={builder.draft}
                  updateDraft={builder.updateDraft}
                  onNext={builder.nextStep}
                  onBack={builder.prevStep}
                />
              )}
              {builder.step === 3 && (
                <GenerateMessagesStep
                  draft={builder.draft}
                  updateDraft={builder.updateDraft}
                  generateSequence={builder.generateSequence}
                  onNext={builder.nextStep}
                  onBack={builder.prevStep}
                />
              )}
              {builder.step === 4 && (
                <ReviewPublishStep
                  draft={builder.draft}
                  saveCampaign={builder.saveCampaign}
                  publishCampaign={builder.publishCampaign}
                  onBack={builder.prevStep}
                  onClose={handleClose}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
