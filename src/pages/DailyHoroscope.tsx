import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, ArrowLeft, Star, TrendingUp, Heart, Briefcase, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";

const zodiacSigns = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' },
];

const mockHoroscope = {
  overall: "Today brings exciting opportunities for personal growth. The stars favor bold decisions and creative pursuits. Trust your instincts and don't hesitate to take the lead.",
  love: 4,
  career: 5,
  finance: 3,
  health: 4,
  luckyNumber: 7,
  luckyColor: "Saffron",
};

const DailyHoroscope = () => {
  const navigate = useNavigate();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`}
      />
    ));
  };

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
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Daily Horoscope</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {!selectedSign ? (
          <>
            <h3 className="text-lg font-bold font-display text-center">Select Your Sign</h3>
            <div className="grid grid-cols-3 gap-3">
              {zodiacSigns.map((sign, index) => (
                <motion.div
                  key={sign.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SpiritualCard
                    variant="elevated"
                    interactive
                    className="p-4 text-center"
                    onClick={() => setSelectedSign(sign.name)}
                  >
                    <p className="text-3xl mb-1">{sign.symbol}</p>
                    <p className="font-medium text-sm">{sign.name}</p>
                    <p className="text-xs text-muted-foreground">{sign.dates}</p>
                  </SpiritualCard>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <SpiritualButton variant="ghost" onClick={() => setSelectedSign(null)}>
              ← Change Sign
            </SpiritualButton>

            <SpiritualCard variant="spiritual" className="p-6 text-center">
              <p className="text-5xl mb-2">
                {zodiacSigns.find(s => s.name === selectedSign)?.symbol}
              </p>
              <h2 className="text-2xl font-bold font-display">{selectedSign}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </SpiritualCard>

            <SpiritualCard variant="elevated" className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Today's Outlook
              </h3>
              <p className="text-muted-foreground leading-relaxed">{mockHoroscope.overall}</p>
            </SpiritualCard>

            <div className="grid grid-cols-2 gap-3">
              <SpiritualCard variant="default" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">Love</span>
                </div>
                <div className="flex">{renderStars(mockHoroscope.love)}</div>
              </SpiritualCard>
              <SpiritualCard variant="default" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Career</span>
                </div>
                <div className="flex">{renderStars(mockHoroscope.career)}</div>
              </SpiritualCard>
              <SpiritualCard variant="default" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Finance</span>
                </div>
                <div className="flex">{renderStars(mockHoroscope.finance)}</div>
              </SpiritualCard>
              <SpiritualCard variant="default" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Health</span>
                </div>
                <div className="flex">{renderStars(mockHoroscope.health)}</div>
              </SpiritualCard>
            </div>

            <SpiritualCard variant="golden" className="p-4">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Lucky Number</p>
                  <p className="text-2xl font-bold text-accent">{mockHoroscope.luckyNumber}</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Lucky Color</p>
                  <p className="text-lg font-bold">{mockHoroscope.luckyColor}</p>
                </div>
              </div>
            </SpiritualCard>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default DailyHoroscope;
