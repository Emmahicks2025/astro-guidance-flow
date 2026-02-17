import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, ArrowLeft, Upload, Camera, Info, Heart, Brain, Sparkles, Star, Shield, Gem, Phone, MessageCircle, ChevronRight, Loader2, Activity, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent, SpiritualCardHeader, SpiritualCardTitle } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ExpertConsultationDialog } from "@/components/consultation/ExpertConsultationDialog";

const tips = [
  "Use natural lighting, avoid shadows",
  "Keep your palm flat and fingers spread",
  "Capture the entire palm including wrist",
  "Focus on the dominant hand (usually right)",
];

interface PalmAnalysis {
  overall_summary: string;
  life_line: { rating: string; description: string; predictions: string[] };
  heart_line: { rating: string; description: string; predictions: string[] };
  head_line: { rating: string; description: string; predictions: string[] };
  fate_line: { rating: string; description: string; predictions: string[] };
  marriage_lines: { count: number; description: string; predictions: string[] };
  mounts: Array<{ name: string; status: string; meaning: string }>;
  special_markings: Array<{ type: string; location: string; meaning: string }>;
  personality_traits: string[];
  career_guidance: string;
  health_indicators: string;
  relationship_outlook: string;
  lucky_elements: { color: string; number: string; day: string; gemstone: string };
  remedies: Array<{ issue: string; remedy: string; type: string }>;
  confidence_score: number;
}

interface Expert {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  rate: number;
  status: 'online' | 'busy' | 'offline';
  avatar: string;
  category: string;
  languages: string[];
  sessions: number;
  ai_personality?: string;
  voice_id?: string;
  user_id?: string;
}

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "Strong": return "bg-green-500/20 text-green-700";
    case "Moderate": return "bg-accent/20 text-accent";
    case "Weak": return "bg-destructive/20 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

const analyzingMessages = [
  "🔮 Scanning your palm lines...",
  "✋ Detecting Life Line, Heart Line, Head Line...",
  "🌟 Analyzing mounts and special markings...",
  "🧠 Reading your personality through palm patterns...",
  "💫 Calculating your destiny indicators...",
  "📿 Preparing your personalized remedies...",
  "⭐ Almost done — finalizing your reading...",
];

const PalmReading = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyzingMsgIndex, setAnalyzingMsgIndex] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);
  const [palmExperts, setPalmExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [consultationTab, setConsultationTab] = useState<'chat' | 'call'>('chat');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image too large. Please use an image under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setAnalysis(null);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchPalmExperts = async () => {
    setLoadingExperts(true);
    try {
      const { data, error } = await supabase
        .from('jotshi_profiles')
        .select('*')
        .eq('approval_status', 'approved')
        .in('category', ['palmist', 'astrologer', 'jotshi'])
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;

      const mapped: Expert[] = (data || []).map((p) => ({
        id: p.id,
        name: p.display_name || 'Expert',
        specialty: p.specialty || 'Palm Reading',
        experience: p.experience_years ? `${p.experience_years}+ yrs` : 'Experienced',
        rating: Number(p.rating) || 0,
        rate: p.hourly_rate || 20,
        status: p.is_online ? 'online' : 'offline' as 'online' | 'busy' | 'offline',
        avatar: p.avatar_url || '/placeholder.svg',
        category: p.category || 'palmist',
        languages: p.languages || ['Hindi', 'English'],
        sessions: p.total_sessions || 0,
        ai_personality: p.ai_personality || undefined,
        voice_id: p.voice_id || undefined,
        user_id: p.user_id || undefined,
      }));
      setPalmExperts(mapped);
    } catch (err) {
      console.error("Error fetching experts:", err);
    } finally {
      setLoadingExperts(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error("Please upload a palm image first");
      return;
    }
    setIsAnalyzing(true);
    setAnalyzingMsgIndex(0);
    const msgInterval = setInterval(() => {
      setAnalyzingMsgIndex(prev => (prev + 1) % analyzingMessages.length);
    }, 3000);
    try {
      // Extract base64 from data URL
      const base64 = uploadedImage.split(',')[1];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-palm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64 }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      if (data.success && data.analysis && !data.analysis.error) {
        setAnalysis(data.analysis);
        toast.success("Palm analysis complete!");

        // Save to profile
        if (user) {
          const summaryText = `Overall: ${data.analysis.overall_summary}\nLife Line: ${data.analysis.life_line?.description}\nHeart Line: ${data.analysis.heart_line?.description}\nHead Line: ${data.analysis.head_line?.description}\nCareer: ${data.analysis.career_guidance}\nRelationships: ${data.analysis.relationship_outlook}`;
          await supabase.from('profiles').update({ palm_analysis_text: summaryText }).eq('user_id', user.id);
        }

        // Fetch experts after analysis
        fetchPalmExperts();
      } else {
        throw new Error(data.analysis?.error || "Could not analyze palm");
      }
    } catch (err: any) {
      console.error("Palm analysis error:", err);
      toast.error(err.message || "Failed to analyze palm. Please try again.");
    } finally {
      clearInterval(msgInterval);
      setIsAnalyzing(false);
    }
  };

  const openExpertConsultation = (expert: Expert, tab: 'chat' | 'call') => {
    setSelectedExpert(expert);
    setConsultationTab(tab);
    setConsultationOpen(true);
  };

  const lineCards = analysis ? [
    { key: "life", icon: Activity, label: "Life Line", data: analysis.life_line, color: "from-green-500/20 to-green-500/5" },
    { key: "heart", icon: Heart, label: "Heart Line", data: analysis.heart_line, color: "from-pink-500/20 to-pink-500/5" },
    { key: "head", icon: Brain, label: "Head Line", data: analysis.head_line, color: "from-blue-500/20 to-blue-500/5" },
    { key: "fate", icon: Star, label: "Fate Line", data: analysis.fate_line, color: "from-purple-500/20 to-purple-500/5" },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <Hand className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Palm Reading</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Tips */}
              <SpiritualCard variant="golden" className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Photo Tips for Best Results</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                    </ul>
                  </div>
                </div>
              </SpiritualCard>

              {/* Upload Area */}
              <SpiritualCard variant="elevated" className="overflow-hidden">
                <SpiritualCardContent className="p-6">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img src={uploadedImage} alt="Uploaded palm" className="w-full h-64 object-cover rounded-xl" />
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          <SpiritualButton variant="outline" size="lg" className="w-full" asChild>
                            <span><Upload className="w-5 h-5" /> Change Image</span>
                          </SpiritualButton>
                        </label>
                        <SpiritualButton variant="primary" size="lg" className="flex-1" onClick={handleAnalyze} disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                          ) : "Get Reading"}
                        </SpiritualButton>
                      </div>
                      {isAnalyzing && (
                        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={analyzingMsgIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm font-medium text-primary"
                            >
                              {analyzingMessages[analyzingMsgIndex]}
                            </motion.p>
                          </AnimatePresence>
                          <p className="text-xs text-muted-foreground mt-2">This may take 15-30 seconds. Please wait...</p>
                          <div className="mt-3 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              initial={{ width: "5%" }}
                              animate={{ width: "95%" }}
                              transition={{ duration: 30, ease: "linear" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Hand className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">Upload Your Palm Photo</h3>
                      <p className="text-sm text-muted-foreground mb-6">AI will analyze your palm lines, mounts, and markings</p>
                      <div className="flex gap-3 justify-center">
                        <label>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          <SpiritualButton variant="primary" size="lg" asChild>
                            <span><Upload className="w-5 h-5" /> Upload Photo</span>
                          </SpiritualButton>
                        </label>
                        <label>
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                          <SpiritualButton variant="outline" size="lg" asChild>
                            <span><Camera className="w-5 h-5" /> Take Photo</span>
                          </SpiritualButton>
                        </label>
                      </div>
                    </div>
                  )}
                </SpiritualCardContent>
              </SpiritualCard>

              {/* What You'll Get */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold font-display">What You'll Discover</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Life Line', 'Heart Line', 'Head Line', 'Fate Line', 'Mounts Analysis', 'Lucky Elements'].map((line) => (
                    <SpiritualCard key={line} variant="default" className="p-4 text-center">
                      <p className="font-medium">{line}</p>
                    </SpiritualCard>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Overall Summary */}
              <SpiritualCard variant="golden" className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Your Palm Reading</h3>
                    <p className="text-sm text-muted-foreground mt-1">{analysis.overall_summary}</p>
                    {analysis.confidence_score && (
                      <Badge variant="outline" className="mt-2 text-xs">Confidence: {analysis.confidence_score}%</Badge>
                    )}
                  </div>
                </div>
              </SpiritualCard>

              {/* Uploaded Image Thumbnail */}
              {uploadedImage && (
                <div className="flex items-center gap-3">
                  <img src={uploadedImage} alt="Your palm" className="w-16 h-16 object-cover rounded-xl border border-border" />
                  <SpiritualButton variant="ghost" size="sm" onClick={() => { setAnalysis(null); }}>
                    Scan Another Palm
                  </SpiritualButton>
                </div>
              )}

              {/* Line Analysis Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Hand className="w-5 h-5 text-accent" /> Line Analysis
                </h3>
                {lineCards.map((card, index) => (
                  <motion.div key={card.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <SpiritualCard variant="elevated" className={`p-4 bg-gradient-to-br ${card.color}`}>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0">
                          <card.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{card.label}</h4>
                            <Badge className={getRatingColor(card.data.rating)}>{card.data.rating}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{card.data.description}</p>
                          {card.data.predictions?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {card.data.predictions.map((p: string, i: number) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <ChevronRight className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" /> {p}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </SpiritualCard>
                  </motion.div>
                ))}
              </div>

              {/* Marriage Lines */}
              {analysis.marriage_lines && (
                <SpiritualCard variant="mystic" className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h4 className="font-bold">Marriage & Relationship Lines</h4>
                    <Badge variant="outline">{analysis.marriage_lines.count} line(s)</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.marriage_lines.description}</p>
                </SpiritualCard>
              )}

              {/* Mid-section Expert CTA */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                <SpiritualCard variant="spiritual" className="p-4 border-2 border-primary/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">🚨 Your palm reveals important patterns</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        An expert palmist can decode hidden signs AI can't fully interpret — timing of events, specific remedies, and future strategy. <span className="font-semibold text-primary">Don't delay, consult now.</span>
                      </p>
                      <SpiritualButton variant="primary" size="sm" className="mt-2" onClick={() => navigate('/talk')}>
                        <Phone className="w-3.5 h-3.5" /> Talk to Expert Now
                      </SpiritualButton>
                    </div>
                  </div>
                </SpiritualCard>
              </motion.div>

              {/* Personality Traits */}
              {analysis.personality_traits?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold font-display mb-3">Personality Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.personality_traits.map((trait, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1">{trait}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Career, Health, Relationships */}
              <div className="grid gap-4">
                {analysis.career_guidance && (
                  <SpiritualCard variant="default" className="p-4">
                    <h4 className="font-bold flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-accent" /> Career Guidance</h4>
                    <p className="text-sm text-muted-foreground">{analysis.career_guidance}</p>
                  </SpiritualCard>
                )}
                {analysis.health_indicators && (
                  <SpiritualCard variant="default" className="p-4">
                    <h4 className="font-bold flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-green-500" /> Health Indicators</h4>
                    <p className="text-sm text-muted-foreground">{analysis.health_indicators}</p>
                  </SpiritualCard>
                )}
                {analysis.relationship_outlook && (
                  <SpiritualCard variant="default" className="p-4">
                    <h4 className="font-bold flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-pink-500" /> Relationship Outlook</h4>
                    <p className="text-sm text-muted-foreground">{analysis.relationship_outlook}</p>
                  </SpiritualCard>
                )}
              </div>

              {/* Lucky Elements */}
              {analysis.lucky_elements && (
                <SpiritualCard variant="golden" className="p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Lucky Elements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-muted-foreground">Color</p><p className="font-medium">{analysis.lucky_elements.color}</p></div>
                    <div><p className="text-xs text-muted-foreground">Number</p><p className="font-medium">{analysis.lucky_elements.number}</p></div>
                    <div><p className="text-xs text-muted-foreground">Day</p><p className="font-medium">{analysis.lucky_elements.day}</p></div>
                    <div><p className="text-xs text-muted-foreground">Gemstone</p><p className="font-medium">{analysis.lucky_elements.gemstone}</p></div>
                  </div>
                </SpiritualCard>
              )}

              {/* Mounts */}
              {analysis.mounts?.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="mounts" className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:no-underline">
                      <span className="font-display font-bold">Mount Analysis</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                      <div className="space-y-3">
                        {analysis.mounts.map((mount, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Badge className={mount.status === "Prominent" ? "bg-green-500/20 text-green-700" : mount.status === "Flat" ? "bg-muted text-muted-foreground" : "bg-accent/20 text-accent"}>
                              {mount.status}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{mount.name}</p>
                              <p className="text-xs text-muted-foreground">{mount.meaning}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Remedies */}
              {analysis.remedies?.length > 0 && (
                <SpiritualCard variant="spiritual" className="overflow-hidden">
                  <SpiritualCardHeader className="border-b border-primary/20">
                    <SpiritualCardTitle className="flex items-center gap-2">
                      <Gem className="w-5 h-5 text-primary" /> Remedies & Guidance
                    </SpiritualCardTitle>
                  </SpiritualCardHeader>
                  <SpiritualCardContent className="p-4 space-y-3">
                    {analysis.remedies.map((remedy, i) => (
                      <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{remedy.type}</Badge>
                        </div>
                        <p className="font-medium text-sm">{remedy.remedy}</p>
                        <p className="text-xs text-muted-foreground mt-1">For: {remedy.issue}</p>
                      </div>
                    ))}
                  </SpiritualCardContent>
                </SpiritualCard>
              )}

              {/* Expert Recommendations */}
              <SpiritualCard variant="mystic" className="p-5 border-2 border-accent/40">
                <div className="text-center space-y-3 mb-4">
                  <Badge className="bg-destructive/90 text-destructive-foreground animate-pulse">⚡ Limited Slots Available</Badge>
                  <h3 className="font-display font-bold text-lg">Your Reading Needs Expert Attention</h3>
                  <p className="text-sm text-muted-foreground">
                    AI analysis gives you the overview — but only a <span className="font-semibold text-foreground">certified palmist</span> can reveal timing of events, hidden challenges, and your <span className="font-semibold text-foreground">personalized future strategy</span>. Act now before slots fill up.
                  </p>
                </div>

                {loadingExperts ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : palmExperts.length > 0 ? (
                  <div className="space-y-3">
                    {palmExperts.map((expert) => (
                      <SpiritualCard key={expert.id} variant="elevated" className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={expert.avatar} alt={expert.name} className="w-12 h-12 rounded-full object-cover" />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${expert.status === 'online' ? 'bg-green-500' : 'bg-muted'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{expert.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{expert.specialty}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs flex items-center gap-0.5"><Star className="w-3 h-3 text-accent fill-accent" /> {expert.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">₹{expert.rate}/min</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <SpiritualButton variant="outline" size="sm" className="h-8 px-2" onClick={() => openExpertConsultation(expert, 'chat')}>
                              <MessageCircle className="w-3.5 h-3.5" />
                            </SpiritualButton>
                            <SpiritualButton variant="primary" size="sm" className="h-8 px-2" onClick={() => openExpertConsultation(expert, 'call')}>
                              <Phone className="w-3.5 h-3.5" />
                            </SpiritualButton>
                          </div>
                        </div>
                      </SpiritualCard>
                    ))}
                    <SpiritualButton variant="ghost" className="w-full" onClick={() => navigate('/talk')}>
                      View All Experts <ChevronRight className="w-4 h-4 ml-1" />
                    </SpiritualButton>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <SpiritualButton variant="outline" onClick={() => navigate("/talk")}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Chat with Expert
                    </SpiritualButton>
                    <SpiritualButton variant="primary" onClick={() => navigate("/talk")}>
                      <Phone className="w-4 h-4 mr-2" /> Call an Expert
                    </SpiritualButton>
                  </div>
                )}
              </SpiritualCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ExpertConsultationDialog
        expert={selectedExpert}
        open={consultationOpen}
        onOpenChange={setConsultationOpen}
        initialTab={consultationTab}
      />
    </motion.div>
  );
};

export default PalmReading;
