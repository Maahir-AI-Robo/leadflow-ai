import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { Info, X } from "lucide-react";
import {
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  type EmailTemplate,
} from "@/hooks/useEmailTemplates";

interface EmailTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
}

const categories = [
  { value: "general", label: "General" },
  { value: "introduction", label: "Introduction" },
  { value: "follow-up", label: "Follow-up" },
  { value: "proposal", label: "Proposal" },
  { value: "meeting", label: "Meeting" },
];

const availableVariables = [
  { key: "name", description: "Lead's name" },
  { key: "first_name", description: "Lead's first name" },
  { key: "company", description: "Lead's company" },
  { key: "role", description: "Lead's role/title" },
  { key: "your_name", description: "Your name" },
  { key: "your_company", description: "Your company" },
];

export function EmailTemplateEditor({
  open,
  onOpenChange,
  template,
}: EmailTemplateEditorProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();

  const isEditing = !!template;
  const isSubmitting = createTemplate.isPending || updateTemplate.isPending;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setCategory(template.category);
      setTags(template.tags || []);
    } else {
      setName("");
      setSubject("");
      setBody("");
      setCategory("general");
      setTags([]);
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templateData = {
      name,
      subject,
      body,
      category,
      tags,
      is_favorite: template?.is_favorite || false,
      variables: [], // Will be auto-extracted
    };

    if (isEditing && template) {
      await updateTemplate.mutateAsync({ id: template.id, updates: templateData });
    } else {
      await createTemplate.mutateAsync(templateData);
    }

    onOpenChange(false);
  };

  const insertVariable = (key: string) => {
    const variable = `{{${key}}}`;
    setBody((prev) => prev + variable);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Template" : "Create Email Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Introduction Email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Quick question about {{company}}"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Email Body</Label>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                Use {"{{variable}}"} for personalization
              </div>
            </div>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {{name}},&#10;&#10;I noticed that {{company}} is..."
              className="min-h-[200px] font-mono text-sm"
              required
            />
          </div>

          {/* Variable Buttons */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Insert Variable</Label>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border/50"
                  title={v.description}
                >
                  {`{{${v.key}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
