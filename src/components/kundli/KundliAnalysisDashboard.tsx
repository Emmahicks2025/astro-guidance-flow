import { motion } from "framer-motion";
import { 
  User, Heart, Briefcase, Sparkles, AlertTriangle, 
  Star, Gem, BookOpen, Phone, MessageCircle, 
  Sun, Moon, Flame, Wind, Droplets, Shield,
  ChevronRight, Clock
} from "lucide-react";
import { SpiritualCard, SpiritualCardContent, SpiritualCardHeader, SpiritualCardTitle } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

interface KundliAnalysis {
  chartStyle: string;
  lagna: string;
  lagnaNumber: number;
  moonSign: string;
  moonNakshatra: string;
  nakshatraPada: number;
  planets: Array<{
    name: string;
    hindiName: string;
    house: number;
    sign: string;
    isRetrograde: boolean;
  }>;
  doshas: Array<{
    name: string;
    present: boolean;
    severity?: string;
    description: string;
  }>;
  yogas: Array<{
    name: string;
    present: boolean;
    houses?: string;
    description: string;
  }>;
  mahadasha: {
    current: string;
    startYear: number;
    endYear: number;
    antardasha: string;
    antardashaEnd: string;
  };
  personalIdentity: {
    title: string;
    description: string;
  };
  marriageLove: {
    title: string;
    description: string;
    warnings?: string[];
  };
  careerWealth: {
    title: string;
    description: string;
    predictions?: string[];
  };
  dailyRemedy: {
    title: string;
    description: string;
    color: string;
    deity: string;
  };
  remedies: Array<{
    type: string;
    issue: string;
    remedy: string;
    frequency?: string;
    bestDay?: string;
    disclaimer?: string;
  }>;
  panchangDetails?: {
    tithi: string;
    vara: string;
    nakshatra: string;
  };
}

interface KundliAnalysisDashboardProps {
  analysis: KundliAnalysis;
  onBack: () => void;
}

const getPlanetIcon = (name: string) => {
  const icons: Record<string, any> = {
    Sun: Sun,
    Moon: Moon,
    Mars: Flame,
    Mercury: Wind,
    Jupiter: Star,
    Venus: Heart,
    Saturn: Shield,
    Rahu: Droplets,
    Ketu: Droplets,
  };
  return icons[name] || Star;
};

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case "severe": return "bg-destructive text-destructive-foreground";
    case "moderate": return "bg-accent text-accent-foreground";
    case "mild": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const KundliAnalysisDashboard = ({ analysis, onBack }: KundliAnalysisDashboardProps) => {
  const navigate = useNavigate();

  const categoryCards = [
    {
      id: "identity",
      icon: User,
      title: analysis.personalIdentity.title,
      description: analysis.personalIdentity.description,
      gradient: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/20 text-primary",
    },
    {
      id: "love",
      icon: Heart,
      title: analysis.marriageLove.title,
      description: analysis.marriageLove.description,
      warnings: analysis.marriageLove.warnings,
      gradient: "from-pink-500/20 to-pink-500/5",
      iconBg: "bg-pink-500/20 text-pink-600",
    },
    {
      id: "career",
      icon: Briefcase,
      title: analysis.careerWealth.title,
      description: analysis.careerWealth.description,
      predictions: analysis.careerWealth.predictions,
      gradient: "from-secondary/20 to-secondary/5",
      iconBg: "bg-secondary/20 text-secondary",
    },
    {
      id: "daily",
      icon: Sparkles,
      title: analysis.dailyRemedy.title,
      description: analysis.dailyRemedy.description,
      color: analysis.dailyRemedy.color,
      deity: analysis.dailyRemedy.deity,
      gradient: "from-accent/20 to-accent/5",
      iconBg: "bg-accent/20 text-accent",
    },
  ];

  const activeDoshas = analysis.doshas.filter(d => d.present);
  const activeYogas = analysis.yogas.filter(y => y.present);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with Lagna Info */}
      <SpiritualCard variant="golden" className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Lagna (Ascendant)</p>
            <p className="text-2xl font-bold font-display text-accent">{analysis.lagna}</p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Moon Sign:</span> {analysis.moonSign} • 
              <span className="text-muted-foreground ml-1">Nakshatra:</span> {analysis.moonNakshatra} (Pada {analysis.nakshatraPada})
            </p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">{analysis.chartStyle}</Badge>
            <p className="text-xs text-muted-foreground">Chart Style</p>
          </div>
        </div>
      </SpiritualCard>

      {/* Current Dasha Period */}
      <SpiritualCard variant="mystic" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Current Maha Dasha</p>
            <p className="text-xl font-bold">{analysis.mahadasha.current}</p>
            <p className="text-sm text-muted-foreground">
              {analysis.mahadasha.startYear} - {analysis.mahadasha.endYear} • 
              Antardasha: {analysis.mahadasha.antardasha} (until {analysis.mahadasha.antardashaEnd})
            </p>
          </div>
        </div>
      </SpiritualCard>

      {/* Panchang Details if available */}
      {analysis.panchangDetails && (
        <SpiritualCard variant="spiritual" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-medium">Birth Panchang</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Tithi</p>
              <p className="font-medium">{analysis.panchangDetails.tithi}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vara</p>
              <p className="font-medium">{analysis.panchangDetails.vara}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nakshatra</p>
              <p className="font-medium">{analysis.panchangDetails.nakshatra}</p>
            </div>
          </div>
        </SpiritualCard>
      )}

      {/* Main Analysis Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          Your Life Reading
        </h3>

        {categoryCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SpiritualCard variant="elevated" className={`p-4 bg-gradient-to-br ${card.gradient}`}>
              <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold font-display">{card.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                  
                  {card.warnings && card.warnings.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {card.warnings.map((warning, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {warning}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {card.predictions && card.predictions.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {card.predictions.map((pred, i) => (
                        <li key={i} className="text-xs flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-primary" />
                          {pred}
                        </li>
                      ))}
                    </ul>
                  )}

                  {card.color && card.deity && (
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Wear {card.color}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Worship {card.deity}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </SpiritualCard>
          </motion.div>
        ))}
      </div>

      {/* Doshas Section */}
      {activeDoshas.length > 0 && (
        <SpiritualCard variant="default" className="overflow-hidden">
          <SpiritualCardHeader className="bg-destructive/10 border-b border-destructive/20">
            <SpiritualCardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Doshas Detected
            </SpiritualCardTitle>
          </SpiritualCardHeader>
          <SpiritualCardContent className="p-4 space-y-3">
            {activeDoshas.map((dosha, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge className={getSeverityColor(dosha.severity)}>
                  {dosha.severity || "Present"}
                </Badge>
                <div>
                  <p className="font-medium">{dosha.name}</p>
                  <p className="text-sm text-muted-foreground">{dosha.description}</p>
                </div>
              </div>
            ))}
          </SpiritualCardContent>
        </SpiritualCard>
      )}

      {/* Yogas Section */}
      {activeYogas.length > 0 && (
        <SpiritualCard variant="default" className="overflow-hidden">
          <SpiritualCardHeader className="bg-accent/10 border-b border-accent/20">
            <SpiritualCardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-accent" />
              Auspicious Yogas
            </SpiritualCardTitle>
          </SpiritualCardHeader>
          <SpiritualCardContent className="p-4 space-y-3">
            {activeYogas.map((yoga, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{yoga.name}</p>
                  {yoga.houses && <p className="text-xs text-muted-foreground">Houses: {yoga.houses}</p>}
                  <p className="text-sm text-muted-foreground">{yoga.description}</p>
                </div>
              </div>
            ))}
          </SpiritualCardContent>
        </SpiritualCard>
      )}

      {/* Planet Positions */}
      <Accordion type="single" collapsible>
        <AccordionItem value="planets" className="border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:no-underline">
            <span className="font-display font-bold">Planetary Positions (Graha Sthiti)</span>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {analysis.planets.map((planet, i) => {
                const Icon = getPlanetIcon(planet.name);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Icon className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {planet.name} ({planet.hindiName})
                        {planet.isRetrograde && <span className="text-xs ml-1">(R)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        House {planet.house} • {planet.sign}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Remedies Section */}
      <SpiritualCard variant="spiritual" className="overflow-hidden">
        <SpiritualCardHeader className="border-b border-primary/20">
          <SpiritualCardTitle className="flex items-center gap-2 text-lg">
            <Gem className="w-5 h-5 text-primary" />
            Personalized Remedies (Upay)
          </SpiritualCardTitle>
        </SpiritualCardHeader>
        <SpiritualCardContent className="p-4 space-y-4">
          {analysis.remedies.map((remedy, i) => (
            <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{remedy.type}</Badge>
                {remedy.bestDay && (
                  <span className="text-xs text-muted-foreground">Best on {remedy.bestDay}</span>
                )}
              </div>
              <p className="font-medium text-sm">{remedy.remedy}</p>
              <p className="text-xs text-muted-foreground mt-1">
                For: {remedy.issue}
                {remedy.frequency && ` • ${remedy.frequency}`}
              </p>
              {remedy.disclaimer && (
                <p className="text-xs text-destructive/80 mt-1 italic">
                  ⚠️ {remedy.disclaimer}
                </p>
              )}
            </div>
          ))}
        </SpiritualCardContent>
      </SpiritualCard>

      {/* Talk to Real Jotshi CTA */}
      <SpiritualCard variant="mystic" className="p-5">
        <div className="text-center space-y-3">
          <h3 className="font-display font-bold text-lg">Need Deeper Clarity?</h3>
          <p className="text-sm text-muted-foreground">
            Our verified Jotshis have reviewed your AI analysis and are ready to provide personalized guidance.
          </p>
          <div className="flex gap-3 justify-center">
            <SpiritualButton
              variant="outline"
              onClick={() => navigate("/talk")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with Jotshi
            </SpiritualButton>
            <SpiritualButton
              variant="primary"
              onClick={() => navigate("/talk")}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call a Jotshi
            </SpiritualButton>
          </div>
        </div>
      </SpiritualCard>

      {/* Back button */}
      <SpiritualButton
        variant="ghost"
        className="w-full"
        onClick={onBack}
      >
        Scan Another Kundli
      </SpiritualButton>
    </motion.div>
  );
};

export default KundliAnalysisDashboard;
