import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { useEmailDeepLink } from "@/hooks/useEmailDeepLink";
import { useSuggestOutreach } from "@/hooks/useLeadAI";
import { OutcomeTracker } from "./OutcomeTracker";

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  role?: string | null;
  company?: string | null;
}

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}

export function EmailDialog({ open, onOpenChange, lead }: EmailDialogProps) {
  const [email, setEmail] = useState(lead.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const { openEmail } = useEmailDeepLink();
  const suggestOutreach = useSuggestOutreach();

  const handleGenerateMessage = async () => {
    try {
      const suggestion = await suggestOutreach.mutateAsync({
        name: lead.name,
        role: lead.role,
        company: lead.company,
      });
      if (suggestion) {
        setSubject(`Quick question for ${lead.name.split(" ")[0]}`);
        setBody(suggestion);
      }
    } catch (error) {
      console.error("Failed to generate message:", error);
    }
  };

  const handleSend = async () => {
    if (!email.trim() || !subject.trim() || !body.trim()) return;

    const success = await openEmail({
      to: email,
      subject: personalizeText(subject),
      body: personalizeText(body),
      leadId: lead.id,
      leadName: lead.name,
    });

    if (success) {
      // Show outcome tracker instead of closing
      setShowOutcome(true);
    }
  };

  const personalizeText = (text: string) => {
    return text
      .replace(/\{\{name\}\}/g, lead.name.split(" ")[0])
      .replace(/\{\{company\}\}/g, lead.company || "your company")
      .replace(/\{\{role\}\}/g, lead.role || "your role");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowOutcome(false);
      setSubject("");
      setBody("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email {lead.name}
          </DialogTitle>
          <DialogDescription>
            Opens your email app with the message pre-filled
          </DialogDescription>
        </DialogHeader>

        {showOutcome ? (
          <OutcomeTracker
            messageLogId={lastMessageId || ""}
            channel="email"
            leadName={lead.name}
            onDone={() => handleClose(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="lead@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Message</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateMessage}
                  disabled={suggestOutreach.isPending}
                  className="h-7 text-xs"
                >
                  {suggestOutreach.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  AI Generate
                </Button>
              </div>
              <Textarea
                id="body"
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{name}}"}, {"{{company}}"}, {"{{role}}"} for personalization
              </p>
            </div>

            {body && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
                <p className="text-sm whitespace-pre-wrap">
                  {personalizeText(body)}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!email.trim() || !subject.trim() || !body.trim()}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Email App
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
