import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Save, Loader2, Shield, Mail, Calendar, BarChart3, AlertTriangle, Camera, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AvatarPicker from "@/components/AvatarPicker";

const ProfileSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please select an image file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Maximum size is 2MB." });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ variant: "destructive", title: "Upload failed", description: uploadError.message });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    setUploading(false);

    if (updateError) {
      toast({ variant: "destructive", title: "Failed to save avatar", description: updateError.message });
    } else {
      setAvatarUrl(url);
      await refreshProfile();
      toast({ title: "Avatar updated", description: "Your profile picture has been changed." });
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading(true);
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setAvatarUrl(null);
    await refreshProfile();
    setUploading(false);
    toast({ title: "Avatar removed" });
  };

  const handlePresetAvatar = async (src: string) => {
    if (!user) return;
    setUploading(true);
    const { error } = await supabase.from("profiles").update({ avatar_url: src }).eq("user_id", user.id);
    setUploading(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to set avatar", description: error.message });
    } else {
      setAvatarUrl(src);
      setShowAvatarPicker(false);
      await refreshProfile();
      toast({ title: "Avatar updated", description: "Your avatar has been changed." });
    }
  };

  const handleSave = async () => {
    if (!user || !username.trim()) {
      toast({ variant: "destructive", title: "Username is required" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, username: username.trim() })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
            )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Camera className="w-6 h-6 text-primary" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
             {avatarUrl ? (
              <div className="flex items-center justify-center gap-3 mb-3">
                <button onClick={handleRemoveAvatar} disabled={uploading} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
                <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  <Pencil className="w-3 h-3" /> Change
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mx-auto mb-3 transition-colors">
                <Pencil className="w-3 h-3" /> Choose avatar
              </button>
            )}
            <h3 className="text-lg font-bold text-foreground">{profile?.display_name || profile?.username || "User"}</h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">{user?.email}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Member since {memberSince}</span>
            </div>

            <div className="border-t border-border mt-5 pt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><BarChart3 className="w-4 h-4" /> Total Scans</span>
                <span className="font-mono font-bold text-foreground">{profile?.total_scans ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className="w-4 h-4" /> Threats Found</span>
                <span className="font-mono font-bold text-foreground">{profile?.threats_detected ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4" /> Risk Baseline</span>
                <span className="font-mono font-bold text-foreground">{profile?.risk_baseline ?? 50}</span>
              </div>
            </div>

            <div className="border-t border-border mt-5 pt-5">
              <AvatarPicker currentAvatar={avatarUrl} onSelect={handlePresetAvatar} loading={uploading} />
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2.5">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono text-muted-foreground">{user?.email}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-secondary border-border font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="bg-secondary border-border text-sm"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Authentication</p>
                  <p className="text-xs text-muted-foreground">Email & password authentication active</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded-full bg-success/10 text-success border border-success/20">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Session</p>
                  <p className="text-xs text-muted-foreground">Current session is valid and encrypted</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded-full bg-success/10 text-success border border-success/20">SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
