import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Star, Clock, Phone, Sparkles, Users, Hand, Heart, CheckCircle, Shield, Headphones, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpertConsultationDialog } from "@/components/consultation/ExpertConsultationDialog";

type Category = 'all' | 'astrologer' | 'jotshi' | 'palmist' | 'relationship';

interface Expert {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  rate: number;
  status: 'online' | 'busy' | 'offline';
  avatar: string;
  category: Category;
  languages: string[];
  sessions: number;
  ai_personality?: string;
  voice_id?: string;
}

const categoryConfig: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Experts', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'astrologer', label: 'Astrologer', icon: <Star className="w-4 h-4" /> },
  { id: 'jotshi', label: 'Jotshi', icon: <Users className="w-4 h-4" /> },
  { id: 'palmist', label: 'Palmist', icon: <Hand className="w-4 h-4" /> },
  { id: 'relationship', label: 'Relationship', icon: <Heart className="w-4 h-4" /> },
];

const defaultAvatar = '/placeholder.svg';

const TalkToJotshi = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [consultationTab, setConsultationTab] = useState<'chat' | 'call'>('chat');

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jotshi_profiles')
          .select('*')
          .eq('approval_status', 'approved')
          .order('rating', { ascending: false });

        if (error) throw error;

        const mappedExperts: Expert[] = (data || []).map((p) => ({
          id: p.id,
          name: p.display_name || 'Expert',
          specialty: p.specialty || 'General Consultation',
          experience: p.experience_years ? `${p.experience_years}+ years` : 'Experienced',
          rating: Number(p.rating) || 0,
          rate: p.hourly_rate || 20,
          status: p.is_online ? 'online' : 'offline' as 'online' | 'busy' | 'offline',
          avatar: p.avatar_url || defaultAvatar,
          category: (p.category as Category) || 'astrologer',
          languages: p.languages || ['Hindi', 'English'],
          sessions: p.total_sessions || 0,
          ai_personality: p.ai_personality || undefined,
          voice_id: p.voice_id || undefined,
        }));

        setExperts(mappedExperts);

        // Calculate category counts
        const counts: Record<string, number> = {};
        mappedExperts.forEach((e) => {
          counts[e.category] = (counts[e.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching experts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const filteredExperts = experts.filter(e => {
    const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const onlineCount = filteredExperts.filter(e => e.status === 'online').length;

  const openConsultation = (expert: Expert, tab: 'chat' | 'call') => {
    setSelectedExpert(expert);
    setConsultationTab(tab);
    setConsultationOpen(true);
  };

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
            <div className="w-11 h-11 rounded-2xl bg-gradient-spiritual flex items-center justify-center shadow-spiritual">
              <Headphones className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Consult Expert</h1>
              <p className="text-xs text-primary font-medium">
                {loading ? 'Loading...' : `${onlineCount} experts available now`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <SpiritualInput
            placeholder="Search experts by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-secondary" />
            <span>100% Confidential</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5 text-secondary" />
            <span>Verified Experts</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Headphones className="w-3.5 h-3.5 text-secondary" />
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Category Filter */}
        <section className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {categoryConfig.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-medium border ${
                  activeCategory === cat.id
                    ? 'bg-gradient-spiritual text-primary-foreground border-transparent shadow-spiritual'
                    : 'bg-card text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    activeCategory === cat.id ? 'bg-white/20' : 'bg-muted'
                  }`}>
                    {categoryCounts[cat.id] || 0}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Expert List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              {activeCategory === 'all' ? 'All Experts' : categoryConfig.find(c => c.id === activeCategory)?.label + 's'}
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              {loading ? '...' : `${filteredExperts.length} available`}
            </span>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SpiritualCard key={i} variant="elevated" className="overflow-hidden border border-border/30">
                  <SpiritualCardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="w-[72px] h-[72px] rounded-2xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </SpiritualCardContent>
                </SpiritualCard>
              ))}
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No experts found in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExperts.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                >
                  <SpiritualCard variant="elevated" interactive className="overflow-hidden border border-border/30">
                    <SpiritualCardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden ring-2 ring-border/50 bg-muted">
                            <img 
                              src={expert.avatar} 
                              alt={expert.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultAvatar;
                              }}
                            />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-card flex items-center justify-center ${
                            expert.status === 'online' ? 'bg-green-500' : 
                            expert.status === 'busy' ? 'bg-amber-500' : 'bg-muted-foreground/40'
                          }`}>
                            {expert.status === 'online' && (
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-foreground truncate text-[15px]">{expert.name}</h4>
                              <p className="text-sm text-secondary font-medium truncate">{expert.specialty}</p>
                            </div>
                          </div>
                          
                          {/* Stats Row */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {expert.experience}
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                              <Star className="w-3 h-3 text-gold fill-gold" /> 
                              <span className="text-foreground font-medium">{expert.rating}</span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {expert.sessions.toLocaleString()} sessions
                            </span>
                          </div>
                          
                          {/* Languages */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {expert.languages.map((lang) => (
                              <span key={lang} className="text-[10px] px-2 py-0.5 bg-muted/60 text-muted-foreground rounded-md">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-primary">₹{expert.rate}</span>
                          <span className="text-xs text-muted-foreground">/min</span>
                        </div>
                        <div className="flex gap-2">
                          <SpiritualButton 
                            variant="outline" 
                            size="sm"
                            className="gap-1.5 text-xs h-9 px-3"
                            disabled={expert.status !== 'online'}
                            onClick={() => openConsultation(expert, 'call')}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </SpiritualButton>
                          <SpiritualButton 
                            variant="primary" 
                            size="sm"
                            className="gap-1.5 text-xs h-9 px-3"
                            onClick={() => openConsultation(expert, 'chat')}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat
                          </SpiritualButton>
                        </div>
                      </div>
                    </SpiritualCardContent>
                  </SpiritualCard>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Spacing */}
        <div className="h-6" />
      </main>

      {/* Consultation Dialog */}
      <ExpertConsultationDialog
        expert={selectedExpert}
        open={consultationOpen}
        onOpenChange={setConsultationOpen}
        initialTab={consultationTab}
      />
    </motion.div>
  );
};

export default TalkToJotshi;
