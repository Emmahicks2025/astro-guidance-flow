import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Shield, Users, UserCheck, UserX, Plus, Pencil, Trash2, 
  Search, Filter, Star, Clock, Phone, MessageCircle, Eye, Check, X,
  Sparkles, BadgeCheck, IndianRupee, Languages, ToggleLeft, ToggleRight,
  Upload, Camera, Bot, Brain, AlertCircle, Mail, CheckCircle, XCircle,
  CheckSquare, Square, MinusSquare
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
}

const specialties = [
  "Vedic Astrology",
  "Nadi Astrology",
  "KP Astrology",
  "Lal Kitab",
  "Palmistry",
  "Numerology",
  "Tarot Reading",
  "Vastu Shastra",
  "Marriage Counseling",
  "Relationship Expert",
  "Kundli Matching",
  "Dasha Analysis",
  "Remedial Astrology"
];

const categories = [
  { value: "astrologer", label: "Astrologer" },
  { value: "jotshi", label: "Jotshi" },
  { value: "palmist", label: "Palmist" },
  { value: "relationship", label: "Relationship Expert" }
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<JotshiProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
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

      if (error) {
        console.error("Error fetching providers:", error);
        toast.error("Failed to load providers");
      } else {
        setProviders((data as JotshiProfile[]) || []);
      }
    };

    fetchProviders();
  }, [isAdmin]);

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

  const handleApproveProvider = async (provider: JotshiProfile) => {
    setApprovingId(provider.id);
    
    try {
      // Update approval status
      const { error: updateError } = await supabase
        .from('jotshi_profiles')
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          verified: true
        })
        .eq('id', provider.id);

      if (updateError) throw updateError;

      // Send approval notification email
      const { error: emailError } = await supabase.functions.invoke('send-provider-approval', {
        body: { 
          providerId: provider.id,
          providerName: provider.display_name,
          action: 'approved'
        }
      });

      if (emailError) {
        console.warn("Email notification failed:", emailError);
        // Don't fail the approval if email fails
      }

      setProviders(prev => prev.map(p => 
        p.id === provider.id 
          ? { ...p, approval_status: 'approved', approved_at: new Date().toISOString(), verified: true } 
          : p
      ));
      toast.success(`${provider.display_name || 'Provider'} has been approved! Email notification sent.`);
    } catch (error) {
      console.error("Error approving provider:", error);
      toast.error("Failed to approve provider");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectProvider = async (provider: JotshiProfile) => {
    if (!confirm(`Are you sure you want to reject ${provider.display_name || 'this provider'}?`)) return;
    
    setApprovingId(provider.id);
    
    try {
      const { error: updateError } = await supabase
        .from('jotshi_profiles')
        .update({ approval_status: 'rejected' })
        .eq('id', provider.id);

      if (updateError) throw updateError;

      // Send rejection notification email
      await supabase.functions.invoke('send-provider-approval', {
        body: { 
          providerId: provider.id,
          providerName: provider.display_name,
          action: 'rejected'
        }
      });

      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, approval_status: 'rejected' } : p
      ));
      toast.success(`${provider.display_name || 'Provider'} has been rejected.`);
    } catch (error) {
      console.error("Error rejecting provider:", error);
      toast.error("Failed to reject provider");
    } finally {
      setApprovingId(null);
    }
  };

  const handleToggleOnline = async (provider: JotshiProfile) => {
    const { error } = await supabase
      .from('jotshi_profiles')
      .update({ is_online: !provider.is_online })
      .eq('id', provider.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, is_online: !p.is_online } : p
      ));
      toast.success(`Provider is now ${!provider.is_online ? 'online' : 'offline'}`);
    }
  };

  const handleToggleVerified = async (provider: JotshiProfile) => {
    const { error } = await supabase
      .from('jotshi_profiles')
      .update({ verified: !provider.verified })
      .eq('id', provider.id);

    if (error) {
      toast.error("Failed to update verification");
    } else {
      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, verified: !p.verified } : p
      ));
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
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('provider-avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-avatars')
        .getPublicUrl(fileName);
      
      // Update provider profile
      const { error: updateError } = await supabase
        .from('jotshi_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', selectedProvider.id);
      
      if (updateError) throw updateError;
      
      setSelectedProvider({ ...selectedProvider, avatar_url: publicUrl });
      setProviders(prev => prev.map(p => 
        p.id === selectedProvider.id ? { ...p, avatar_url: publicUrl } : p
      ));
      toast.success("Profile image updated!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!selectedProvider) return;

    const { error } = await supabase
      .from('jotshi_profiles')
      .update({
        specialty: selectedProvider.specialty,
        experience_years: selectedProvider.experience_years,
        hourly_rate: selectedProvider.hourly_rate,
        bio: selectedProvider.bio,
        is_online: selectedProvider.is_online,
        verified: selectedProvider.verified,
        display_name: selectedProvider.display_name,
        ai_personality: selectedProvider.ai_personality,
        avatar_url: selectedProvider.avatar_url,
        category: selectedProvider.category,
        voice_id: selectedProvider.voice_id
      })
      .eq('id', selectedProvider.id);

    if (error) {
      toast.error("Failed to update provider");
    } else {
      setProviders(prev => prev.map(p => 
        p.id === selectedProvider.id ? selectedProvider : p
      ));
      setShowEditDialog(false);
      toast.success("Provider updated successfully");
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    const { error } = await supabase
      .from('jotshi_profiles')
      .delete()
      .eq('id', providerId);

    if (error) {
      toast.error("Failed to delete provider");
    } else {
      setProviders(prev => prev.filter(p => p.id !== providerId));
      toast.success("Provider deleted successfully");
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredProviders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProviders.map(p => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkToggleOnline = async (setOnline: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('jotshi_profiles')
        .update({ is_online: setOnline })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      setProviders(prev => prev.map(p => 
        selectedIds.has(p.id) ? { ...p, is_online: setOnline } : p
      ));
      toast.success(`${selectedIds.size} provider(s) set to ${setOnline ? 'online' : 'offline'}`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Failed to update providers");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggleVerified = async (setVerified: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('jotshi_profiles')
        .update({ verified: setVerified })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      setProviders(prev => prev.map(p => 
        selectedIds.has(p.id) ? { ...p, verified: setVerified } : p
      ));
      toast.success(`${selectedIds.size} provider(s) ${setVerified ? 'verified' : 'unverified'}`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Failed to update providers");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} provider(s)? This action cannot be undone.`)) return;
    
    setBulkActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('jotshi_profiles')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      setProviders(prev => prev.filter(p => !selectedIds.has(p.id)));
      toast.success(`${selectedIds.size} provider(s) deleted`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete providers");
    } finally {
      setBulkActionLoading(false);
    }
  };

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
        <h2 className="text-xl font-semibold text-foreground">Authentication Required</h2>
        <p className="text-muted-foreground text-center">Please sign in to access the admin panel.</p>
        <SpiritualButton variant="primary" onClick={() => navigate('/auth')}>
          Sign In
        </SpiritualButton>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Shield className="w-16 h-16 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-center">You don't have permission to access this page.</p>
        <SpiritualButton variant="outline" onClick={() => navigate('/')}>
          Go Back Home
        </SpiritualButton>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage service providers</p>
            </div>
          </div>
          {pendingProviders.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {pendingProviders.length} Pending
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 space-y-5">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{approvedProviders.length}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated" className={pendingProviders.length > 0 ? 'ring-2 ring-amber-500' : ''}>
            <SpiritualCardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-foreground">{pendingProviders.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <UserCheck className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{providers.filter(p => p.is_online).length}</p>
              <p className="text-xs text-muted-foreground">Online Now</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <BadgeCheck className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold text-foreground">{providers.filter(p => p.verified).length}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </SpiritualCardContent>
          </SpiritualCard>
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-4 text-center">
              <IndianRupee className="w-6 h-6 mx-auto mb-2 text-gold" />
              <p className="text-2xl font-bold text-foreground">
                ₹{providers.reduce((sum, p) => sum + (p.total_earnings || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </SpiritualCardContent>
          </SpiritualCard>
        </div>

        {/* Pending Approvals Alert */}
        {pendingProviders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SpiritualCard variant="elevated" className="border-2 border-amber-500/50 bg-amber-500/5">
              <SpiritualCardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <div>
                    <h3 className="font-semibold text-foreground">Pending Provider Approvals</h3>
                    <p className="text-sm text-muted-foreground">
                      {pendingProviders.length} provider(s) awaiting your approval
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {pendingProviders.map((provider) => (
                    <div 
                      key={provider.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-spiritual flex items-center justify-center">
                          {provider.avatar_url ? (
                            <img 
                              src={provider.avatar_url} 
                              alt={provider.display_name || 'Provider'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Sparkles className="w-5 h-5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {provider.display_name || 'New Provider'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {provider.specialty || 'No specialty'} • {provider.category || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <SpiritualButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowEditDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </SpiritualButton>
                        <SpiritualButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectProvider(provider)}
                          disabled={approvingId === provider.id}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="w-4 h-4" />
                        </SpiritualButton>
                        <SpiritualButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveProvider(provider)}
                          disabled={approvingId === provider.id}
                        >
                          {approvingId === provider.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Approved Providers ({approvedProviders.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4 mt-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <SpiritualInput
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <SpiritualButton variant="primary" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </SpiritualButton>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30"
              >
                <div className="flex items-center gap-2 mr-4">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {selectedIds.size} selected
                  </span>
                </div>
                <SpiritualButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleOnline(true)}
                  disabled={bulkActionLoading}
                >
                  <ToggleRight className="w-4 h-4 mr-1 text-green-500" />
                  Set Online
                </SpiritualButton>
                <SpiritualButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleOnline(false)}
                  disabled={bulkActionLoading}
                >
                  <ToggleLeft className="w-4 h-4 mr-1" />
                  Set Offline
                </SpiritualButton>
                <SpiritualButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleVerified(true)}
                  disabled={bulkActionLoading}
                >
                  <BadgeCheck className="w-4 h-4 mr-1 text-secondary" />
                  Verify
                </SpiritualButton>
                <SpiritualButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleVerified(false)}
                  disabled={bulkActionLoading}
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Unverify
                </SpiritualButton>
                <SpiritualButton
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </SpiritualButton>
                <SpiritualButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  disabled={bulkActionLoading}
                >
                  <X className="w-4 h-4" />
                  Clear
                </SpiritualButton>
              </motion.div>
            )}

            {/* Select All Header */}
            {filteredProviders.length > 0 && (
              <div className="flex items-center gap-3 px-2">
                <Checkbox
                  checked={selectedIds.size === filteredProviders.length && filteredProviders.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size === filteredProviders.length ? 'Deselect all' : 'Select all'}
                </span>
              </div>
            )}

            {/* Providers List */}
            <div className="space-y-3">
              {filteredProviders.length === 0 ? (
                <SpiritualCard variant="elevated">
                  <SpiritualCardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No approved providers found</p>
                  </SpiritualCardContent>
                </SpiritualCard>
              ) : (
                filteredProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <SpiritualCard 
                      variant="elevated" 
                      className={`border ${selectedIds.has(provider.id) ? 'border-primary/50 bg-primary/5' : 'border-border/30'}`}
                    >
                      <SpiritualCardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Checkbox & Avatar & Status */}
                          <div className="flex items-start gap-4 flex-1">
                            <Checkbox
                              checked={selectedIds.has(provider.id)}
                              onCheckedChange={() => handleSelectOne(provider.id)}
                              className="mt-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div className="relative">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-spiritual flex items-center justify-center">
                                {provider.avatar_url ? (
                                  <img 
                                    src={provider.avatar_url} 
                                    alt={provider.display_name || 'Provider'} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                                )}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                                provider.is_online ? 'bg-green-500' : 'bg-muted-foreground/40'
                              }`} />
                              {provider.ai_personality && (
                                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Bot className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold text-foreground truncate">
                                  {provider.display_name || `Provider #${provider.id.slice(0, 8)}`}
                                </h4>
                                {provider.verified && (
                                  <BadgeCheck className="w-4 h-4 text-secondary flex-shrink-0" />
                                )}
                                {provider.category && (
                                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-md capitalize">
                                    {provider.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-secondary font-medium">{provider.specialty || 'No specialty'}</p>
                              
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {provider.experience_years || 0} years
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-gold fill-gold" />
                                  {provider.rating || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {provider.total_sessions || 0} sessions
                                </span>
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {provider.hourly_rate || 0}/min
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <SpiritualButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleOnline(provider)}
                              className={provider.is_online ? 'text-green-500' : 'text-muted-foreground'}
                            >
                              {provider.is_online ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </SpiritualButton>
                            <SpiritualButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVerified(provider)}
                              className={provider.verified ? 'text-secondary' : 'text-muted-foreground'}
                            >
                              <BadgeCheck className="w-5 h-5" />
                            </SpiritualButton>
                            <SpiritualButton
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProvider(provider);
                                setShowEditDialog(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </SpiritualButton>
                            <SpiritualButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="text-destructive hover:text-destructive"
                            >
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

          <TabsContent value="analytics" className="mt-4">
            <SpiritualCard variant="elevated">
              <SpiritualCardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed provider performance metrics, earnings reports, and consultation analytics will be available here.
                </p>
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
              {selectedProvider?.approval_status === 'pending' && (
                <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Profile Image
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border">
                    {selectedProvider.avatar_url ? (
                      <img 
                        src={selectedProvider.avatar_url} 
                        alt="Provider" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <SpiritualButton
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </SpiritualButton>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label>Display Name</Label>
                <SpiritualInput
                  value={selectedProvider.display_name || ""}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, display_name: e.target.value })}
                  placeholder="Provider's display name"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={selectedProvider.category || ""} 
                  onValueChange={(v) => setSelectedProvider({ ...selectedProvider, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select 
                  value={selectedProvider.specialty || ""} 
                  onValueChange={(v) => setSelectedProvider({ ...selectedProvider, specialty: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
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
                    value={selectedProvider.experience_years || 0}
                    onChange={(e) => setSelectedProvider({ 
                      ...selectedProvider, 
                      experience_years: parseInt(e.target.value) || 0 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate (₹/min)</Label>
                  <SpiritualInput
                    type="number"
                    value={selectedProvider.hourly_rate || 0}
                    onChange={(e) => setSelectedProvider({ 
                      ...selectedProvider, 
                      hourly_rate: parseInt(e.target.value) || 0 
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={selectedProvider.bio || ""}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, bio: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the provider..."
                />
              </div>

              {/* AI Personality Section */}
              <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Label className="flex items-center gap-2 text-primary">
                  <Brain className="w-4 h-4" />
                  AI Personality Traits (Admin Only)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Define how the AI should respond when acting as this provider. This is only visible to admins.
                </p>
                <Textarea
                  value={selectedProvider.ai_personality || ""}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, ai_personality: e.target.value })}
                  rows={4}
                  placeholder="Example: Speak in a calm, wise manner. Use traditional Vedic terminology. Be empathetic and supportive. Always suggest remedies with explanations. End responses with a blessing."
                  className="bg-background"
                />
              </div>

              {/* ElevenLabs Voice ID Section */}
              <div className="space-y-2 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                <Label className="flex items-center gap-2 text-secondary">
                  <Phone className="w-4 h-4" />
                  ElevenLabs Voice ID (Admin Only)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Enter the ElevenLabs voice ID for voice consultations. Find voices at{" "}
                  <a 
                    href="https://elevenlabs.io/app/voice-library" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    ElevenLabs Voice Library
                  </a>
                </p>
                <SpiritualInput
                  value={selectedProvider.voice_id || ""}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, voice_id: e.target.value })}
                  placeholder="e.g., S3F8rLt9v7twQC170pA5"
                  className="bg-background font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedProvider.is_online || false}
                    onCheckedChange={(checked) => setSelectedProvider({ ...selectedProvider, is_online: checked })}
                  />
                  <Label>Online</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedProvider.verified || false}
                    onCheckedChange={(checked) => setSelectedProvider({ ...selectedProvider, verified: checked })}
                  />
                  <Label>Verified</Label>
                </div>
              </div>

              {/* Approve/Reject for pending */}
              {selectedProvider.approval_status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <SpiritualButton
                    variant="outline"
                    className="flex-1 text-destructive"
                    onClick={() => {
                      handleRejectProvider(selectedProvider);
                      setShowEditDialog(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </SpiritualButton>
                  <SpiritualButton
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      handleApproveProvider(selectedProvider);
                      setShowEditDialog(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Notify
                  </SpiritualButton>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <SpiritualButton variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </SpiritualButton>
            <SpiritualButton variant="primary" onClick={handleUpdateProvider}>
              Save Changes
            </SpiritualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Provider Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Provider</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Providers can register through the provider registration page. Once they submit their application, 
              it will appear in the "Pending Approvals" section above.
            </p>
            
            <SpiritualCard variant="elevated" className="bg-muted/30">
              <SpiritualCardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2">Provider Registration Flow:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Provider creates account at <code className="text-primary">/auth</code></li>
                  <li>Provider registers at <code className="text-primary">/provider-register</code></li>
                  <li>Application appears here for approval</li>
                  <li>Admin approves → provider gets email notification</li>
                </ol>
              </SpiritualCardContent>
            </SpiritualCard>
          </div>

          <DialogFooter>
            <SpiritualButton variant="outline" onClick={() => setShowAddDialog(false)}>
              Close
            </SpiritualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminPanel;
