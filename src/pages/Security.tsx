 import { useState } from "react";
 import { MobileLayout } from "@/components/layout/MobileLayout";
 import { motion } from "framer-motion";
 import { ArrowLeft, Lock, Eye, EyeOff, Loader2, Shield, KeyRound } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export default function Security() {
   const navigate = useNavigate();
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
 
   const handleChangePassword = async () => {
     if (!newPassword || !confirmPassword) {
       toast.error("Please fill in all password fields");
       return;
     }
 
     if (newPassword !== confirmPassword) {
       toast.error("New passwords do not match");
       return;
     }
 
     if (newPassword.length < 6) {
       toast.error("Password must be at least 6 characters");
       return;
     }
 
     setIsLoading(true);
     try {
       const { error } = await supabase.auth.updateUser({
         password: newPassword,
       });
 
       if (error) throw error;
 
       toast.success("Password updated successfully");
       setCurrentPassword("");
       setNewPassword("");
       setConfirmPassword("");
     } catch (error: any) {
       toast.error(error.message || "Failed to update password");
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <MobileLayout>
       <div className="px-4 sm:px-6 lg:px-8 lg:pl-80 pt-6 pb-24 space-y-6 safe-top">
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-4"
         >
           <button
             onClick={() => navigate("/settings")}
             className="p-2 rounded-xl hover:bg-secondary transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
             <h1 className="font-display text-2xl sm:text-3xl font-bold">Security</h1>
             <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
           </div>
         </motion.div>
 
         {/* Security Info Card */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-4"
         >
           <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
             <Shield className="w-5 h-5 text-primary" />
           </div>
           <div>
             <h3 className="font-medium text-sm">Keep your account secure</h3>
             <p className="text-xs text-muted-foreground mt-1">
               Use a strong password with at least 6 characters, including letters and numbers.
             </p>
           </div>
         </motion.div>
 
         {/* Change Password Section */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-4"
         >
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
               <KeyRound className="w-5 h-5 text-muted-foreground" />
             </div>
             <div>
               <h2 className="font-semibold">Change Password</h2>
               <p className="text-xs text-muted-foreground">Update your account password</p>
             </div>
           </div>
 
           <div className="space-y-4 p-4 rounded-2xl bg-secondary/30 border border-border/40">
             <div className="space-y-2">
               <Label htmlFor="currentPassword" className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-muted-foreground" />
                 Current Password
               </Label>
               <div className="relative">
                 <Input
                   id="currentPassword"
                   type={showCurrentPassword ? "text" : "password"}
                   value={currentPassword}
                   onChange={(e) => setCurrentPassword(e.target.value)}
                   placeholder="Enter current password"
                   className="rounded-xl h-12 pr-12"
                 />
                 <button
                   type="button"
                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
                 >
                   {showCurrentPassword ? (
                     <EyeOff className="w-4 h-4 text-muted-foreground" />
                   ) : (
                     <Eye className="w-4 h-4 text-muted-foreground" />
                   )}
                 </button>
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="newPassword" className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-muted-foreground" />
                 New Password
               </Label>
               <div className="relative">
                 <Input
                   id="newPassword"
                   type={showNewPassword ? "text" : "password"}
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   placeholder="Enter new password"
                   className="rounded-xl h-12 pr-12"
                 />
                 <button
                   type="button"
                   onClick={() => setShowNewPassword(!showNewPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
                 >
                   {showNewPassword ? (
                     <EyeOff className="w-4 h-4 text-muted-foreground" />
                   ) : (
                     <Eye className="w-4 h-4 text-muted-foreground" />
                   )}
                 </button>
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-muted-foreground" />
                 Confirm New Password
               </Label>
               <div className="relative">
                 <Input
                   id="confirmPassword"
                   type={showConfirmPassword ? "text" : "password"}
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   placeholder="Confirm new password"
                   className="rounded-xl h-12 pr-12"
                 />
                 <button
                   type="button"
                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
                 >
                   {showConfirmPassword ? (
                     <EyeOff className="w-4 h-4 text-muted-foreground" />
                   ) : (
                     <Eye className="w-4 h-4 text-muted-foreground" />
                   )}
                 </button>
               </div>
             </div>
 
             <Button
               onClick={handleChangePassword}
               disabled={isLoading || !newPassword || !confirmPassword}
               className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-glow mt-2"
             >
               {isLoading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 "Update Password"
               )}
             </Button>
           </div>
         </motion.div>
 
         {/* Additional Security Options */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-3"
         >
           <h3 className="text-sm font-medium">Security Tips</h3>
           <ul className="space-y-2 text-sm text-muted-foreground">
             <li className="flex items-start gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
               Use a unique password that you don't use elsewhere
             </li>
             <li className="flex items-start gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
               Include a mix of letters, numbers, and special characters
             </li>
             <li className="flex items-start gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
               Change your password regularly for better security
             </li>
           </ul>
         </motion.div>
       </div>
     </MobileLayout>
   );
 }