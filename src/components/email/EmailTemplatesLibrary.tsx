import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Star,
  StarOff,
  Trash2,
  Edit,
  Copy,
  FileText,
  FolderOpen,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEmailTemplates,
  useDeleteEmailTemplate,
  useToggleTemplateFavorite,
  type EmailTemplate,
} from "@/hooks/useEmailTemplates";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const categories = [
  { value: "all", label: "All Templates" },
  { value: "general", label: "General" },
  { value: "introduction", label: "Introduction" },
  { value: "follow-up", label: "Follow-up" },
  { value: "proposal", label: "Proposal" },
  { value: "meeting", label: "Meeting" },
];

interface EmailTemplatesLibraryProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
  onCreateTemplate?: () => void;
  onEditTemplate?: (template: EmailTemplate) => void;
  selectable?: boolean;
}

export function EmailTemplatesLibrary({
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate,
  selectable = false,
}: EmailTemplatesLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  const { data: templates = [], isLoading } = useEmailTemplates(selectedCategory);
  const deleteTemplate = useDeleteEmailTemplate();
  const toggleFavorite = useToggleTemplateFavorite();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleToggleFavorite = (e: React.MouseEvent, template: EmailTemplate) => {
    e.stopPropagation();
    toggleFavorite.mutate({ id: template.id, isFavorite: !template.is_favorite });
  };

  const handleDelete = (e: React.MouseEvent, template: EmailTemplate) => {
    e.stopPropagation();
    setTemplateToDelete(template);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate.mutate(templateToDelete.id);
      setTemplateToDelete(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, template: EmailTemplate) => {
    e.stopPropagation();
    onEditTemplate?.(template);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          />
        </div>
        {onCreateTemplate && (
          <Button onClick={onCreateTemplate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all press-effect",
              selectedCategory === category.value
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "bg-secondary/80 text-muted-foreground hover:text-foreground border border-border/50"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No templates found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Create your first email template to get started"}
          </p>
          {onCreateTemplate && !searchQuery && (
            <Button onClick={onCreateTemplate} variant="default">
              Create Template
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => selectable && onSelectTemplate?.(template)}
                className={cn(
                  "glass-card rounded-xl p-4 border border-border/50 group",
                  selectable && "cursor-pointer hover:border-primary/50 hover:shadow-glow-sm transition-all"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(e, template)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {template.is_favorite ? (
                      <Star className="w-4 h-4 text-warning fill-warning" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Subject */}
                <p className="text-sm font-medium mb-2 truncate">{template.subject}</p>

                {/* Body Preview */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {template.body.replace(/<[^>]*>/g, "").substring(0, 100)}...
                </p>

                {/* Variables */}
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.variables.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Used {template.use_count} times
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditTemplate && (
                      <button
                        onClick={(e) => handleEdit(e, template)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Edit template"
                      >
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(template.body);
                      }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      title="Copy body"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, template)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
