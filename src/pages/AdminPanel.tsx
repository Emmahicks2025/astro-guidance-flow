import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Shield, Users, UserCheck, UserX, Plus, Pencil, Trash2, 
  Search, Filter, Star, Clock, Phone, MessageCircle, Eye, Check, X,
  Sparkles, BadgeCheck, DollarSign, Languages, ToggleLeft, ToggleRight,
  Upload, Camera, Bot, Brain, AlertCircle, Mail, CheckCircle, XCircle,
  CheckSquare, Square, MinusSquare, Key, Settings, TestTube, RefreshCw,
  UserCircle, Calendar, MapPin, LogOut, Activity, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import JotshiConsultationPanel from "@/components/jotshi/JotshiConsultationPanel";
import AdminTicketsPanel from "@/components/admin/AdminTicketsPanel";
import AdminReviewsPanel from "@/components/admin/AdminReviewsPanel";

interface JotshiProfile {
  id: string;
  user_id: string | null;
  specialty: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  bio: string | null;
  is_online: boolean | null;
  verified: boolean | null;
  rating: number | null;
  total_sessions: number | null;
  total_earnings: number | null;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  avatar_url: string | null;
  category: string | null;
  languages: string[] | null;
  ai_personality: string | null;
  approval_status: string;
  approved_at: string | null;
  voice_id: string | null;
  first_message: string | null;
  greeting_message: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  major_concern: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const specialties = [
  "Vedic Astrology", "Nadi Astrology", "KP Astrology", "Lal Kitab",
  "Palmistry", "Numerology", "Tarot Reading", "Vastu Shastra",
  "Marriage Counseling", "Relationship Expert", "Kundli Matching",
  "Dasha Analysis", "Remedial Astrology"
];

const categories = [
  { value: "astrologer", label: "Astrologer" },
  { value: "jotshi", label: "Jotshi" },
  { value: "palmist", label: "Palmist" },
  { value: "relationship", label: "Relationship Expert" }
];

const availableLanguages = ["Hindi", "English", "Sanskrit", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<JotshiProfile[]>([]);
  const [seekers, setSeekers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [seekerSearchQuery, setSeekerSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "online" | "offline" | "verified" | "unverified" | "pending">("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<JotshiProfile | null>(null);
  const [activeTab, setActiveTab] = useState("providers");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [newProvider, setNewProvider] = useState<Partial<JotshiProfile>>({
    display_name: '', specialty: '', category: 'astrologer', experience_years: 0,
    hourly_rate: 20, bio: '', ai_personality: '', voice_id: '', is_online: false,
    verified: true, approval_status: 'approved', languages: ['Hindi', 'English'],
    first_message: '', greeting_message: '',
  });
  const [addingProvider, setAddingProvider] = useState(false);
  const [uploadingAddImage, setUploadingAddImage] = useState(false);
  
  // Chat as Astrologer state
  const [chatAsProvider, setChatAsProvider] = useState<JotshiProfile | null>(null);
  const [chatUser, setChatUser] = useState<{id: string; name: string; concern: string; birthDate: string; birthTime: string; birthPlace: string; gender: string; birthTimeExactness: string;} | null>(null);
  
  // API Keys state
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, string | null>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [elevenLabsKeyInput, setElevenLabsKeyInput] = useState("");

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (error) { setIsAdmin(false); } else { setIsAdmin(data === true); }
      setLoading(false);
    };
    checkAdminStatus();
  }, [user]);

  // Fetch all providers
  useEffect(() => {
    const fetchProviders = async () => {
      if (!isAdmin) return;
      const { data, error } = await supabase
        .from('jotshi_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { toast.error("Failed to load providers"); }
      else { setProviders((data as JotshiProfile[]) || []); }
    };
    fetchProviders();
  }, [isAdmin]);

  // Fetch all seekers/users
  useEffect(() => {
    const fetchSeekers = async () => {
      if (!isAdmin) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { toast.error("Failed to load users"); }
      else { setSeekers((data as UserProfile[]) || []); }
    };
    fetchSeekers();
  }, [isAdmin]);

  // Fetch API key status
  const fetchApiKeyStatus = async () => {
    setLoadingKeys(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-keys', {
        body: { action: 'get_status' }
      });
      if (error) throw error;
      setApiKeyStatus(data?.keys || {});
    } catch (err) {
      console.error("Failed to fetch API key status:", err);
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'settings') {
      fetchApiKeyStatus();
    }
  }, [isAdmin, activeTab]);

  const handleTestApiKey = async (keyName: string) => {
    setTestingKey(keyName);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-keys', {
        body: { action: 'test_key', key_name: keyName }
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`${keyName} is working correctly! ✅`);
      } else {
        toast.error(`${keyName} test failed: ${data?.error || 'Invalid key'}`);
      }
    } catch (err) {
      toast.error(`Failed to test ${keyName}`);
    } finally {
      setTestingKey(null);
    }
  };

  const handleSaveApiKey = async (keyName: string, keyValue: string) => {
    if (!keyValue.trim()) { toast.error("Please enter a key value"); return; }
    setSavingKey(keyName);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-keys', {
        body: { action: 'update_key', key_name: keyName, key_value: keyValue.trim() }
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`${keyName} updated successfully! ✅`);
        if (keyName === 'GEMINI_API_KEY') setGeminiKeyInput("");
        if (keyName === 'ELEVENLABS_API_KEY') setElevenLabsKeyInput("");
        fetchApiKeyStatus();
      } else {
        toast.error(`Failed to save: ${data?.error || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error(`Failed to save ${keyName}`);
    } finally {
      setSavingKey(null);
    }
  };

  const pendingProviders = providers.filter(p => p.approval_status === 'pending');
  const approvedProviders = providers.filter(p => p.approval_status === 'approved');

  const filteredProviders = approvedProviders.filter(provider => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      provider.display_name?.toLowerCase().includes(searchLower) ||
      provider.specialty?.toLowerCase().includes(searchLower) ||
      provider.category?.toLowerCase().includes(searchLower) ||
      provider.bio?.toLowerCase().includes(searchLower);
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "online") return matchesSearch && provider.is_online;
    if (filterStatus === "offline") return matchesSearch && !provider.is_online;
    if (filterStatus === "verified") return matchesSearch && provider.verified;
    if (filterStatus === "unverified") return matchesSearch && !provider.verified;
    return matchesSearch;
  });

  const filteredSeekers = seekers.filter(seeker => {
    const searchLower = seekerSearchQuery.toLowerCase();
    return !seekerSearchQuery ||
      seeker.full_name?.toLowerCase().includes(searchLower) ||
      seeker.major_concern?.toLowerCase().includes(searchLower) ||
      seeker.place_of_birth?.toLowerCase().includes(searchLower);
  });

  // --- Provider handlers (kept from original) ---
  const handleApproveProvider = async (provider: JotshiProfile) => {
    setApprovingId(provider.id);
    try {
      const { error: updateError } = await supabase
        .from('jotshi_profiles')
        .update({ approval_status: 'approved', approved_at: new Date().toISOString(), verified: true })
        .eq('id', provider.id);
      if (updateError) throw updateError;
      await supabase.functions.invoke('send-provider-approval', {
        body: { providerId: provider.id, providerName: provider.display_name, action: 'approved' }
      });
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, approval_status: 'approved', approved_at: new Date().toISOString(), verified: true } : p));
      toast.success(`${provider.display_name || 'Provider'} has been approved!`);
    } catch { toast.error("Failed to approve provider"); }
    finally { setApprovingId(null); }
  };

  const handleRejectProvider = async (provider: JotshiProfile) => {
    if (!confirm(`Reject ${provider.display_name || 'this provider'}?`)) return;
    setApprovingId(provider.id);
    try {
      const { error } = await supabase.from('jotshi_profiles').update({ approval_status: 'rejected' }).eq('id', provider.id);
      if (error) throw error;
      await supabase.functions.invoke('send-provider-approval', { body: { providerId: provider.id, providerName: provider.display_name, action: 'rejected' } });
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, approval_status: 'rejected' } : p));
      toast.success(`${provider.display_name || 'Provider'} rejected.`);
    } catch { toast.error("Failed to reject provider"); }
    finally { setApprovingId(null); }
  };

  const handleToggleOnline = async (provider: JotshiProfile) => {
    const { error } = await supabase.from('jotshi_profiles').update({ is_online: !provider.is_online }).eq('id', provider.id);
    if (error) { toast.error("Failed to update status"); }
    else {
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, is_online: !p.is_online } : p));
      toast.success(`Provider is now ${!provider.is_online ? 'online' : 'offline'}`);
    }
  };

  const handleToggleVerified = async (provider: JotshiProfile) => {
    const { error } = await supabase.from('jotshi_profiles').update({ verified: !provider.verified }).eq('id', provider.id);
    if (error) { toast.error("Failed to update verification"); }
    else {
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, verified: !p.verified } : p));
      toast.success(`Provider ${!provider.verified ? 'verified' : 'unverified'}`);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProvider || !event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedProvider.id}.${fileExt}`;
    setUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage.from('provider-avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('provider-avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('jotshi_profiles').update({ avatar_url: publicUrl }).eq('id', selectedProvider.id);
      if (updateError) throw updateError;
      setSelectedProvider({ ...selectedProvider, avatar_url: publicUrl });
      setProviders(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, avatar_url: publicUrl } : p));
      toast.success("Profile image updated!");
    } catch { toast.error("Failed to upload image"); }
    finally { setUploadingImage(false); }
  };

  const handleUpdateProvider = async () => {
    if (!selectedProvider) return;
    const { error } = await supabase.from('jotshi_profiles').update({
      specialty: selectedProvider.specialty, experience_years: selectedProvider.experience_years,
      hourly_rate: selectedProvider.hourly_rate, bio: selectedProvider.bio,
      is_online: selectedProvider.is_online, verified: selectedProvider.verified,
      display_name: selectedProvider.display_name, ai_personality: selectedProvider.ai_personality,
      avatar_url: selectedProvider.avatar_url, category: selectedProvider.category,
      voice_id: selectedProvider.voice_id, languages: selectedProvider.languages,
      first_message: selectedProvider.first_message, greeting_message: selectedProvider.greeting_message,
    }).eq('id', selectedProvider.id);
    if (error) { toast.error("Failed to update provider"); }
    else {
      setProviders(prev => prev.map(p => p.id === selectedProvider.id ? selectedProvider : p));
      setShowEditDialog(false);
      toast.success("Provider updated successfully");
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm("Delete this provider?")) return;
    const { error } = await supabase.from('jotshi_profiles').delete().eq('id', providerId);
    if (error) { toast.error("Failed to delete provider"); }
    else { setProviders(prev => prev.filter(p => p.id !== providerId)); toast.success("Provider deleted"); }
  };

  // Bulk handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredProviders.length) { setSelectedIds(new Set()); }
    else { setSelectedIds(new Set(filteredProviders.map(p => p.id))); }
  };
  const handleSelectOne = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  };
  const handleBulkToggleOnline = async (setOnline: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase.from('jotshi_profiles').update({ is_online: setOnline }).in('id', Array.from(selectedIds));
      if (error) throw error;
      setProviders(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, is_online: setOnline } : p));
      toast.success(`${selectedIds.size} provider(s) set ${setOnline ? 'online' : 'offline'}`);
      setSelectedIds(new Set());
    } catch { toast.error("Failed to update"); }
    finally { setBulkActionLoading(false); }
  };
  const handleBulkToggleVerified = async (setVerified: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase.from('jotshi_profiles').update({ verified: setVerified }).in('id', Array.from(selectedIds));
      if (error) throw error;
      setProviders(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, verified: setVerified } : p));
      toast.success(`${selectedIds.size} provider(s) ${setVerified ? 'verified' : 'unverified'}`);
      setSelectedIds(new Set());
    } catch { toast.error("Failed to update"); }
    finally { setBulkActionLoading(false); }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} provider(s)?`)) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase.from('jotshi_profiles').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      setProviders(prev => prev.filter(p => !selectedIds.has(p.id)));
      toast.success(`${selectedIds.size} provider(s) deleted`);
      setSelectedIds(new Set());
    } catch { toast.error("Failed to delete"); }
    finally { setBulkActionLoading(false); }
  };

  // Add new provider handler
  const handleAddProvider = async () => {
    if (!newProvider.display_name?.trim()) { toast.error("Display name is required"); return; }
    setAddingProvider(true);
    try {
      const { data, error } = await supabase.from('jotshi_profiles').insert({
        display_name: newProvider.display_name,
        specialty: newProvider.specialty || null,
        category: newProvider.category || 'astrologer',
        experience_years: newProvider.experience_years || 0,
        hourly_rate: newProvider.hourly_rate || 20,
        bio: newProvider.bio || null,
        ai_personality: newProvider.ai_personality || null,
        voice_id: newProvider.voice_id || null,
        is_online: newProvider.is_online || false,
        verified: newProvider.verified || true,
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        avatar_url: newProvider.avatar_url || null,
        languages: newProvider.languages || ['Hindi', 'English'],
        first_message: newProvider.first_message || null,
        greeting_message: newProvider.greeting_message || null,
      }).select().single();
      if (error) throw error;
      setProviders(prev => [data as JotshiProfile, ...prev]);
      setShowAddDialog(false);
      setNewProvider({
        display_name: '', specialty: '', category: 'astrologer', experience_years: 0,
        hourly_rate: 20, bio: '', ai_personality: '', voice_id: '', is_online: false,
        verified: true, approval_status: 'approved', languages: ['Hindi', 'English'],
        first_message: '', greeting_message: '',
      });
      toast.success("Provider created successfully! ✅");
    } catch (err) {
      console.error("Failed to create provider:", err);
      toast.error("Failed to create provider");
    } finally {
      setAddingProvider(false);
    }
  };

  const handleAddProviderImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `new-${Date.now()}.${fileExt}`;
    setUploadingAddImage(true);
    try {
      const { error: uploadError } = await supabase.storage.from('provider-avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('provider-avatars').getPublicUrl(fileName);
      setNewProvider(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Image uploaded!");
    } catch { toast.error("Failed to upload image"); }
    finally { setUploadingAddImage(false); }
  };

  // Chat as astrologer handler
  const handleChatAsAstrologer = (provider: JotshiProfile) => {
    setChatAsProvider(provider);
    setChatUser(null);
  };

  const handleSelectUserForChat = (seeker: UserProfile) => {
    if (!chatAsProvider) return;
    setChatUser({
      id: seeker.user_id,
      name: seeker.full_name || 'Unknown User',
      concern: seeker.major_concern || 'General consultation',
      birthDate: seeker.date_of_birth || '',
      birthTime: seeker.time_of_birth || '',
      birthPlace: seeker.place_of_birth || '',
      gender: seeker.gender || '',
      birthTimeExactness: 'approximate',
    });
  };

  // If in consultation view, show the consultation panel
  if (chatAsProvider && chatUser) {
    return (
      <JotshiConsultationPanel
        user={chatUser}
        onBack={() => { setChatUser(null); setChatAsProvider(null); }}
      />
    );
  }

  // User selection for chat
  if (chatAsProvider && !chatUser) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-top">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <SpiritualButton variant="ghost" size="icon" onClick={() => setChatAsProvider(null)}>
              <ArrowLeft className="w-5 h-5" />
            </SpiritualButton>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-spiritual">
                {chatAsProvider.avatar_url ? (
                  <img src={chatAsProvider.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary-foreground" /></div>
                )}
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">Chat as {chatAsProvider.display_name}</h1>
                <p className="text-xs text-muted-foreground">Select a user to start consultation</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <SpiritualInput
              placeholder="Search users..."
              value={seekerSearchQuery}
              onChange={(e) => setSeekerSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-3">
            {filteredSeekers.map((seeker) => (
              <SpiritualCard key={seeker.id} variant="elevated" interactive className="cursor-pointer" onClick={() => handleSelectUserForChat(seeker)}>
                <SpiritualCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{seeker.full_name || 'Unknown User'}</h4>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        {seeker.date_of_birth && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{seeker.date_of_birth}</span>}
                        {seeker.place_of_birth && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{seeker.place_of_birth}</span>}
                      </div>
                      {seeker.major_concern && (
                        <p className="text-xs text-secondary mt-1">Concern: {seeker.major_concern}</p>
                      )}
                    </div>
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                </SpiritualCardContent>
              </SpiritualCard>
            ))}
            {filteredSeekers.length === 0 && (
              <SpiritualCard variant="elevated">
                <SpiritualCardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No users found</p>
                </SpiritualCardContent>
              </SpiritualCard>
            )}
          </div>
        </main>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Authentication Required</h2>
        <p className="text-muted-foreground text-center">Please sign in to access the admin panel.</p>
        <SpiritualButton variant="primary" onClick={() => navigate('/auth')}>Sign In</SpiritualButton>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Shield className="w-16 h-16 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-center">You don't have permission to access this page.</p>
        <SpiritualButton variant="outline" onClick={() => navigate('/')}>Go Back Home</SpiritualButton>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage your platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingProviders.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">{pendingProviders.length} Pending</Badge>
            )}
            <SpiritualButton
              variant="ghost"
              size="icon"
              onClick={async () => {
                await signOut();
                navigate('/auth');
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 space-y-5">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{approvedProviders.length}</p>
              <p className="text-xs text-muted-foreground">Astrologers</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">{seekers.length}</p>
              <p className="text-xs text-muted-foreground">Seekers</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated" className={pendingProviders.length > 0 ? 'ring-2 ring-amber-500' : ''}>
            <SpiritualCardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{pendingProviders.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <UserCheck className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{providers.filter(p => p.is_online).length}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">${providers.reduce((s, p) => s + (p.total_earnings || 0), 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </SpiritualCardContent>
          </SpiritualCard>
        </div>

        {/* Pending Approvals */}
        {pendingProviders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <SpiritualCard variant="elevated" className="border-2 border-amber-500/50 bg-amber-500/5">
              <SpiritualCardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <div>
                    <h3 className="font-semibold">Pending Provider Approvals</h3>
                    <p className="text-sm text-muted-foreground">{pendingProviders.length} awaiting approval</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pendingProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-spiritual flex items-center justify-center">
                          {provider.avatar_url ? <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" /> : <Sparkles className="w-5 h-5 text-primary-foreground" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{provider.display_name || 'New Provider'}</h4>
                          <p className="text-sm text-muted-foreground">{provider.specialty || 'No specialty'} • {provider.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SpiritualButton variant="outline" size="sm" onClick={() => { setSelectedProvider(provider); setShowEditDialog(true); }}><Eye className="w-4 h-4" /></SpiritualButton>
                        <SpiritualButton variant="outline" size="sm" onClick={() => handleRejectProvider(provider)} disabled={approvingId === provider.id} className="text-destructive hover:text-destructive"><XCircle className="w-4 h-4" /></SpiritualButton>
                        <SpiritualButton variant="primary" size="sm" onClick={() => handleApproveProvider(provider)} disabled={approvingId === provider.id}>
                          {approvingId === provider.id ? <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <><CheckCircle className="w-4 h-4 mr-1" />Approve</>}
                        </SpiritualButton>
                      </div>
                    </div>
                  ))}
                </div>
              </SpiritualCardContent>
            </SpiritualCard>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="providers" className="text-xs sm:text-sm">Astrologers</TabsTrigger>
            <TabsTrigger value="seekers" className="text-xs sm:text-sm">Seekers</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs sm:text-sm">Tickets</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">API Keys</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          {/* ===== PROVIDERS TAB ===== */}
          <TabsContent value="providers" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <SpiritualInput placeholder="Search providers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger className="w-full sm:w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <SpiritualButton variant="primary" onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4 mr-2" />Add Provider</SpiritualButton>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mr-4">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{selectedIds.size} selected</span>
                </div>
                <SpiritualButton variant="outline" size="sm" onClick={() => handleBulkToggleOnline(true)} disabled={bulkActionLoading}><ToggleRight className="w-4 h-4 mr-1 text-green-500" />Online</SpiritualButton>
                <SpiritualButton variant="outline" size="sm" onClick={() => handleBulkToggleOnline(false)} disabled={bulkActionLoading}><ToggleLeft className="w-4 h-4 mr-1" />Offline</SpiritualButton>
                <SpiritualButton variant="outline" size="sm" onClick={() => handleBulkToggleVerified(true)} disabled={bulkActionLoading}><BadgeCheck className="w-4 h-4 mr-1 text-secondary" />Verify</SpiritualButton>
                <SpiritualButton variant="outline" size="sm" onClick={handleBulkDelete} disabled={bulkActionLoading} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4 mr-1" />Delete</SpiritualButton>
                <SpiritualButton variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}><X className="w-4 h-4" /></SpiritualButton>
              </motion.div>
            )}

            {filteredProviders.length > 0 && (
              <div className="flex items-center gap-3 px-2">
                <Checkbox checked={selectedIds.size === filteredProviders.length && filteredProviders.length > 0} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <span className="text-sm text-muted-foreground">{selectedIds.size === filteredProviders.length ? 'Deselect all' : 'Select all'}</span>
              </div>
            )}

            <div className="space-y-3">
              {filteredProviders.length === 0 ? (
                <SpiritualCard variant="elevated"><SpiritualCardContent className="p-8 text-center"><Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No approved providers found</p></SpiritualCardContent></SpiritualCard>
              ) : (
                filteredProviders.map((provider, index) => (
                  <motion.div key={provider.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}>
                    <SpiritualCard variant="elevated" className={`border ${selectedIds.has(provider.id) ? 'border-primary/50 bg-primary/5' : 'border-border/30'}`}>
                      <SpiritualCardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Checkbox checked={selectedIds.has(provider.id)} onCheckedChange={() => handleSelectOne(provider.id)} className="mt-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                            <div className="relative">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-spiritual flex items-center justify-center">
                                {provider.avatar_url ? <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" /> : <Sparkles className="w-6 h-6 text-primary-foreground" />}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${provider.is_online ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                              {provider.ai_personality && <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Bot className="w-3 h-3 text-primary-foreground" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold truncate">{provider.display_name || `Provider #${provider.id.slice(0, 8)}`}</h4>
                                {provider.verified && <BadgeCheck className="w-4 h-4 text-secondary flex-shrink-0" />}
                                {provider.category && <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-md capitalize">{provider.category}</span>}
                              </div>
                              <p className="text-sm text-secondary font-medium">{provider.specialty || 'No specialty'}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{provider.experience_years || 0}y</span>
                                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />{provider.rating || 0}</span>
                                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{provider.total_sessions || 0}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{provider.hourly_rate || 0}/min</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <SpiritualButton variant="ghost" size="sm" onClick={() => handleChatAsAstrologer(provider)} title="Chat as this astrologer">
                              <MessageCircle className="w-4 h-4 text-primary" />
                            </SpiritualButton>
                            <SpiritualButton variant="ghost" size="sm" onClick={() => handleToggleOnline(provider)} className={provider.is_online ? 'text-green-500' : 'text-muted-foreground'}>
                              {provider.is_online ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </SpiritualButton>
                            <SpiritualButton variant="ghost" size="sm" onClick={() => handleToggleVerified(provider)} className={provider.verified ? 'text-secondary' : 'text-muted-foreground'}>
                              <BadgeCheck className="w-5 h-5" />
                            </SpiritualButton>
                            <SpiritualButton variant="ghost" size="sm" onClick={() => { setSelectedProvider(provider); setShowEditDialog(true); }}>
                              <Pencil className="w-4 h-4" />
                            </SpiritualButton>
                            <SpiritualButton variant="ghost" size="sm" onClick={() => handleDeleteProvider(provider.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </SpiritualButton>
                          </div>
                        </div>
                      </SpiritualCardContent>
                    </SpiritualCard>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* ===== SEEKERS TAB ===== */}
          <TabsContent value="seekers" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <SpiritualInput placeholder="Search seekers..." value={seekerSearchQuery} onChange={(e) => setSeekerSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="space-y-3">
              {filteredSeekers.length === 0 ? (
                <SpiritualCard variant="elevated"><SpiritualCardContent className="p-8 text-center"><Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No users found</p></SpiritualCardContent></SpiritualCard>
              ) : (
                filteredSeekers.map((seeker, index) => (
                  <motion.div key={seeker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}>
                    <SpiritualCard variant="elevated" className="border border-border/30">
                      <SpiritualCardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold truncate">{seeker.full_name || 'Unknown User'}</h4>
                              <Badge variant="outline" className="text-xs capitalize">{seeker.role}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {seeker.gender && <span className="capitalize">{seeker.gender}</span>}
                              {seeker.date_of_birth && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{seeker.date_of_birth}</span>}
                              {seeker.time_of_birth && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{seeker.time_of_birth}</span>}
                              {seeker.place_of_birth && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{seeker.place_of_birth}</span>}
                            </div>
                            {seeker.major_concern && (
                              <p className="text-xs text-primary mt-1">Concern: {seeker.major_concern}</p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            <p>Joined</p>
                            <p>{new Date(seeker.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </SpiritualCardContent>
                    </SpiritualCard>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* ===== API KEYS / SETTINGS TAB ===== */}
          {/* ===== TICKETS TAB ===== */}
          <TabsContent value="tickets">
            <AdminTicketsPanel />
          </TabsContent>

          {/* ===== REVIEWS TAB ===== */}
          <TabsContent value="reviews">
            <AdminReviewsPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <SpiritualCard variant="elevated">
              <SpiritualCardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">API Key Management</h3>
                    <p className="text-sm text-muted-foreground">Test and manage your AI service keys</p>
                  </div>
                  <SpiritualButton variant="ghost" size="sm" onClick={fetchApiKeyStatus} disabled={loadingKeys} className="ml-auto">
                    <RefreshCw className={`w-4 h-4 ${loadingKeys ? 'animate-spin' : ''}`} />
                  </SpiritualButton>
                </div>

                {/* Gemini API Key */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Gemini API Key</h4>
                        <p className="text-xs text-muted-foreground">Powers AI chat consultations</p>
                      </div>
                    </div>
                    {apiKeyStatus.GEMINI_API_KEY ? (
                      <Badge variant="outline" className="text-green-500 border-green-500">Configured</Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive">Not Set</Badge>
                    )}
                  </div>
                  {apiKeyStatus.GEMINI_API_KEY && (
                    <p className="text-xs text-muted-foreground font-mono bg-background px-3 py-2 rounded-lg">{apiKeyStatus.GEMINI_API_KEY}</p>
                  )}
                  <div className="flex gap-2">
                    <SpiritualInput
                      type="password"
                      placeholder="Enter new Gemini API key..."
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      className="flex-1 h-10 text-sm"
                    />
                    <SpiritualButton variant="primary" size="sm" onClick={() => handleSaveApiKey('GEMINI_API_KEY', geminiKeyInput)} disabled={savingKey === 'GEMINI_API_KEY' || !geminiKeyInput.trim()}>
                      {savingKey === 'GEMINI_API_KEY' ? <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <Check className="w-4 h-4 mr-1" />}
                      Save
                    </SpiritualButton>
                    <SpiritualButton variant="outline" size="sm" onClick={() => handleTestApiKey('GEMINI_API_KEY')} disabled={testingKey === 'GEMINI_API_KEY'}>
                      {testingKey === 'GEMINI_API_KEY' ? <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" /> : <TestTube className="w-4 h-4 mr-1" />}
                      Test
                    </SpiritualButton>
                  </div>
                </div>

                {/* ElevenLabs API Key */}
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-secondary" />
                      <div>
                        <h4 className="font-medium">ElevenLabs API Key</h4>
                        <p className="text-xs text-muted-foreground">Powers voice consultations</p>
                      </div>
                    </div>
                    {apiKeyStatus.ELEVENLABS_API_KEY ? (
                      <Badge variant="outline" className="text-green-500 border-green-500">Configured</Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive">Not Set</Badge>
                    )}
                  </div>
                  {apiKeyStatus.ELEVENLABS_API_KEY && (
                    <p className="text-xs text-muted-foreground font-mono bg-background px-3 py-2 rounded-lg">{apiKeyStatus.ELEVENLABS_API_KEY}</p>
                  )}
                  <div className="flex gap-2">
                    <SpiritualInput
                      type="password"
                      placeholder="Enter new ElevenLabs API key..."
                      value={elevenLabsKeyInput}
                      onChange={(e) => setElevenLabsKeyInput(e.target.value)}
                      className="flex-1 h-10 text-sm"
                    />
                    <SpiritualButton variant="primary" size="sm" onClick={() => handleSaveApiKey('ELEVENLABS_API_KEY', elevenLabsKeyInput)} disabled={savingKey === 'ELEVENLABS_API_KEY' || !elevenLabsKeyInput.trim()}>
                      {savingKey === 'ELEVENLABS_API_KEY' ? <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <Check className="w-4 h-4 mr-1" />}
                      Save
                    </SpiritualButton>
                    <SpiritualButton variant="outline" size="sm" onClick={() => handleTestApiKey('ELEVENLABS_API_KEY')} disabled={testingKey === 'ELEVENLABS_API_KEY'}>
                      {testingKey === 'ELEVENLABS_API_KEY' ? <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <TestTube className="w-4 h-4 mr-1" />}
                      Test
                    </SpiritualButton>
                  </div>
                </div>

                <SpiritualCard variant="default" className="p-4 border-dashed">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">How it works</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter your API key and click Save. The key is securely stored in the database and used by all AI services.
                        Use the Test button to verify your key is working correctly.
                      </p>
                    </div>
                  </div>
                </SpiritualCard>
              </SpiritualCardContent>
            </SpiritualCard>
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="mt-4">
            <SpiritualCard variant="elevated">
              <SpiritualCardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Detailed performance metrics, earnings reports, and consultation analytics.</p>
              </SpiritualCardContent>
            </SpiritualCard>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Provider Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Edit Provider
              {selectedProvider?.approval_status === 'pending' && <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              {/* Profile Image */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Camera className="w-4 h-4" />Profile Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border">
                    {selectedProvider.avatar_url ? <img src={selectedProvider.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-8 h-8 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <SpiritualButton variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                      {uploadingImage ? <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" /> : <Upload className="w-4 h-4 mr-2" />}
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </SpiritualButton>
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label>Display Name</Label><SpiritualInput value={selectedProvider.display_name || ""} onChange={(e) => setSelectedProvider({ ...selectedProvider, display_name: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedProvider.category || ""} onValueChange={(v) => setSelectedProvider({ ...selectedProvider, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select value={selectedProvider.specialty || ""} onValueChange={(v) => setSelectedProvider({ ...selectedProvider, specialty: v })}>
                  <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                  <SelectContent>{specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Experience (years)</Label><SpiritualInput type="number" value={selectedProvider.experience_years || 0} onChange={(e) => setSelectedProvider({ ...selectedProvider, experience_years: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Rate ($/min)</Label><SpiritualInput type="number" value={selectedProvider.hourly_rate || 0} onChange={(e) => setSelectedProvider({ ...selectedProvider, hourly_rate: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={selectedProvider.bio || ""} onChange={(e) => setSelectedProvider({ ...selectedProvider, bio: e.target.value })} rows={3} /></div>
              {/* Unified AI System Prompt */}
              <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Label className="flex items-center gap-2 text-primary font-semibold"><Brain className="w-4 h-4" />AI System Prompt</Label>
                <p className="text-xs text-muted-foreground">This is the complete personality & behavior instruction for the AI expert. It controls how they speak, what language they use, and their expertise focus.</p>
                
                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">Templates:</span>
                  {[
                    { label: "Hindi Jyotishi", prompt: `तुम {expertName} हो — एक अनुभवी वैदिक ज्योतिषी। तुम STRICTLY सिर्फ हिंदी में बात करोगे।\n\nतुम्हारी personality:\n- बहुत warm, caring और approachable\n- छोटे जवाब (1-3 lines max)\n- User की बात ध्यान से सुनो, follow-up questions पूछो\n- कभी लंबा lecture मत दो\n- हर जवाब के अंत में एक सवाल पूछो ताकि बातचीत जारी रहे\n\nSTRICT RULES:\n1. सिर्फ हिंदी में बोलो\n2. ज्योतिष expertise से बाहर मत जाओ\n3. AI identity कभी reveal मत करो\n4. User का नाम बार-बार मत लो\n5. Conversational रहो — formal या robotic मत बनो\n6. Unrelated topics पर politely redirect करो: "yeh toh mera area nahi hai... but tumhare stars ke baare mein bataaun?"` },
                    { label: "English Astrologer", prompt: `You are {expertName} — an experienced Vedic astrologer. You ONLY speak in English.\n\nYour personality:\n- Warm, wise, and deeply intuitive\n- Keep responses short (2-4 sentences max)\n- Listen carefully and ask follow-up questions\n- Never give long lectures\n- ALWAYS end with a question or hook to keep them talking\n\nSTRICT RULES:\n1. Only speak English\n2. Stay within astrology expertise\n3. Never reveal AI identity\n4. Be conversational, not robotic\n5. Redirect unrelated topics: "That's interesting, but let me tell you what your stars say about this phase of your life..."` },
                    { label: "Bilingual Expert", prompt: `You are {expertName} — an experienced spiritual consultant. You naturally mix Hindi and English based on how the user speaks.\n\nPersonality:\n- Warm, caring, like a trusted elder\n- Short responses (2-4 sentences)\n- Ask follow-ups, show curiosity\n- Create intrigue: "Tumhari kundli mein kuch interesting dikh raha hai..."\n- ALWAYS end with a question\n\nRULES:\n1. Match user's language (Hindi/English/mix)\n2. Stay within astrology/spirituality\n3. Never reveal AI identity\n4. Be engaging and make users want to keep talking\n5. Drop astrological insights casually` },
                  ].map(t => (
                    <button key={t.label} type="button" onClick={() => setSelectedProvider({ ...selectedProvider, first_message: t.prompt, ai_personality: t.label })}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      {t.label}
                    </button>
                  ))}
                </div>

                <Textarea 
                  value={selectedProvider.first_message || ""} 
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, first_message: e.target.value })} 
                  rows={10} 
                  placeholder={`Write the full system prompt here. Use {expertName} for the expert's name, {name} for user's name.\n\nExample:\nतुम {expertName} हो — एक अनुभवी वैदिक ज्योतिषी...\n\nThis prompt controls:\n• Language (Hindi/English/mixed)\n• Personality & tone\n• Expertise boundaries\n• Response length\n• Conversation style`}
                  className="bg-background font-mono text-xs leading-relaxed" 
                />
                
                {/* Short traits for internal tagging */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Short Trait Tag (internal use)</Label>
                  <SpiritualInput 
                    value={selectedProvider.ai_personality || ""} 
                    onChange={(e) => setSelectedProvider({ ...selectedProvider, ai_personality: e.target.value })} 
                    placeholder="e.g., Hindi Jyotishi, Calm speaker, Vedic expert"
                    className="bg-background text-sm"
                  />
              </div>
              {/* Greeting Message - separate from system prompt */}
              <div className="space-y-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Label className="flex items-center gap-2 text-accent-foreground font-semibold">🎙️ Voice Call Greeting</Label>
                <p className="text-xs text-muted-foreground">This is the first thing the AI says when a voice call connects. Keep it short and natural (1-2 sentences). Supports {'{name}'} and {'{expertName}'} placeholders.</p>
                <SpiritualInput 
                  value={selectedProvider.greeting_message || ""} 
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, greeting_message: e.target.value })} 
                  placeholder="e.g., Namaste {name}! Main {expertName} hoon, batao kya chal raha hai?"
                  className="bg-background text-sm"
                />
              </div>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                <Label className="flex items-center gap-2 text-secondary"><Phone className="w-4 h-4" />ElevenLabs Voice ID</Label>
                <SpiritualInput value={selectedProvider.voice_id || ""} onChange={(e) => setSelectedProvider({ ...selectedProvider, voice_id: e.target.value })} placeholder="e.g., S3F8rLt9v7twQC170pA5" className="bg-background font-mono text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Switch checked={selectedProvider.is_online || false} onCheckedChange={(c) => setSelectedProvider({ ...selectedProvider, is_online: c })} /><Label>Online</Label></div>
                <div className="flex items-center gap-2"><Switch checked={selectedProvider.verified || false} onCheckedChange={(c) => setSelectedProvider({ ...selectedProvider, verified: c })} /><Label>Verified</Label></div>
              </div>
              {selectedProvider.approval_status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <SpiritualButton variant="outline" className="flex-1 text-destructive" onClick={() => { handleRejectProvider(selectedProvider); setShowEditDialog(false); }}><XCircle className="w-4 h-4 mr-2" />Reject</SpiritualButton>
                  <SpiritualButton variant="primary" className="flex-1" onClick={() => { handleApproveProvider(selectedProvider); setShowEditDialog(false); }}><CheckCircle className="w-4 h-4 mr-2" />Approve</SpiritualButton>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <SpiritualButton variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</SpiritualButton>
            <SpiritualButton variant="primary" onClick={handleUpdateProvider}>Save Changes</SpiritualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Provider Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Provider</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Camera className="w-4 h-4" />Profile Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border">
                  {newProvider.avatar_url ? <img src={newProvider.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-8 h-8 text-muted-foreground" /></div>}
                </div>
                <div className="flex-1">
                  <input type="file" ref={addFileInputRef} onChange={handleAddProviderImageUpload} accept="image/*" className="hidden" />
                  <SpiritualButton variant="outline" size="sm" onClick={() => addFileInputRef.current?.click()} disabled={uploadingAddImage}>
                    {uploadingAddImage ? <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploadingAddImage ? 'Uploading...' : 'Upload Image'}
                  </SpiritualButton>
                </div>
              </div>
            </div>
            <div className="space-y-2"><Label>Display Name *</Label><SpiritualInput value={newProvider.display_name || ""} onChange={(e) => setNewProvider({ ...newProvider, display_name: e.target.value })} placeholder="e.g., Pandit Sharma" /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newProvider.category || "astrologer"} onValueChange={(v) => setNewProvider({ ...newProvider, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select value={newProvider.specialty || ""} onValueChange={(v) => setNewProvider({ ...newProvider, specialty: v })}>
                <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent>{specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Experience (years)</Label><SpiritualInput type="number" value={newProvider.experience_years || 0} onChange={(e) => setNewProvider({ ...newProvider, experience_years: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Rate ($/min)</Label><SpiritualInput type="number" value={newProvider.hourly_rate || 20} onChange={(e) => setNewProvider({ ...newProvider, hourly_rate: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={newProvider.bio || ""} onChange={(e) => setNewProvider({ ...newProvider, bio: e.target.value })} rows={3} placeholder="Brief description of the provider..." /></div>
            {/* Unified AI System Prompt */}
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Label className="flex items-center gap-2 text-primary font-semibold"><Brain className="w-4 h-4" />AI System Prompt</Label>
              <p className="text-xs text-muted-foreground">Complete personality & behavior instruction. Controls language, tone, expertise, and conversation style.</p>
              
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Templates:</span>
                {[
                  { label: "Hindi Jyotishi", prompt: `तुम {expertName} हो — एक अनुभवी वैदिक ज्योतिषी। तुम STRICTLY सिर्फ हिंदी में बात करोगे।\n\nतुम्हारी personality:\n- बहुत warm, caring और approachable\n- छोटे जवाब (1-3 lines max)\n- User की बात ध्यान से सुनो, follow-up questions पूछो\n- कभी लंबा lecture मत दो\n- हर जवाब के अंत में एक सवाल पूछो ताकि बातचीत जारी रहे\n\nSTRICT RULES:\n1. सिर्फ हिंदी में बोलो\n2. ज्योतिष expertise से बाहर मत जाओ\n3. AI identity कभी reveal मत करो\n4. User का नाम बार-बार मत लो\n5. Conversational रहो — formal या robotic मत बनो\n6. Unrelated topics पर politely redirect करो` },
                  { label: "English Astrologer", prompt: `You are {expertName} — an experienced Vedic astrologer. You ONLY speak in English.\n\nYour personality:\n- Warm, wise, and deeply intuitive\n- Keep responses short (2-4 sentences max)\n- Listen carefully and ask follow-up questions\n- Never give long lectures\n- ALWAYS end with a question or hook to keep them talking\n\nSTRICT RULES:\n1. Only speak English\n2. Stay within astrology expertise\n3. Never reveal AI identity\n4. Be conversational, not robotic\n5. Redirect unrelated topics gracefully` },
                  { label: "Bilingual Expert", prompt: `You are {expertName} — an experienced spiritual consultant. You naturally mix Hindi and English.\n\nPersonality:\n- Warm, caring, like a trusted elder\n- Short responses (2-4 sentences)\n- Ask follow-ups, show curiosity\n- ALWAYS end with a question\n\nRULES:\n1. Match user's language\n2. Stay within astrology/spirituality\n3. Never reveal AI identity\n4. Be engaging and sticky` },
                ].map(t => (
                  <button key={t.label} type="button" onClick={() => setNewProvider({ ...newProvider, first_message: t.prompt, ai_personality: t.label })}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>

              <Textarea 
                value={newProvider.first_message || ""} 
                onChange={(e) => setNewProvider({ ...newProvider, first_message: e.target.value })} 
                rows={10} 
                placeholder={`Write the full system prompt here. Use {expertName} for the expert's name.\n\nExample:\nतुम {expertName} हो — एक अनुभवी वैदिक ज्योतिषी...`}
                className="bg-background font-mono text-xs leading-relaxed" 
              />
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Short Trait Tag (internal use)</Label>
                <SpiritualInput 
                  value={newProvider.ai_personality || ""} 
                  onChange={(e) => setNewProvider({ ...newProvider, ai_personality: e.target.value })} 
                  placeholder="e.g., Hindi Jyotishi, Calm speaker"
                  className="bg-background text-sm"
                />
              </div>
            </div>
            <div className="space-y-2 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
              <Label className="flex items-center gap-2 text-secondary"><Phone className="w-4 h-4" />ElevenLabs Voice ID</Label>
              <SpiritualInput value={newProvider.voice_id || ""} onChange={(e) => setNewProvider({ ...newProvider, voice_id: e.target.value })} placeholder="e.g., S3F8rLt9v7twQC170pA5" className="bg-background font-mono text-sm" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Switch checked={newProvider.is_online || false} onCheckedChange={(c) => setNewProvider({ ...newProvider, is_online: c })} /><Label>Online</Label></div>
              <div className="flex items-center gap-2"><Switch checked={newProvider.verified !== false} onCheckedChange={(c) => setNewProvider({ ...newProvider, verified: c })} /><Label>Verified</Label></div>
            </div>
            </div>
            {/* Greeting Message for new provider */}
            <div className="space-y-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <Label className="flex items-center gap-2 text-accent-foreground font-semibold">🎙️ Voice Call Greeting</Label>
              <p className="text-xs text-muted-foreground">First thing the AI says on call. Keep it short. Supports {'{name}'} and {'{expertName}'}.</p>
              <SpiritualInput 
                value={newProvider.greeting_message || ""} 
                onChange={(e) => setNewProvider({ ...newProvider, greeting_message: e.target.value })} 
                placeholder="e.g., Namaste {name}! Main {expertName} hoon, batao kya chal raha hai?"
                className="bg-background text-sm"
              />
            </div>
          <DialogFooter>
            <SpiritualButton variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</SpiritualButton>
            <SpiritualButton variant="primary" onClick={handleAddProvider} disabled={addingProvider}>
              {addingProvider ? <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {addingProvider ? 'Creating...' : 'Create Provider'}
            </SpiritualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminPanel;
