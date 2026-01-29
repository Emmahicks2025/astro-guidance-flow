import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Star, Clock, Phone, Sparkles, Users, Hand, Heart, CheckCircle, Shield, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useState } from "react";

// Import expert images
import expert1 from "@/assets/experts/expert-1.jpg";
import expert2 from "@/assets/experts/expert-2.jpg";
import expert3 from "@/assets/experts/expert-3.jpg";
import expert4 from "@/assets/experts/expert-4.jpg";
import expert5 from "@/assets/experts/expert-5.jpg";
import expert6 from "@/assets/experts/expert-6.jpg";
import expert7 from "@/assets/experts/expert-7.jpg";
import expert8 from "@/assets/experts/expert-8.jpg";
import expert9 from "@/assets/experts/expert-9.jpg";
import expert10 from "@/assets/experts/expert-10.jpg";

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
}

const categoryConfig: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Experts', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'astrologer', label: 'Astrologer', icon: <Star className="w-4 h-4" /> },
  { id: 'jotshi', label: 'Jotshi', icon: <Users className="w-4 h-4" /> },
  { id: 'palmist', label: 'Palmist', icon: <Hand className="w-4 h-4" /> },
  { id: 'relationship', label: 'Relationship', icon: <Heart className="w-4 h-4" /> },
];

const expertImages = [expert1, expert2, expert3, expert4, expert5, expert6, expert7, expert8, expert9, expert10];

const experts: Expert[] = [
  // Astrologers (10)
  { id: 'a1', name: 'Pandit Ramesh Sharma', specialty: 'Vedic Astrology & Kundli', experience: '25+ years', rating: 4.9, rate: 35, status: 'online', avatar: expert1, category: 'astrologer', languages: ['Hindi', 'English'], sessions: 12450 },
  { id: 'a2', name: 'Acharya Lakshmi Devi', specialty: 'Nadi Astrology', experience: '18 years', rating: 4.8, rate: 30, status: 'online', avatar: expert2, category: 'astrologer', languages: ['Hindi', 'Tamil'], sessions: 8920 },
  { id: 'a3', name: 'Dr. Suresh Mishra', specialty: 'Predictive Astrology', experience: '20+ years', rating: 4.7, rate: 40, status: 'busy', avatar: expert3, category: 'astrologer', languages: ['Hindi', 'English'], sessions: 15680 },
  { id: 'a4', name: 'Jyotishacharya Priya', specialty: 'Birth Chart Analysis', experience: '15 years', rating: 4.9, rate: 28, status: 'online', avatar: expert4, category: 'astrologer', languages: ['Hindi', 'Marathi'], sessions: 7230 },
  { id: 'a5', name: 'Pandit Vikram Joshi', specialty: 'Muhurta & Electional', experience: '22 years', rating: 4.6, rate: 32, status: 'online', avatar: expert5, category: 'astrologer', languages: ['Hindi', 'Gujarati'], sessions: 9450 },
  { id: 'a6', name: 'Acharya Sunita Rao', specialty: 'KP Astrology', experience: '12 years', rating: 4.8, rate: 25, status: 'offline', avatar: expert6, category: 'astrologer', languages: ['Hindi', 'Telugu'], sessions: 5120 },
  { id: 'a7', name: 'Guruji Mahesh Tripathi', specialty: 'Lal Kitab Expert', experience: '30+ years', rating: 4.9, rate: 45, status: 'online', avatar: expert9, category: 'astrologer', languages: ['Hindi', 'English'], sessions: 21340 },
  { id: 'a8', name: 'Dr. Kavita Sharma', specialty: 'Medical Astrology', experience: '16 years', rating: 4.7, rate: 35, status: 'busy', avatar: expert8, category: 'astrologer', languages: ['Hindi', 'English'], sessions: 6780 },
  { id: 'a9', name: 'Pandit Rajendra Kumar', specialty: 'Horary Astrology', experience: '19 years', rating: 4.5, rate: 28, status: 'online', avatar: expert1, category: 'astrologer', languages: ['Hindi', 'Bengali'], sessions: 8320 },
  { id: 'a10', name: 'Acharya Meena Pandey', specialty: 'Transit Analysis', experience: '14 years', rating: 4.8, rate: 30, status: 'online', avatar: expert10, category: 'astrologer', languages: ['Hindi', 'Nepali'], sessions: 4890 },

  // Jotshis (10)
  { id: 'j1', name: 'Jotshi Harish Chandra', specialty: 'Kundli Matching', experience: '28 years', rating: 4.9, rate: 38, status: 'online', avatar: expert3, category: 'jotshi', languages: ['Hindi', 'Sanskrit'], sessions: 18920 },
  { id: 'j2', name: 'Jotshi Kamala Devi', specialty: 'Grah Dosh Nivaran', experience: '20 years', rating: 4.8, rate: 32, status: 'online', avatar: expert4, category: 'jotshi', languages: ['Hindi', 'Bengali'], sessions: 11450 },
  { id: 'j3', name: 'Shastri Gopal Das', specialty: 'Mangal Dosh Expert', experience: '35+ years', rating: 4.9, rate: 50, status: 'busy', avatar: expert9, category: 'jotshi', languages: ['Hindi', 'Marathi'], sessions: 24670 },
  { id: 'j4', name: 'Jotshi Radha Krishna', specialty: 'Panchang Analysis', experience: '18 years', rating: 4.7, rate: 28, status: 'online', avatar: expert2, category: 'jotshi', languages: ['Hindi', 'Gujarati'], sessions: 7890 },
  { id: 'j5', name: 'Pandit Shyam Sundar', specialty: 'Muhurta Selection', experience: '24 years', rating: 4.8, rate: 35, status: 'online', avatar: expert1, category: 'jotshi', languages: ['Hindi', 'Punjabi'], sessions: 13240 },
  { id: 'j6', name: 'Jotshi Saraswati Ma', specialty: 'Remedial Astrology', experience: '22 years', rating: 4.6, rate: 30, status: 'offline', avatar: expert10, category: 'jotshi', languages: ['Hindi', 'Tamil'], sessions: 9870 },
  { id: 'j7', name: 'Shastri Brij Mohan', specialty: 'Prashna Kundli', experience: '26 years', rating: 4.9, rate: 40, status: 'online', avatar: expert5, category: 'jotshi', languages: ['Hindi', 'English'], sessions: 16540 },
  { id: 'j8', name: 'Jotshi Annapurna Devi', specialty: 'Dasha Analysis', experience: '15 years', rating: 4.7, rate: 25, status: 'online', avatar: expert6, category: 'jotshi', languages: ['Hindi', 'Kannada'], sessions: 5430 },
  { id: 'j9', name: 'Pandit Narayan Sharma', specialty: 'Varga Charts', experience: '30 years', rating: 4.8, rate: 42, status: 'busy', avatar: expert3, category: 'jotshi', languages: ['Hindi', 'Sanskrit'], sessions: 19870 },
  { id: 'j10', name: 'Jotshi Parvati Mishra', specialty: 'Yogas & Doshas', experience: '19 years', rating: 4.6, rate: 28, status: 'online', avatar: expert8, category: 'jotshi', languages: ['Hindi', 'Odia'], sessions: 8120 },

  // Palmists (10)
  { id: 'p1', name: 'Hasta Rekha Expert Anil', specialty: 'Life Line Analysis', experience: '20 years', rating: 4.8, rate: 25, status: 'online', avatar: expert5, category: 'palmist', languages: ['Hindi', 'English'], sessions: 9870 },
  { id: 'p2', name: 'Palmist Rekha Verma', specialty: 'Heart & Head Lines', experience: '15 years', rating: 4.9, rate: 28, status: 'online', avatar: expert6, category: 'palmist', languages: ['Hindi', 'Marathi'], sessions: 7650 },
  { id: 'p3', name: 'Hasta Shastra Guru Dev', specialty: 'Mount Analysis', experience: '25+ years', rating: 4.7, rate: 35, status: 'busy', avatar: expert9, category: 'palmist', languages: ['Hindi', 'Bengali'], sessions: 14320 },
  { id: 'p4', name: 'Palmist Sunita Kapoor', specialty: 'Marriage Predictions', experience: '18 years', rating: 4.8, rate: 30, status: 'online', avatar: expert8, category: 'palmist', languages: ['Hindi', 'Punjabi'], sessions: 8940 },
  { id: 'p5', name: 'Hasta Vidya Expert Raj', specialty: 'Career from Palm', experience: '22 years', rating: 4.6, rate: 28, status: 'online', avatar: expert7, category: 'palmist', languages: ['Hindi', 'Gujarati'], sessions: 10230 },
  { id: 'p6', name: 'Palmist Asha Sharma', specialty: 'Fate Line Reading', experience: '16 years', rating: 4.9, rate: 32, status: 'offline', avatar: expert4, category: 'palmist', languages: ['Hindi', 'English'], sessions: 6780 },
  { id: 'p7', name: 'Hasta Rekha Pandit Om', specialty: 'Health Indicators', experience: '28 years', rating: 4.7, rate: 38, status: 'online', avatar: expert1, category: 'palmist', languages: ['Hindi', 'Tamil'], sessions: 15670 },
  { id: 'p8', name: 'Palmist Geeta Menon', specialty: 'Children & Family', experience: '14 years', rating: 4.8, rate: 25, status: 'online', avatar: expert2, category: 'palmist', languages: ['Hindi', 'Malayalam'], sessions: 4890 },
  { id: 'p9', name: 'Hasta Shastra Acharya', specialty: 'Wealth Lines', experience: '30 years', rating: 4.9, rate: 45, status: 'busy', avatar: expert3, category: 'palmist', languages: ['Hindi', 'Sanskrit'], sessions: 18760 },
  { id: 'p10', name: 'Palmist Nirmala Devi', specialty: 'Travel & Foreign', experience: '17 years', rating: 4.5, rate: 22, status: 'online', avatar: expert10, category: 'palmist', languages: ['Hindi', 'Telugu'], sessions: 5430 },

  // Relationship Experts (10)
  { id: 'r1', name: 'Dr. Arun Mehta', specialty: 'Marriage Counseling', experience: '18 years', rating: 4.9, rate: 40, status: 'online', avatar: expert7, category: 'relationship', languages: ['Hindi', 'English'], sessions: 11230 },
  { id: 'r2', name: 'Relationship Coach Neha', specialty: 'Love & Compatibility', experience: '12 years', rating: 4.8, rate: 35, status: 'online', avatar: expert8, category: 'relationship', languages: ['Hindi', 'English'], sessions: 7890 },
  { id: 'r3', name: 'Dr. Vijay Krishnan', specialty: 'Family Dynamics', experience: '22 years', rating: 4.7, rate: 45, status: 'busy', avatar: expert5, category: 'relationship', languages: ['Hindi', 'Tamil'], sessions: 14560 },
  { id: 'r4', name: 'Counselor Priya Singh', specialty: 'Pre-Marriage Guidance', experience: '15 years', rating: 4.9, rate: 38, status: 'online', avatar: expert6, category: 'relationship', languages: ['Hindi', 'Punjabi'], sessions: 8670 },
  { id: 'r5', name: 'Dr. Sanjay Gupta', specialty: 'Conflict Resolution', experience: '20 years', rating: 4.6, rate: 42, status: 'online', avatar: expert1, category: 'relationship', languages: ['Hindi', 'Bengali'], sessions: 12340 },
  { id: 'r6', name: 'Relationship Expert Ritu', specialty: 'Trust Building', experience: '14 years', rating: 4.8, rate: 32, status: 'offline', avatar: expert4, category: 'relationship', languages: ['Hindi', 'Marathi'], sessions: 6230 },
  { id: 'r7', name: 'Dr. Mohan Sharma', specialty: 'Intimacy Issues', experience: '25 years', rating: 4.7, rate: 50, status: 'online', avatar: expert3, category: 'relationship', languages: ['Hindi', 'English'], sessions: 17890 },
  { id: 'r8', name: 'Counselor Anita Joshi', specialty: 'Long Distance Love', experience: '10 years', rating: 4.9, rate: 28, status: 'online', avatar: expert2, category: 'relationship', languages: ['Hindi', 'Gujarati'], sessions: 4560 },
  { id: 'r9', name: 'Dr. Ravi Shankar', specialty: 'Divorce Counseling', experience: '28 years', rating: 4.5, rate: 55, status: 'busy', avatar: expert9, category: 'relationship', languages: ['Hindi', 'Telugu'], sessions: 19870 },
  { id: 'r10', name: 'Life Coach Deepa Rao', specialty: 'Self-Love & Growth', experience: '16 years', rating: 4.8, rate: 35, status: 'online', avatar: expert10, category: 'relationship', languages: ['Hindi', 'Kannada'], sessions: 7890 },
];

const TalkToJotshi = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredExperts = activeCategory === 'all' 
    ? experts 
    : experts.filter(e => e.category === activeCategory);

  const onlineCount = filteredExperts.filter(e => e.status === 'online').length;

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
              <p className="text-xs text-primary font-medium">{onlineCount} experts available now</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 space-y-5">
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
                    {experts.filter(e => e.category === cat.id).length}
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
              {filteredExperts.length} available
            </span>
          </div>
          
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
                        <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden ring-2 ring-border/50">
                          <img 
                            src={expert.avatar} 
                            alt={expert.name}
                            className="w-full h-full object-cover"
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
                        
                        {/* Price & Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-primary">₹{expert.rate}</span>
                            <span className="text-xs text-muted-foreground">/min</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <SpiritualButton
                              variant="outline"
                              size="sm"
                              disabled={expert.status !== 'online'}
                              className="h-9 px-3"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="ml-1">Chat</span>
                            </SpiritualButton>
                            <SpiritualButton
                              variant="primary"
                              size="sm"
                              disabled={expert.status !== 'online'}
                              className="h-9 px-4"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="ml-1">Call</span>
                            </SpiritualButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpiritualCardContent>
                </SpiritualCard>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default TalkToJotshi;
