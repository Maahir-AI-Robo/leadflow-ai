import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={showNav ? "pb-28" : ""}
      >
        {children}
      </motion.main>

      {/* Bottom navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}
