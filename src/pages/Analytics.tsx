import { MobileLayout } from "@/components/layout/MobileLayout";
import { MessageAnalytics } from "@/components/dashboard/MessageAnalytics";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <MobileLayout>
      <div className="px-4 sm:px-6 lg:px-8 lg:pl-80 pt-6 pb-24 space-y-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Message delivery and response metrics
            </p>
          </div>
        </motion.div>

        {/* Analytics Dashboard */}
        <MessageAnalytics />
      </div>
    </MobileLayout>
  );
}
