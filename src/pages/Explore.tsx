import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Home, Sun, Moon, Star, Triangle, Book, Calendar,
  Sparkles, AlertTriangle, Heart, Coins, Compass, ChevronRight
} from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { Badge } from "@/components/ui/badge";

// Category data
const categories = [
  {
    id: "houses",
    title: "The 12 Houses",
    subtitle: "Bhava",
    icon: Home,
    color: "from-primary to-primary/60",
    description: "Explore life areas governed by each house",
    count: 12,
  },
  {
    id: "planets",
    title: "The 9 Planets",
    subtitle: "Navagraha",
    icon: Sun,
    color: "from-accent to-accent/60",
    description: "Understand planetary influences",
    count: 9,
  },
  {
    id: "doshas",
    title: "Kundli Doshas",
    subtitle: "Astrological Afflictions",
    icon: AlertTriangle,
    color: "from-destructive to-destructive/60",
    description: "Learn about doshas and remedies",
    count: 5,
  },
  {
    id: "panchang",
    title: "Daily Panchang",
    subtitle: "Hindu Calendar",
    icon: Calendar,
    color: "from-secondary to-secondary/60",
    description: "Today's auspicious times",
    route: "/panchang",
  },
  {
    id: "yogas",
    title: "Auspicious Yogas",
    subtitle: "Planetary Combinations",
    icon: Sparkles,
    color: "from-gold-dark to-gold",
    description: "Discover beneficial combinations",
    count: 10,
  },
  {
    id: "nakshatras",
    title: "27 Nakshatras",
    subtitle: "Lunar Mansions",
    icon: Star,
    color: "from-purple to-purple-light",
    description: "Your birth star significance",
    count: 27,
  },
];

// House data
const housesData = [
  { number: 1, name: "First House", sanskrit: "Tanu Bhava", domain: "Self, Personality, Physical Appearance", description: "Represents your physical body, appearance, general health, and how you present yourself to the world." },
  { number: 2, name: "Second House", sanskrit: "Dhana Bhava", domain: "Wealth, Family, Speech", description: "Governs accumulated wealth, family bonds, speech, food habits, and early childhood." },
  { number: 3, name: "Third House", sanskrit: "Sahaja Bhava", domain: "Siblings, Courage, Short Travels", description: "Rules over siblings, communication, courage, short journeys, and creative expressions." },
  { number: 4, name: "Fourth House", sanskrit: "Sukha Bhava", domain: "Mother, Home, Happiness", description: "Represents mother, domestic happiness, property, vehicles, and emotional foundation." },
  { number: 5, name: "Fifth House", sanskrit: "Putra Bhava", domain: "Children, Creativity, Romance", description: "Governs children, intelligence, creativity, romance, speculation, and past life karma." },
  { number: 6, name: "Sixth House", sanskrit: "Ari Bhava", domain: "Enemies, Health, Service", description: "Rules over enemies, obstacles, diseases, debts, and daily work/service." },
  { number: 7, name: "Seventh House", sanskrit: "Kalatra Bhava", domain: "Marriage, Partnership, Business", description: "Represents marriage, life partner, business partnerships, and public dealings." },
  { number: 8, name: "Eighth House", sanskrit: "Ayur Bhava", domain: "Longevity, Transformation, Hidden", description: "Governs longevity, sudden events, inheritance, research, and occult sciences." },
  { number: 9, name: "Ninth House", sanskrit: "Dharma Bhava", domain: "Fortune, Religion, Father", description: "Rules over luck, higher education, spirituality, long journeys, and father." },
  { number: 10, name: "Tenth House", sanskrit: "Karma Bhava", domain: "Career, Status, Authority", description: "Represents profession, public image, achievements, and social standing." },
  { number: 11, name: "Eleventh House", sanskrit: "Labha Bhava", domain: "Gains, Friends, Aspirations", description: "Governs income, gains, elder siblings, social networks, and fulfillment of desires." },
  { number: 12, name: "Twelfth House", sanskrit: "Vyaya Bhava", domain: "Loss, Moksha, Foreign Lands", description: "Rules over losses, expenses, spirituality, foreign settlement, and liberation." },
];

// Planet data
const planetsData = [
  { name: "Sun", sanskrit: "Surya", symbol: "☉", nature: "Royal, Soul", color: "#FF6B35", day: "Sunday", gem: "Ruby (Manik)", metal: "Gold" },
  { name: "Moon", sanskrit: "Chandra", symbol: "☽", nature: "Mind, Emotions", color: "#E8E8E8", day: "Monday", gem: "Pearl (Moti)", metal: "Silver" },
  { name: "Mars", sanskrit: "Mangal", symbol: "♂", nature: "Energy, Courage", color: "#DC2626", day: "Tuesday", gem: "Red Coral (Moonga)", metal: "Copper" },
  { name: "Mercury", sanskrit: "Budh", symbol: "☿", nature: "Intelligence, Speech", color: "#22C55E", day: "Wednesday", gem: "Emerald (Panna)", metal: "Bronze" },
  { name: "Jupiter", sanskrit: "Guru", symbol: "♃", nature: "Wisdom, Fortune", color: "#F59E0B", day: "Thursday", gem: "Yellow Sapphire (Pukhraj)", metal: "Gold" },
  { name: "Venus", sanskrit: "Shukra", symbol: "♀", nature: "Love, Luxury", color: "#EC4899", day: "Friday", gem: "Diamond (Heera)", metal: "Silver" },
  { name: "Saturn", sanskrit: "Shani", symbol: "♄", nature: "Discipline, Karma", color: "#1E40AF", day: "Saturday", gem: "Blue Sapphire (Neelam)", metal: "Iron" },
  { name: "Rahu", sanskrit: "Rahu", symbol: "☊", nature: "Obsession, Illusion", color: "#6B21A8", day: "Saturday", gem: "Hessonite (Gomed)", metal: "Lead" },
  { name: "Ketu", sanskrit: "Ketu", symbol: "☋", nature: "Detachment, Moksha", color: "#78716C", day: "Tuesday", gem: "Cat's Eye (Lahsuniya)", metal: "Iron" },
];

// Dosha data
const doshasData = [
  { name: "Manglik Dosha", sanskrit: "Mangal Dosha", severity: "High", cause: "Mars in 1st, 4th, 7th, 8th, or 12th house", effects: "Delays in marriage, conflicts with spouse", remedies: ["Kumbh Vivah", "Mangal Shanti Puja", "Wear Red Coral"] },
  { name: "Kaal Sarp Dosha", sanskrit: "Kaal Sarp Yoga", severity: "High", cause: "All planets between Rahu and Ketu", effects: "Sudden obstacles, delayed success", remedies: ["Kaal Sarp Shanti Puja", "Rahu-Ketu remedies", "Donate to orphans"] },
  { name: "Sade Sati", sanskrit: "Shani Sade Sati", severity: "Medium", cause: "Saturn transiting 12th, 1st, and 2nd from Moon", effects: "7.5 years of challenges and growth", remedies: ["Shani Puja on Saturdays", "Donate black items", "Chant Shani Mantra"] },
  { name: "Pitra Dosha", sanskrit: "Pitru Dosha", severity: "Medium", cause: "Sun/Moon afflicted by Rahu", effects: "Family problems, health issues", remedies: ["Shraddh rituals", "Feed crows", "Donate to priests"] },
  { name: "Grahan Dosha", sanskrit: "Grahan Yoga", severity: "Medium", cause: "Sun/Moon with Rahu/Ketu", effects: "Health problems, mental stress", remedies: ["Eclipse remedies", "Chant mantras", "Charity during eclipses"] },
];

const Explore = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: typeof categories[0]) => {
    if (category.route) {
      navigate(category.route);
    } else {
      setSelectedCategory(category.id);
    }
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case "houses":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <SpiritualButton variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-5 h-5" />
              </SpiritualButton>
              <h2 className="text-xl font-bold font-display">The 12 Houses (Bhavas)</h2>
            </div>
            <div className="grid gap-3">
              {housesData.map((house) => (
                <SpiritualCard key={house.number} variant="default" className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-spiritual flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {house.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{house.name}</h3>
                        <Badge variant="secondary" className="text-xs">{house.sanskrit}</Badge>
                      </div>
                      <p className="text-sm text-accent font-medium mb-1">{house.domain}</p>
                      <p className="text-sm text-muted-foreground">{house.description}</p>
                    </div>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        );

      case "planets":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <SpiritualButton variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-5 h-5" />
              </SpiritualButton>
              <h2 className="text-xl font-bold font-display">The 9 Planets (Navagraha)</h2>
            </div>
            <div className="grid gap-3">
              {planetsData.map((planet) => (
                <SpiritualCard key={planet.name} variant="elevated" className="p-4 overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: planet.color + "20", color: planet.color }}
                    >
                      {planet.symbol}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{planet.name}</h3>
                        <Badge variant="outline" className="text-xs">{planet.sanskrit}</Badge>
                      </div>
                      <p className="text-sm text-accent font-medium mb-2">{planet.nature}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <p><span className="font-medium">Day:</span> {planet.day}</p>
                        <p><span className="font-medium">Metal:</span> {planet.metal}</p>
                        <p className="col-span-2"><span className="font-medium">Gemstone:</span> {planet.gem}</p>
                      </div>
                    </div>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        );

      case "doshas":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <SpiritualButton variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-5 h-5" />
              </SpiritualButton>
              <h2 className="text-xl font-bold font-display">Kundli Doshas</h2>
            </div>
            <div className="grid gap-4">
              {doshasData.map((dosha) => (
                <SpiritualCard key={dosha.name} variant="mystic" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{dosha.name}</h3>
                      <p className="text-sm text-muted-foreground">{dosha.sanskrit}</p>
                    </div>
                    <Badge 
                      variant={dosha.severity === "High" ? "destructive" : "secondary"}
                    >
                      {dosha.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-accent">Cause:</span> {dosha.cause}</p>
                    <p><span className="font-medium text-destructive">Effects:</span> {dosha.effects}</p>
                    <div>
                      <span className="font-medium text-primary">Remedies:</span>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {dosha.remedies.map((remedy, idx) => (
                          <li key={idx}>{remedy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        );

      case "yogas":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <SpiritualButton variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-5 h-5" />
              </SpiritualButton>
              <h2 className="text-xl font-bold font-display">Auspicious Yogas</h2>
            </div>
            <div className="grid gap-3">
              {[
                { name: "Raj Yoga", effect: "Power, authority, and success in life", formation: "Lords of Kendra and Trikona conjunct or aspect each other" },
                { name: "Gaj Kesari Yoga", effect: "Wisdom, wealth, and recognition", formation: "Jupiter in Kendra from Moon" },
                { name: "Budhaditya Yoga", effect: "Intelligence and communication skills", formation: "Mercury conjunct Sun" },
                { name: "Lakshmi Yoga", effect: "Wealth and prosperity", formation: "Strong Venus with 9th lord" },
                { name: "Hamsa Yoga", effect: "Pure heart, spirituality", formation: "Jupiter in own sign in Kendra" },
                { name: "Malavya Yoga", effect: "Beauty, luxury, artistic talent", formation: "Venus in own sign in Kendra" },
                { name: "Sasa Yoga", effect: "Power, authority, hard work pays off", formation: "Saturn in own sign in Kendra" },
                { name: "Ruchaka Yoga", effect: "Courage, leadership, victory", formation: "Mars in own sign in Kendra" },
                { name: "Bhadra Yoga", effect: "Intelligence, business success", formation: "Mercury in own sign in Kendra" },
                { name: "Chandra-Mangal Yoga", effect: "Wealth through own efforts", formation: "Moon conjunct Mars" },
              ].map((yoga, idx) => (
                <SpiritualCard key={yoga.name} variant="golden" className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold">{yoga.name}</h3>
                      <p className="text-sm text-accent mt-1">{yoga.effect}</p>
                      <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Formation:</span> {yoga.formation}</p>
                    </div>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        );

      case "nakshatras":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <SpiritualButton variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-5 h-5" />
              </SpiritualButton>
              <h2 className="text-xl font-bold font-display">27 Nakshatras</h2>
            </div>
            <div className="grid gap-2">
              {[
                "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
                "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
                "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
              ].map((nakshatra, idx) => (
                <SpiritualCard key={nakshatra} variant="default" className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-medium text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{nakshatra}</span>
                    <Star className="w-3 h-3 text-accent ml-auto" />
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
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
            <div className="w-10 h-10 rounded-full bg-gradient-mystic flex items-center justify-center">
              <Book className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Astro Library</h1>
              <p className="text-xs text-muted-foreground">Explore Vedic Astrology</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {selectedCategory ? (
          renderCategoryContent()
        ) : (
          <div className="space-y-6">
            {/* Featured: Panchang */}
            <SpiritualCard 
              variant="spiritual" 
              className="p-6 cursor-pointer"
              onClick={() => navigate('/panchang')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-sunset flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display">Today's Panchang</h2>
                    <p className="text-sm text-muted-foreground">Tithi, Nakshatra, Rahu Kaal & more</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
            </SpiritualCard>

            {/* Category Grid */}
            <div>
              <h2 className="text-lg font-bold font-display mb-4">Explore Topics</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.filter(c => c.id !== 'panchang').map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SpiritualCard 
                      variant="elevated" 
                      className="p-4 cursor-pointer h-full"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold font-display">{category.title}</h3>
                      <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                      {category.count && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {category.count} items
                        </Badge>
                      )}
                    </SpiritualCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-lg font-bold font-display mb-4">Quick Actions</h2>
              <div className="grid gap-3">
                <SpiritualCard 
                  variant="default" 
                  className="p-4 cursor-pointer"
                  onClick={() => navigate('/kundli')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">My Kundli</h3>
                      <p className="text-xs text-muted-foreground">View your birth chart</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </SpiritualCard>
                <SpiritualCard 
                  variant="default" 
                  className="p-4 cursor-pointer"
                  onClick={() => navigate('/compatibility')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Compatibility</h3>
                      <p className="text-xs text-muted-foreground">Kundli matching</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </SpiritualCard>
              </div>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default Explore;
