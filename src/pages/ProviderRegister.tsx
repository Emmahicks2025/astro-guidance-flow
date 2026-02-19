import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Star, Users, Hand, Heart, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const categories = [
  { value: "astrologer", label: "Astrologer", icon: Star, description: "Vedic, Nadi, KP Astrology" },
  { value: "jotshi", label: "Jotshi", icon: Users, description: "Kundli matching, Dasha analysis" },
  { value: "palmist", label: "Palmist", icon: Hand, description: "Palm reading, Hasta Shastra" },
  { value: "relationship", label: "Relationship Expert", icon: Heart, description: "Marriage counseling, Love guidance" }
];

const specialtiesByCategory: Record<string, string[]> = {
  astrologer: ["Vedic Astrology", "Nadi Astrology", "KP Astrology", "Lal Kitab", "Numerology", "Tarot Reading", "Vastu Shastra", "Remedial Astrology"],
  jotshi: ["Kundli Matching", "Dasha Analysis", "Vedic Astrology", "Lal Kitab", "Numerology"],
  palmist: ["Palmistry", "Numerology", "Hasta Shastra"],
  relationship: ["Marriage Counseling", "Relationship Expert", "Love Guidance", "Compatibility Analysis"]
};

const ProviderRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: "",
    category: "",
    specialty: "",
    experience_years: "",
    hourly_rate: "20",
    bio: "",
    languages: ["Hindi", "English"]
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image must be under 50MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    if (!formData.display_name || !formData.category || !formData.specialty) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      let avatarUrl: string | null = null;

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('provider-avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload photo");
        } else {
          const { data: urlData } = supabase.storage
            .from('provider-avatars')
            .getPublicUrl(filePath);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from("jotshi_profiles")
        .insert({
          user_id: user.id,
          display_name: formData.display_name,
          category: formData.category,
          specialty: formData.specialty,
          experience_years: parseInt(formData.experience_years) || 0,
          hourly_rate: parseInt(formData.hourly_rate) || 20,
          bio: formData.bio,
          languages: formData.languages,
          approval_status: "pending",
          is_online: false,
          verified: false,
          avatar_url: avatarUrl
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already registered as a provider");
        } else {
          throw error;
        }
      } else {
        toast.success("Application submitted successfully!");
        navigate('/astrologer');
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Sparkles className="w-16 h-16 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Sign In Required</h2>
        <p className="text-muted-foreground text-center">Please sign in to register as a provider.</p>
        <SpiritualButton variant="primary" onClick={() => navigate('/auth')}>
          Sign In
        </SpiritualButton>
      </div>
    );
  }

  // Removed old submitted state - now navigates to /astrologer

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-spiritual flex items-center justify-center shadow-spiritual">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Become a Provider</h1>
              <p className="text-xs text-muted-foreground">Join our expert community</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Your Category *</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.value;
                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, category: cat.value, specialty: "" })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h4 className="font-medium text-foreground">{cat.label}</h4>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Personal Details */}
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Personal Details</h3>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="avatar-upload">
                      <SpiritualButton type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        {avatarPreview ? "Change Photo" : "Upload Photo"}
                      </SpiritualButton>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 50MB.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <SpiritualInput
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Pandit Ramesh Sharma"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Specialty *</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={(v) => setFormData({ ...formData, specialty: v })}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.category ? "Select your specialty" : "Select a category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(specialtiesByCategory[formData.category] || []).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <SpiritualInput
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="e.g., 10"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate ($/min)</Label>
                  <SpiritualInput
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    placeholder="e.g., 25"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio / About You</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your experience, qualifications, and what makes you unique..."
                  rows={4}
                />
              </div>
            </SpiritualCardContent>
          </SpiritualCard>

          {/* Terms */}
          <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
            <p>
              By submitting this application, you agree to our terms of service and acknowledge that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your profile will be reviewed by our admin team</li>
              <li>You'll receive email notifications about your application status</li>
              <li>Once approved, your profile will be visible to users on the platform</li>
            </ul>
          </div>

          <SpiritualButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading || !formData.category || !formData.display_name || !formData.specialty}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </div>
            ) : (
              "Submit Application"
            )}
          </SpiritualButton>
        </form>
      </main>
    </motion.div>
  );
};

export default ProviderRegister;
