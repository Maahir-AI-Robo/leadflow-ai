import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary glow - top center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px] bg-primary/8 rounded-full blur-[100px] animate-float" />
        
        {/* Secondary glow - bottom right */}
        <div className="absolute bottom-1/4 -right-32 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyan-500/5 rounded-full blur-[80px]" />
        
        {/* Accent glow - left side */}
        <div className="absolute top-1/2 -left-32 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-primary/3 rounded-full blur-[60px]" />
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        
        {/* Subtle grid pattern for depth */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main content - centered on larger screens */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 ${showNav ? "pb-32 lg:pb-8" : ""} max-w-7xl mx-auto`}
      >
        {children}
      </motion.main>

      {/* Bottom navigation - hide on larger screens, show sidebar alternative */}
      {showNav && <BottomNav />}
    </div>
  );
}
