import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Camera, User, Loader2, Save,
  Briefcase, Globe, IndianRupee, Clock, FileText
} from "lucide-react";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Astrologer", "Palmist", "Numerologist", "Tarot Reader", "Vastu Expert", "Spiritual Guru"];
const ALL_LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Gujarati", "Punjabi", "Malayalam"];

const ExpertProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState("Astrologer");
  const [hourlyRate, setHourlyRate] = useState(20);
  const [experienceYears, setExperienceYears] = useState(0);
  const [languages, setLanguages] = useState<string[]>(["Hindi", "English"]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("jotshi_profiles")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (data?.[0]) {
        const p = data[0];
        setDisplayName(p.display_name || "");
        setBio(p.bio || "");
        setSpecialty(p.specialty || "");
        setCategory(p.category || "Astrologer");
        setHourlyRate(p.hourly_rate || 20);
        setExperienceYears(p.experience_years || 0);
        setLanguages(p.languages || ["Hindi", "English"]);
        setAvatarPreview(p.avatar_url || null);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image too large. Max 50MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("provider-avatars")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("provider-avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
        setAvatarFile(null);
      }

      const updates: Record<string, any> = {
        display_name: displayName,
        bio,
        specialty,
        category: category.toLowerCase(),
        hourly_rate: hourlyRate,
        experience_years: experienceYears,
        languages,
      };
      if (avatarUrl) updates.avatar_url = avatarUrl;

      const { error } = await supabase
        .from("jotshi_profiles")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate(-1);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <span className="font-display font-bold text-xl">Edit Profile</span>
          <div className="flex-1" />
          <SpiritualButton variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-1">{saving ? "Saving…" : "Save"}</span>
          </SpiritualButton>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-primary/20" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
                <User className="w-14 h-14 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
          <p className="text-xs text-muted-foreground">Tap photo to change (max 50MB)</p>
        </div>

        {/* Basic Info */}
        <SpiritualCard variant="elevated" className="p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <User className="w-4 h-4" /> Basic Information
          </h3>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your professional name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your expertise and approach…" rows={4} />
          </div>
        </SpiritualCard>

        {/* Professional Details */}
        <SpiritualCard variant="elevated" className="p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <Briefcase className="w-4 h-4" /> Professional Details
          </h3>
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Dasha Analysis, Prashna Kundli" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={category.toLowerCase() === cat.toLowerCase() ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Experience (years)
              </Label>
              <Input
                id="experience"
                type="number"
                min={0}
                max={60}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate" className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" /> Rate (₹/min)
              </Label>
              <Input
                id="rate"
                type="number"
                min={1}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </SpiritualCard>

        {/* Languages */}
        <SpiritualCard variant="elevated" className="p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <Globe className="w-4 h-4" /> Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Badge>
            ))}
          </div>
          {languages.length === 0 && (
            <p className="text-xs text-destructive">Please select at least one language.</p>
          )}
        </SpiritualCard>

        {/* Save Button (bottom) */}
        <SpiritualButton variant="primary" size="lg" className="w-full" onClick={handleSave} disabled={saving || !displayName.trim() || languages.length === 0}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Profile"}
        </SpiritualButton>
      </main>
    </motion.div>
  );
};

export default ExpertProfileEdit;
