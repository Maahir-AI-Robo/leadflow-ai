import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { EmailTemplatesLibrary } from "@/components/email/EmailTemplatesLibrary";
import { EmailTemplateEditor } from "@/components/email/EmailTemplateEditor";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { EmailTemplate } from "@/hooks/useEmailTemplates";

export default function Templates() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  return (
    <MobileLayout>
      <div className="px-4 sm:px-6 lg:px-8 lg:pl-80 pt-6 pb-8 space-y-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Email Templates
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage reusable email templates
            </p>
          </div>
        </motion.div>

        {/* Templates Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EmailTemplatesLibrary
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
          />
        </motion.div>

        {/* Template Editor Dialog */}
        <EmailTemplateEditor
          open={showEditor}
          onOpenChange={setShowEditor}
          template={editingTemplate}
        />
      </div>
    </MobileLayout>
  );
}
