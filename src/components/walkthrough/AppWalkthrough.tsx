import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronRight, ChevronLeft, Star, Sun, Moon, Calendar, Heart, 
  MessageCircle, Hand, Book, Compass, Sparkles, User, Home, Check
} from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Progress } from "@/components/ui/progress";

interface WalkthroughStep {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  icon: React.ElementType;
  gradient: string;
  tips?: string[];
  learnMore?: {
    term: string;
    explanation: string;
  }[];
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to AstroGuru",
    subtitle: "Your Personal Vedic Astrology Guide",
    content: "Discover the ancient wisdom of Vedic Astrology (Jyotish). This app helps you understand your life path, relationships, career, and spiritual journey through the lens of celestial knowledge passed down for thousands of years.",
    icon: Star,
    gradient: "from-primary to-secondary",
    tips: [
      "Jyotish means 'Science of Light' in Sanskrit",
      "Vedic Astrology is over 5,000 years old",
      "It's based on the actual positions of stars and planets"
    ]
  },
  {
    id: "kundli",
    title: "What is a Kundli?",
    subtitle: "Your Cosmic Birth Chart",
    content: "A Kundli (also called Janam Patri or Birth Chart) is a map of the sky at the exact moment you were born. It shows where all the planets were positioned, and these positions influence different areas of your life.",
    icon: Compass,
    gradient: "from-accent to-gold-dark",
    learnMore: [
      { term: "Lagna (Ascendant)", explanation: "The zodiac sign rising on the eastern horizon at your birth. It represents your personality and physical appearance." },
      { term: "Rashi (Moon Sign)", explanation: "The zodiac sign where the Moon was at your birth. It governs your emotions and mind." },
      { term: "Nakshatra (Birth Star)", explanation: "One of 27 lunar mansions. Your birth star reveals deeper personality traits and life patterns." }
    ],
    tips: [
      "Your exact birth time is crucial for accuracy",
      "Even a 5-minute difference can change your chart",
      "Birth place determines which stars were visible"
    ]
  },
  {
    id: "houses",
    title: "The 12 Houses",
    subtitle: "Areas of Your Life",
    content: "A Kundli is divided into 12 houses, each governing different life areas. Think of them as 12 departments of your life, from self and wealth to marriage and spirituality.",
    icon: Home,
    gradient: "from-secondary to-purple-light",
    learnMore: [
      { term: "1st House (Self)", explanation: "Your personality, physical body, and how others see you." },
      { term: "7th House (Marriage)", explanation: "Partnerships, marriage, business relationships." },
      { term: "10th House (Career)", explanation: "Profession, reputation, public image, achievements." },
      { term: "4th House (Home)", explanation: "Mother, property, emotional foundation, domestic happiness." }
    ]
  },
  {
    id: "planets",
    title: "The 9 Planets (Navagraha)",
    subtitle: "Cosmic Influencers",
    content: "Nine celestial bodies influence your life according to Vedic Astrology. Each planet (Graha) governs specific aspects of life and has its own personality and effects.",
    icon: Sun,
    gradient: "from-gold to-accent",
    learnMore: [
      { term: "Sun (Surya)", explanation: "Soul, authority, father, government. Gives confidence and leadership." },
      { term: "Moon (Chandra)", explanation: "Mind, emotions, mother. Governs mental peace and intuition." },
      { term: "Mars (Mangal)", explanation: "Energy, courage, siblings. Can cause aggression or give strength." },
      { term: "Jupiter (Guru)", explanation: "Wisdom, luck, spirituality. The most beneficial planet for growth." },
      { term: "Saturn (Shani)", explanation: "Discipline, karma, delays. Teaches life lessons through challenges." },
      { term: "Rahu & Ketu", explanation: "Shadow planets. Cause sudden changes, obsessions, and spiritual growth." }
    ]
  },
  {
    id: "doshas",
    title: "Understanding Doshas",
    subtitle: "Planetary Afflictions",
    content: "Doshas are challenging planetary combinations in your chart. They're not curses, but areas that need attention. With proper remedies, their effects can be reduced significantly.",
    icon: Sparkles,
    gradient: "from-destructive/80 to-destructive/50",
    learnMore: [
      { term: "Manglik Dosha", explanation: "Mars in certain houses. Can cause delays or conflicts in marriage. Very common and manageable." },
      { term: "Kaal Sarp Dosha", explanation: "All planets between Rahu-Ketu. May cause sudden obstacles. Has remedies." },
      { term: "Sade Sati", explanation: "7.5 years of Saturn's transit near Moon. A period of learning and transformation." }
    ],
    tips: [
      "80% of people have some form of Manglik Dosha",
      "Doshas can be neutralized through remedies",
      "Two Manglik people marrying cancel each other's dosha"
    ]
  },
  {
    id: "dasha",
    title: "Mahadasha Periods",
    subtitle: "Planetary Time Cycles",
    content: "Your life unfolds through Mahadasha (major periods) ruled by different planets. Each planet's period brings its own themes, challenges, and opportunities.",
    icon: Moon,
    gradient: "from-purple to-secondary",
    learnMore: [
      { term: "Vimshottari Dasha", explanation: "The 120-year cycle divided among 9 planets. Most commonly used system." },
      { term: "Mahadasha", explanation: "Major period of a planet lasting 6-20 years depending on the planet." },
      { term: "Antardasha", explanation: "Sub-period within Mahadasha. Modifies the main period's effects." }
    ],
    tips: [
      "Jupiter's period (16 years) often brings growth",
      "Saturn's period (19 years) brings maturity through discipline",
      "Knowing your Dasha helps plan major life decisions"
    ]
  },
  {
    id: "panchang",
    title: "Daily Panchang",
    subtitle: "The Hindu Calendar",
    content: "Panchang shows the quality of each day based on 5 elements. It helps you choose auspicious times for important activities and avoid inauspicious periods.",
    icon: Calendar,
    gradient: "from-primary to-saffron-dark",
    learnMore: [
      { term: "Tithi", explanation: "Lunar day. There are 30 tithis in a lunar month, determining the day's energy." },
      { term: "Nakshatra", explanation: "Moon's position in one of 27 stars. Affects the day's nature." },
      { term: "Yoga", explanation: "Sun-Moon combination. One of 27 yogas affecting activities." },
      { term: "Karana", explanation: "Half of a tithi. 11 karanas repeat through the month." },
      { term: "Rahu Kaal", explanation: "Inauspicious 1.5-hour period each day. Avoid new beginnings." }
    ]
  },
  {
    id: "compatibility",
    title: "Guna Milan",
    subtitle: "Marriage Compatibility",
    content: "Guna Milan matches two horoscopes on 36 points across 8 aspects. It's traditionally used before marriage to assess compatibility between partners.",
    icon: Heart,
    gradient: "from-pink-500 to-rose-400",
    learnMore: [
      { term: "Ashtakoot", explanation: "8 aspects checked: Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi." },
      { term: "Nadi (8 points)", explanation: "Most important factor. Same Nadi can indicate health issues for children." },
      { term: "Minimum Score", explanation: "18+ points is considered acceptable. 24+ is good. 28+ is excellent." }
    ],
    tips: [
      "Score isn't everything - overall chart analysis matters",
      "Same Nadi dosha can be neutralized",
      "Manglik status of both partners is also checked"
    ]
  },
  {
    id: "talk",
    title: "Talk to a Jotshi",
    subtitle: "Expert Consultation",
    content: "While this app provides AI-powered analysis, nothing replaces a consultation with an experienced Jotshi (Vedic Astrologer). They can provide personalized guidance based on your complete chart.",
    icon: MessageCircle,
    gradient: "from-secondary to-purple",
    tips: [
      "Prepare your questions before the call",
      "Have accurate birth details ready",
      "Ask about remedies for specific concerns",
      "The AI analysis is shared with the Jotshi for context"
    ]
  },
  {
    id: "explore",
    title: "Astro Library",
    subtitle: "Learn & Explore",
    content: "Dive deeper into Vedic Astrology through our educational content. Learn about each house, planet, nakshatra, and more at your own pace.",
    icon: Book,
    gradient: "from-accent to-gold",
    tips: [
      "Start with understanding your own Lagna",
      "Learn about your Moon sign's characteristics",
      "Explore the significance of your birth Nakshatra",
      "Read about your current Mahadasha period"
    ]
  },
  {
    id: "ready",
    title: "You're Ready!",
    subtitle: "Begin Your Cosmic Journey",
    content: "You now have a basic understanding of Vedic Astrology. Explore your Kundli, check today's Panchang, or consult with an expert. May the stars guide you well!",
    icon: Check,
    gradient: "from-green-500 to-emerald-400",
    tips: [
      "Your birth chart is your cosmic DNA",
      "Free will works within astrological tendencies",
      "Remedies can enhance positive outcomes",
      "Astrology is a guide, not a destiny"
    ]
  }
];

interface AppWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const AppWalkthrough = ({ isOpen, onClose, onComplete }: AppWalkthroughProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);

  const step = walkthroughSteps[currentStep];
  const progress = ((currentStep + 1) / walkthroughSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setExpandedTerms([]);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setExpandedTerms([]);
    }
  };

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => 
      prev.includes(term) 
        ? prev.filter(t => t !== term)
        : [...prev, term]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">AstroGuru Guide</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {walkthroughSteps.length}
            </span>
            <SpiritualButton variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-1 rounded-none" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-6 max-w-lg"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-display mb-1">{step.title}</h2>
                {step.subtitle && (
                  <p className="text-muted-foreground">{step.subtitle}</p>
                )}
              </div>

              {/* Main Content */}
              <div className="bg-card rounded-2xl p-5 border border-border mb-6">
                <p className="text-sm leading-relaxed">{step.content}</p>
              </div>

              {/* Learn More Terms */}
              {step.learnMore && step.learnMore.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Book className="w-4 h-4 text-primary" />
                    Key Terms
                  </h4>
                  <div className="space-y-2">
                    {step.learnMore.map((item) => (
                      <motion.div
                        key={item.term}
                        className="bg-muted/50 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleTerm(item.term)}
                          className="w-full p-3 text-left flex items-center justify-between"
                        >
                          <span className="font-medium text-sm">{item.term}</span>
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform ${
                              expandedTerms.includes(item.term) ? 'rotate-90' : ''
                            }`} 
                          />
                        </button>
                        <AnimatePresence>
                          {expandedTerms.includes(item.term) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3 pb-3"
                            >
                              <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded-lg">
                                {item.explanation}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {step.tips && step.tips.length > 0 && (
                <div className="bg-primary/10 rounded-2xl p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Did You Know?
                  </h4>
                  <ul className="space-y-2">
                    {step.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <Star className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="container mx-auto max-w-lg flex gap-3">
            <SpiritualButton
              variant="outline"
              size="lg"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </SpiritualButton>
            <SpiritualButton
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === walkthroughSteps.length - 1 ? (
                <>
                  Get Started
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </SpiritualButton>
          </div>

          {/* Skip Button */}
          <div className="text-center mt-3">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppWalkthrough;
