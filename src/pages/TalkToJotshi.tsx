import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Star, Clock, Phone, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";

const availableJotshis = [
  {
    id: '1',
    name: 'Pandit Ramesh Sharma',
    specialty: 'Kundli & Marriage',
    experience: '15+ years',
    rating: 4.9,
    rate: 25,
    status: 'online',
    avatar: '🧘',
  },
  {
    id: '2',
    name: 'Acharya Meera Devi',
    specialty: 'Career & Finance',
    experience: '12 years',
    rating: 4.8,
    rate: 20,
    status: 'online',
    avatar: '🔮',
  },
  {
    id: '3',
    name: 'Guruji Suresh Joshi',
    specialty: 'Vastu & Remedies',
    experience: '20+ years',
    rating: 4.7,
    rate: 30,
    status: 'busy',
    avatar: '✨',
  },
];

const TalkToJotshi = () => {
  const navigate = useNavigate();

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
            <span className="font-display font-bold text-xl">Talk to Jotshi</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <SpiritualCard variant="spiritual" className="p-4">
          <p className="text-sm text-center">
            Connect with verified Vedic astrologers for personalized guidance
          </p>
        </SpiritualCard>

        {/* Jotshi List */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold font-display">Available Astrologers</h3>
          {availableJotshis.map((jotshi, index) => (
            <motion.div
              key={jotshi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SpiritualCard variant="elevated" interactive className="overflow-hidden">
                <SpiritualCardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-spiritual flex items-center justify-center text-3xl">
                      {jotshi.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{jotshi.name}</h4>
                          <p className="text-sm text-primary">{jotshi.specialty}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${jotshi.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {jotshi.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-accent fill-accent" /> {jotshi.rating}
                        </span>
                        <span className="text-accent font-medium">₹{jotshi.rate}/min</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <SpiritualButton
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          disabled={jotshi.status !== 'online'}
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </SpiritualButton>
                        <SpiritualButton
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={jotshi.status !== 'online'}
                        >
                          <Video className="w-4 h-4" />
                          Video
                        </SpiritualButton>
                        <SpiritualButton
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          disabled={jotshi.status !== 'online'}
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
