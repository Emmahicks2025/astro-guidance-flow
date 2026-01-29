import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Star, Clock, Phone, Video, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useState } from "react";

// Import expert images
import astrologerMale1 from "@/assets/experts/astrologer-male-1.jpg";
import astrologerFemale1 from "@/assets/experts/astrologer-female-1.jpg";
import jotshiMale1 from "@/assets/experts/jotshi-male-1.jpg";
import jotshiFemale1 from "@/assets/experts/jotshi-female-1.jpg";
import palmistMale1 from "@/assets/experts/palmist-male-1.jpg";
import palmistFemale1 from "@/assets/experts/palmist-female-1.jpg";
import relationshipMale1 from "@/assets/experts/relationship-male-1.jpg";
import relationshipFemale1 from "@/assets/experts/relationship-female-1.jpg";
import guruMale1 from "@/assets/experts/guru-male-1.jpg";
import guruFemale1 from "@/assets/experts/guru-female-1.jpg";

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
}

const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'astrologer', label: 'Astrologer', icon: '🌟' },
  { id: 'jotshi', label: 'Jotshi', icon: '🔮' },
  { id: 'palmist', label: 'Palmist', icon: '🖐️' },
  { id: 'relationship', label: 'Relationship', icon: '💕' },
];

const experts: Expert[] = [
  // Astrologers (10)
  { id: 'a1', name: 'Pandit Ramesh Sharma', specialty: 'Vedic Astrology & Kundli', experience: '25+ years', rating: 4.9, rate: 35, status: 'online', avatar: astrologerMale1, category: 'astrologer', languages: ['Hindi', 'English'] },
  { id: 'a2', name: 'Acharya Lakshmi Devi', specialty: 'Nadi Astrology', experience: '18 years', rating: 4.8, rate: 30, status: 'online', avatar: astrologerFemale1, category: 'astrologer', languages: ['Hindi', 'Tamil'] },
  { id: 'a3', name: 'Dr. Suresh Mishra', specialty: 'Predictive Astrology', experience: '20+ years', rating: 4.7, rate: 40, status: 'busy', avatar: guruMale1, category: 'astrologer', languages: ['Hindi', 'English'] },
  { id: 'a4', name: 'Jyotishacharya Priya', specialty: 'Birth Chart Analysis', experience: '15 years', rating: 4.9, rate: 28, status: 'online', avatar: jotshiFemale1, category: 'astrologer', languages: ['Hindi', 'Marathi'] },
  { id: 'a5', name: 'Pandit Vikram Joshi', specialty: 'Muhurta & Electional', experience: '22 years', rating: 4.6, rate: 32, status: 'online', avatar: jotshiMale1, category: 'astrologer', languages: ['Hindi', 'Gujarati'] },
  { id: 'a6', name: 'Acharya Sunita Rao', specialty: 'KP Astrology', experience: '12 years', rating: 4.8, rate: 25, status: 'offline', avatar: guruFemale1, category: 'astrologer', languages: ['Hindi', 'Telugu'] },
  { id: 'a7', name: 'Guruji Mahesh Tripathi', specialty: 'Lal Kitab Expert', experience: '30+ years', rating: 4.9, rate: 45, status: 'online', avatar: astrologerMale1, category: 'astrologer', languages: ['Hindi', 'English'] },
  { id: 'a8', name: 'Dr. Kavita Sharma', specialty: 'Medical Astrology', experience: '16 years', rating: 4.7, rate: 35, status: 'busy', avatar: astrologerFemale1, category: 'astrologer', languages: ['Hindi', 'English'] },
  { id: 'a9', name: 'Pandit Rajendra Kumar', specialty: 'Horary Astrology', experience: '19 years', rating: 4.5, rate: 28, status: 'online', avatar: guruMale1, category: 'astrologer', languages: ['Hindi', 'Bengali'] },
  { id: 'a10', name: 'Acharya Meena Pandey', specialty: 'Transit Analysis', experience: '14 years', rating: 4.8, rate: 30, status: 'online', avatar: jotshiFemale1, category: 'astrologer', languages: ['Hindi', 'Nepali'] },

  // Jotshis (10)
  { id: 'j1', name: 'Jotshi Harish Chandra', specialty: 'Kundli Matching', experience: '28 years', rating: 4.9, rate: 38, status: 'online', avatar: jotshiMale1, category: 'jotshi', languages: ['Hindi', 'Sanskrit'] },
  { id: 'j2', name: 'Jotshi Kamala Devi', specialty: 'Grah Dosh Nivaran', experience: '20 years', rating: 4.8, rate: 32, status: 'online', avatar: jotshiFemale1, category: 'jotshi', languages: ['Hindi', 'Bengali'] },
  { id: 'j3', name: 'Shastri Gopal Das', specialty: 'Mangal Dosh Expert', experience: '35+ years', rating: 4.9, rate: 50, status: 'busy', avatar: guruMale1, category: 'jotshi', languages: ['Hindi', 'Marathi'] },
  { id: 'j4', name: 'Jotshi Radha Krishna', specialty: 'Panchang Analysis', experience: '18 years', rating: 4.7, rate: 28, status: 'online', avatar: astrologerFemale1, category: 'jotshi', languages: ['Hindi', 'Gujarati'] },
  { id: 'j5', name: 'Pandit Shyam Sundar', specialty: 'Muhurta Selection', experience: '24 years', rating: 4.8, rate: 35, status: 'online', avatar: astrologerMale1, category: 'jotshi', languages: ['Hindi', 'Punjabi'] },
  { id: 'j6', name: 'Jotshi Saraswati Ma', specialty: 'Remedial Astrology', experience: '22 years', rating: 4.6, rate: 30, status: 'offline', avatar: guruFemale1, category: 'jotshi', languages: ['Hindi', 'Tamil'] },
  { id: 'j7', name: 'Shastri Brij Mohan', specialty: 'Prashna Kundli', experience: '26 years', rating: 4.9, rate: 40, status: 'online', avatar: jotshiMale1, category: 'jotshi', languages: ['Hindi', 'English'] },
  { id: 'j8', name: 'Jotshi Annapurna Devi', specialty: 'Dasha Analysis', experience: '15 years', rating: 4.7, rate: 25, status: 'online', avatar: jotshiFemale1, category: 'jotshi', languages: ['Hindi', 'Kannada'] },
  { id: 'j9', name: 'Pandit Narayan Sharma', specialty: 'Varga Charts', experience: '30 years', rating: 4.8, rate: 42, status: 'busy', avatar: guruMale1, category: 'jotshi', languages: ['Hindi', 'Sanskrit'] },
  { id: 'j10', name: 'Jotshi Parvati Mishra', specialty: 'Yogas & Doshas', experience: '19 years', rating: 4.6, rate: 28, status: 'online', avatar: astrologerFemale1, category: 'jotshi', languages: ['Hindi', 'Odia'] },

  // Palmists (10)
  { id: 'p1', name: 'Hasta Rekha Expert Anil', specialty: 'Life Line Analysis', experience: '20 years', rating: 4.8, rate: 25, status: 'online', avatar: palmistMale1, category: 'palmist', languages: ['Hindi', 'English'] },
  { id: 'p2', name: 'Palmist Rekha Verma', specialty: 'Heart & Head Lines', experience: '15 years', rating: 4.9, rate: 28, status: 'online', avatar: palmistFemale1, category: 'palmist', languages: ['Hindi', 'Marathi'] },
  { id: 'p3', name: 'Hasta Shastra Guru Dev', specialty: 'Mount Analysis', experience: '25+ years', rating: 4.7, rate: 35, status: 'busy', avatar: jotshiMale1, category: 'palmist', languages: ['Hindi', 'Bengali'] },
  { id: 'p4', name: 'Palmist Sunita Kapoor', specialty: 'Marriage Predictions', experience: '18 years', rating: 4.8, rate: 30, status: 'online', avatar: relationshipFemale1, category: 'palmist', languages: ['Hindi', 'Punjabi'] },
  { id: 'p5', name: 'Hasta Vidya Expert Raj', specialty: 'Career from Palm', experience: '22 years', rating: 4.6, rate: 28, status: 'online', avatar: palmistMale1, category: 'palmist', languages: ['Hindi', 'Gujarati'] },
  { id: 'p6', name: 'Palmist Asha Sharma', specialty: 'Fate Line Reading', experience: '16 years', rating: 4.9, rate: 32, status: 'offline', avatar: palmistFemale1, category: 'palmist', languages: ['Hindi', 'English'] },
  { id: 'p7', name: 'Hasta Rekha Pandit Om', specialty: 'Health Indicators', experience: '28 years', rating: 4.7, rate: 38, status: 'online', avatar: guruMale1, category: 'palmist', languages: ['Hindi', 'Tamil'] },
  { id: 'p8', name: 'Palmist Geeta Menon', specialty: 'Children & Family', experience: '14 years', rating: 4.8, rate: 25, status: 'online', avatar: jotshiFemale1, category: 'palmist', languages: ['Hindi', 'Malayalam'] },
  { id: 'p9', name: 'Hasta Shastra Acharya', specialty: 'Wealth Lines', experience: '30 years', rating: 4.9, rate: 45, status: 'busy', avatar: astrologerMale1, category: 'palmist', languages: ['Hindi', 'Sanskrit'] },
  { id: 'p10', name: 'Palmist Nirmala Devi', specialty: 'Travel & Foreign', experience: '17 years', rating: 4.5, rate: 22, status: 'online', avatar: guruFemale1, category: 'palmist', languages: ['Hindi', 'Telugu'] },

  // Relationship Experts (10)
  { id: 'r1', name: 'Dr. Arun Mehta', specialty: 'Marriage Counseling', experience: '18 years', rating: 4.9, rate: 40, status: 'online', avatar: relationshipMale1, category: 'relationship', languages: ['Hindi', 'English'] },
  { id: 'r2', name: 'Relationship Coach Neha', specialty: 'Love & Compatibility', experience: '12 years', rating: 4.8, rate: 35, status: 'online', avatar: relationshipFemale1, category: 'relationship', languages: ['Hindi', 'English'] },
  { id: 'r3', name: 'Dr. Vijay Krishnan', specialty: 'Family Dynamics', experience: '22 years', rating: 4.7, rate: 45, status: 'busy', avatar: jotshiMale1, category: 'relationship', languages: ['Hindi', 'Tamil'] },
  { id: 'r4', name: 'Counselor Priya Singh', specialty: 'Pre-Marriage Guidance', experience: '15 years', rating: 4.9, rate: 38, status: 'online', avatar: astrologerFemale1, category: 'relationship', languages: ['Hindi', 'Punjabi'] },
  { id: 'r5', name: 'Dr. Sanjay Gupta', specialty: 'Conflict Resolution', experience: '20 years', rating: 4.6, rate: 42, status: 'online', avatar: relationshipMale1, category: 'relationship', languages: ['Hindi', 'Bengali'] },
  { id: 'r6', name: 'Relationship Expert Ritu', specialty: 'Trust Building', experience: '14 years', rating: 4.8, rate: 32, status: 'offline', avatar: relationshipFemale1, category: 'relationship', languages: ['Hindi', 'Marathi'] },
  { id: 'r7', name: 'Dr. Mohan Sharma', specialty: 'Intimacy Issues', experience: '25 years', rating: 4.7, rate: 50, status: 'online', avatar: guruMale1, category: 'relationship', languages: ['Hindi', 'English'] },
  { id: 'r8', name: 'Counselor Anita Joshi', specialty: 'Long Distance Love', experience: '10 years', rating: 4.9, rate: 28, status: 'online', avatar: jotshiFemale1, category: 'relationship', languages: ['Hindi', 'Gujarati'] },
  { id: 'r9', name: 'Dr. Ravi Shankar', specialty: 'Divorce Counseling', experience: '28 years', rating: 4.5, rate: 55, status: 'busy', avatar: astrologerMale1, category: 'relationship', languages: ['Hindi', 'Telugu'] },
  { id: 'r10', name: 'Life Coach Deepa Rao', specialty: 'Self-Love & Growth', experience: '16 years', rating: 4.8, rate: 35, status: 'online', avatar: guruFemale1, category: 'relationship', languages: ['Hindi', 'Kannada'] },
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-xl">Talk to Expert</span>
              <p className="text-xs text-muted-foreground">{onlineCount} experts online now</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Category Filter */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by specialty</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                  activeCategory === cat.id
                    ? 'bg-gradient-spiritual text-primary-foreground shadow-lg'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id ? 'bg-white/20' : 'bg-background'
                  }`}>
                    {experts.filter(e => e.category === cat.id).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Info Banner */}
        <SpiritualCard variant="spiritual" className="p-4">
          <p className="text-sm text-center">
            🔒 100% confidential • ⭐ Verified experts • 💬 Chat, Call or Video
          </p>
        </SpiritualCard>

        {/* Expert List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display">
              {activeCategory === 'all' ? 'All Experts' : categories.find(c => c.id === activeCategory)?.label + 's'}
            </h3>
            <span className="text-sm text-muted-foreground">{filteredExperts.length} available</span>
          </div>
          
          {filteredExperts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <SpiritualCard variant="elevated" interactive className="overflow-hidden">
                <SpiritualCardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <img 
                        src={expert.avatar} 
                        alt={expert.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                        expert.status === 'online' ? 'bg-green-500' : 
                        expert.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{expert.name}</h4>
                          <p className="text-sm text-primary truncate">{expert.specialty}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          expert.status === 'online' ? 'bg-green-500/10 text-green-600' :
                          expert.status === 'busy' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {expert.status === 'online' ? '● Online' : 
                           expert.status === 'busy' ? '● Busy' : '○ Offline'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {expert.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-accent fill-accent" /> {expert.rating}
                        </span>
                        <span className="text-accent font-semibold">₹{expert.rate}/min</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {expert.languages.map((lang) => (
                          <span key={lang} className="text-xs px-2 py-0.5 bg-muted/50 rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <SpiritualButton
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          disabled={expert.status !== 'online'}
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </SpiritualButton>
                        <SpiritualButton
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={expert.status !== 'online'}
                        >
                          <Video className="w-4 h-4" />
                          Video
                        </SpiritualButton>
                        <SpiritualButton
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          disabled={expert.status !== 'online'}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </SpiritualButton>
                      </div>
                    </div>
                  </div>
                </SpiritualCardContent>
              </SpiritualCard>
            </motion.div>
          ))}
        </section>
      </main>
    </motion.div>
  );
};

export default TalkToJotshi;
