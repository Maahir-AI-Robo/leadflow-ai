 import { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
 import { ArrowLeft, User, Building2, Briefcase, Mail, Loader2, Save, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
 import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
 
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [uploadingAvatar, setUploadingAvatar] = useState(false);
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setCompany(profile.company || "");
      setRole(profile.role || "");
       setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile, user]);

   const handleAvatarClick = () => {
     fileInputRef.current?.click();
   };
 
   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !user) return;
 
     // Validate file type
     if (!file.type.startsWith("image/")) {
       toast.error("Please select an image file");
       return;
     }
 
     // Validate file size (max 5MB)
     if (file.size > 5 * 1024 * 1024) {
       toast.error("Image must be less than 5MB");
       return;
     }
 
     setUploadingAvatar(true);
     try {
       const fileExt = file.name.split(".").pop();
       const filePath = `${user.id}/avatar.${fileExt}`;
 
       // Upload to storage
       const { error: uploadError } = await supabase.storage
         .from("avatars")
         .upload(filePath, file, { upsert: true });
 
       if (uploadError) throw uploadError;
 
       // Get public URL
       const { data: { publicUrl } } = supabase.storage
         .from("avatars")
         .getPublicUrl(filePath);
 
       // Update profile with new avatar URL
       await updateProfile.mutateAsync({ avatar_url: publicUrl });
       setAvatarPreview(publicUrl);
       toast.success("Avatar updated successfully");
     } catch (error: any) {
       console.error("Avatar upload error:", error);
       toast.error(error.message || "Failed to upload avatar");
     } finally {
       setUploadingAvatar(false);
     }
   };
 
   const handleRemoveAvatar = async () => {
     if (!user) return;
     
     setUploadingAvatar(true);
     try {
       await updateProfile.mutateAsync({ avatar_url: null });
       setAvatarPreview(null);
       toast.success("Avatar removed");
     } catch (error: any) {
       toast.error(error.message || "Failed to remove avatar");
     } finally {
       setUploadingAvatar(false);
     }
   };
 
  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: fullName,
        email,
        company,
        role,
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const initials = (fullName || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-24 h-24 rounded-2xl mx-auto" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   onChange={handleAvatarChange}
                   className="hidden"
                 />
                <motion.div
                   className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-primary-foreground font-display font-bold text-3xl shadow-glow overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                   onClick={handleAvatarClick}
                >
                   {uploadingAvatar ? (
                     <Loader2 className="w-8 h-8 animate-spin" />
                   ) : avatarPreview ? (
                    <img
                       src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </motion.div>
                 <button 
                   onClick={handleAvatarClick}
                   disabled={uploadingAvatar}
                   className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center hover:bg-muted transition-colors"
                 >
                   <Camera className="w-4 h-4 text-muted-foreground" />
                </button>
                 {avatarPreview && (
                   <button 
                     onClick={handleRemoveAvatar}
                     disabled={uploadingAvatar}
                     className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive border-2 border-background flex items-center justify-center hover:bg-destructive/80 transition-colors"
                   >
                     <X className="w-3 h-3 text-destructive-foreground" />
                   </button>
                 )}
              </div>
               <p className="text-sm text-muted-foreground">
                 {uploadingAvatar ? "Uploading..." : "Tap to change photo"}
               </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="rounded-xl h-12"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Job Title
                </Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Sales Manager"
                  className="rounded-xl h-12"
                />
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-2"
            >
              <h3 className="text-sm font-medium">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last updated</p>
                  <p className="font-medium">
                    {profile?.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-glow"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
