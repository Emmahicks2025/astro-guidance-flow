import { motion } from "framer-motion";
import { Star, ArrowLeft, User, Calendar, Clock, MapPin, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { format } from "date-fns";

const planetPositions = [
  { planet: 'Sun (Surya)', sign: 'Leo', house: 1, degree: '15°24\'' },
  { planet: 'Moon (Chandra)', sign: 'Cancer', house: 12, degree: '22°18\'' },
  { planet: 'Mars (Mangal)', sign: 'Aries', house: 9, degree: '08°42\'' },
  { planet: 'Mercury (Budh)', sign: 'Virgo', house: 2, degree: '19°30\'' },
  { planet: 'Jupiter (Guru)', sign: 'Sagittarius', house: 5, degree: '11°15\'' },
  { planet: 'Venus (Shukra)', sign: 'Libra', house: 3, degree: '25°08\'' },
  { planet: 'Saturn (Shani)', sign: 'Capricorn', house: 6, degree: '03°55\'' },
  { planet: 'Rahu', sign: 'Gemini', house: 11, degree: '17°22\'' },
  { planet: 'Ketu', sign: 'Sagittarius', house: 5, degree: '17°22\'' },
];

const MyKundli = () => {
  const navigate = useNavigate();
  const { userData } = useOnboardingStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </SpiritualButton>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">My Kundli</span>
            </div>
          </div>
          <div className="flex gap-2">
            <SpiritualButton variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </SpiritualButton>
            <SpiritualButton variant="ghost" size="icon">
              <Download className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <SpiritualCard variant="spiritual" className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold font-display">{userData.fullName || 'Your Name'}</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {userData.dateOfBirth ? format(userData.dateOfBirth, 'PPP') : 'Not set'}
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {userData.timeOfBirth || 'Not set'}
                </p>
                <p className="flex items-center gap-1 col-span-2">
                  <MapPin className="w-4 h-4" />
                  {userData.placeOfBirth || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </SpiritualCard>

        {/* Kundli Chart Placeholder */}
        <SpiritualCard variant="elevated" className="overflow-hidden">
          <SpiritualCardContent className="p-6">
            <h3 className="text-lg font-bold font-display mb-4 text-center">Janam Kundli (Birth Chart)</h3>
            {/* North Indian Style Chart Placeholder */}
            <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border-2 border-primary/20 flex items-center justify-center">
              <div className="text-center p-4">
                <Star className="w-16 h-16 mx-auto mb-4 text-accent" />
                <p className="text-muted-foreground">
                  North Indian style Kundli chart
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  (Chart visualization coming soon)
                </p>
              </div>
            </div>
          </SpiritualCardContent>
        </SpiritualCard>

        {/* Lagna Info */}
        <SpiritualCard variant="golden" className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Lagna (Ascendant)</p>
          <p className="text-2xl font-bold text-accent">Leo (Simha)</p>
          <p className="text-sm mt-1">Rising at 15°24'</p>
        </SpiritualCard>

        {/* Planet Positions */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display">Planetary Positions</h3>
          <SpiritualCard variant="elevated" className="overflow-hidden">
            <div className="divide-y divide-border">
              {planetPositions.map((planet) => (
                <div key={planet.planet} className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{planet.planet}</p>
                    <p className="text-sm text-muted-foreground">in {planet.sign}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary">House {planet.house}</p>
                    <p className="text-xs text-muted-foreground">{planet.degree}</p>
                  </div>
                </div>
              ))}
            </div>
          </SpiritualCard>
        </section>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <SpiritualButton variant="primary" size="lg" className="w-full">
            Detailed Analysis
          </SpiritualButton>
          <SpiritualButton variant="outline" size="lg" className="w-full">
            Dasha Periods
          </SpiritualButton>
        </div>
      </main>
    </motion.div>
  );
};

export default MyKundli;
