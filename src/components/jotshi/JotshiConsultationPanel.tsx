import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  BookOpen, 
  Pill, 
  X,
  User,
  Calendar,
  Clock,
  MapPin,
  Star,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save
} from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NorthIndianKundliChart from "@/components/kundli/NorthIndianKundliChart";
import PlanetaryTable from "@/components/kundli/PlanetaryTable";
import { generateSampleKundli, KundliData } from "@/lib/kundli";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  concern: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  birthTimeExactness: string;
  aiAnalysisSummary?: string;
}

interface JotshiConsultationPanelProps {
  user: UserProfile;
  onBack: () => void;
}

const quickActions = [
  { icon: Sparkles, label: 'Suggest Mantra', action: 'mantra' },
  { icon: Pill, label: 'Send Remedy', action: 'remedy' },
  { icon: BookOpen, label: 'Recommend Pooja', action: 'pooja' },
];

// Generate Navamsa (D9) chart from D1
const generateNavamsa = (d1Data: KundliData): KundliData => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const getSignIndex = (sign: string): number => signs.indexOf(sign);

  const navamsaPlanets = d1Data.planets.map(planet => {
    const signIndex = getSignIndex(planet.sign);
    const navamsaNumber = Math.floor(planet.degree / 3.333333) % 9;
    
    let startSign: number;
    if (signIndex % 4 === 0) startSign = 0;
    else if (signIndex % 4 === 1) startSign = 3;
    else if (signIndex % 4 === 2) startSign = 6;
    else startSign = 9;
    
    const navamsaSign = signs[(startSign + navamsaNumber) % 12];
    const navamsaHouse = ((startSign + navamsaNumber) % 12) + 1;
    
    return {
      ...planet,
      sign: navamsaSign,
      house: navamsaHouse,
      degree: (planet.degree * 9) % 30
    };
  });

  const d9LagnaIndex = (getSignIndex(d1Data.lagnaSign) * 9) % 12;
  
  return {
    ...d1Data,
    lagnaSign: signs[d9LagnaIndex],
    planets: navamsaPlanets
  };
};

const JotshiConsultationPanel = ({ user, onBack }: JotshiConsultationPanelProps) => {
  const [message, setMessage] = useState("");
  const [jotshiNotes, setJotshiNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"d1" | "d9">("d1");
  const [messages, setMessages] = useState<Array<{ role: 'jotshi' | 'user'; text: string; time: string }>>([
    { role: 'user', text: `Namaste Guruji, I need guidance about ${user.concern.toLowerCase()}.`, time: '2:30 PM' },
  ]);

  // Generate Kundli charts based on user's birth data
  const d1KundliData = generateSampleKundli(
    new Date(user.birthDate), 
    user.birthTime, 
    user.birthPlace
  );
  const d9KundliData = generateNavamsa(d1KundliData);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, {
      role: 'jotshi',
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }]);
    setMessage("");
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      mantra: `🙏 Based on your chart, I recommend chanting the ${d1KundliData.lagnaSign === 'Leo' ? 'Surya' : 'Chandra'} Mantra daily:\n\n"Om ${d1KundliData.lagnaSign === 'Leo' ? 'Suryaya' : 'Chandraya'} Namaha"\n\nChant 108 times every morning for best results.`,
      remedy: `💎 Recommended Remedies:\n\n1. Wear a ${d1KundliData.lagnaSign === 'Leo' ? 'Ruby' : 'Pearl'} gemstone on your ${d1KundliData.lagnaSign === 'Leo' ? 'ring' : 'little'} finger\n2. Donate to the needy on ${d1KundliData.lagnaSign === 'Leo' ? 'Sundays' : 'Mondays'}\n3. Fast on ${d1KundliData.lagnaSign === 'Leo' ? 'Sunday' : 'Monday'} mornings`,
      pooja: `🪔 I recommend performing a ${user.concern === 'Marriage & Love' ? 'Vivah Prapti' : user.concern === 'Career & Business' ? 'Brihaspati' : 'Navagraha'} Pooja.\n\nBest time: During ${d1KundliData.nakshatras.moon} Nakshatra\nIdeal day: Thursday`,
    };

    setMessages([...messages, {
      role: 'jotshi',
      text: actionMessages[action] || 'Guidance sent.',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }]);
    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} suggestion sent!`);
  };

  const handleSaveNotes = () => {
    toast.success("Notes saved successfully!");
    setShowNotes(false);
  };

  const handleEndSession = () => {
    toast.success("Session ended. Earnings updated.");
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Top Bar - User Info */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <SpiritualButton 
                variant="ghost" 
                size="icon" 
                className="text-secondary-foreground hover:bg-secondary-foreground/10"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </SpiritualButton>
              <div className="w-10 h-10 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold">{user.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-secondary-foreground/20">
                    {user.concern}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <SpiritualButton 
                variant="ghost" 
                size="sm"
                className="text-secondary-foreground hover:bg-secondary-foreground/10"
                onClick={() => setShowNotes(!showNotes)}
              >
                <FileText className="w-4 h-4 mr-1" />
                Notes
              </SpiritualButton>
              <SpiritualButton 
                variant="ghost" 
                size="sm"
                className="text-secondary-foreground hover:bg-secondary-foreground/10"
                onClick={handleEndSession}
              >
                <X className="w-4 h-4 mr-1" />
                End
              </SpiritualButton>
            </div>
          </div>

          {/* Birth Details Strip */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1 opacity-80">
              <Calendar className="w-4 h-4" /> {user.birthDate}
            </span>
            <span className="flex items-center gap-1 opacity-80">
              <Clock className="w-4 h-4" /> {user.birthTime}
              {user.birthTimeExactness !== 'exact' && (
                <span className="text-xs bg-yellow-500/20 px-1 rounded">~approx</span>
              )}
            </span>
            <span className="flex items-center gap-1 opacity-80">
              <MapPin className="w-4 h-4" /> {user.birthPlace}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent" /> 
              {d1KundliData.lagnaSign} | {d1KundliData.nakshatras.moon}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 container mx-auto p-4 grid lg:grid-cols-5 gap-4 overflow-hidden">
        {/* Left: Chart Suite (40%) */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto">
          {/* Side-by-Side Charts */}
          <SpiritualCard variant="elevated" className="p-4">
            <Tabs value={activeChartTab} onValueChange={(v) => setActiveChartTab(v as any)}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="d1" className="text-xs">
                  Lagna (D1)
                </TabsTrigger>
                <TabsTrigger value="d9" className="text-xs">
                  Navamsa (D9)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="d1">
                <div className="flex justify-center">
                  <NorthIndianKundliChart data={d1KundliData} size={220} />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Lagna: {d1KundliData.lagnaSign}
                </p>
              </TabsContent>
              
              <TabsContent value="d9">
                <div className="flex justify-center">
                  <NorthIndianKundliChart data={d9KundliData} size={220} />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  D9 Lagna: {d9KundliData.lagnaSign}
                </p>
              </TabsContent>
            </Tabs>
          </SpiritualCard>

          {/* AI Analysis Summary (if available) */}
          {user.aiAnalysisSummary && (
            <SpiritualCard variant="mystic" className="p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Analysis Summary
              </h4>
              <p className="text-xs text-muted-foreground">{user.aiAnalysisSummary}</p>
            </SpiritualCard>
          )}

          {/* Planetary Table */}
          <PlanetaryTable data={d1KundliData} />

          {/* Dasha Info */}
          {d1KundliData.dashaInfo && (
            <SpiritualCard variant="golden" className="p-4">
              <h4 className="font-semibold mb-2 text-sm">Current Maha Dasha</h4>
              <p className="text-lg font-bold text-accent">{d1KundliData.dashaInfo.currentMahaDasha}</p>
              <p className="text-xs text-muted-foreground">
                {d1KundliData.dashaInfo.startDate} - {d1KundliData.dashaInfo.endDate}
              </p>
            </SpiritualCard>
          )}

          {/* Jotshi Notes Panel */}
          {showNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SpiritualCard variant="default" className="p-4">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Private Notes
                </h4>
                <Textarea
                  placeholder="Add observations about dasha periods, yogas, or specific concerns..."
                  value={jotshiNotes}
                  onChange={(e) => setJotshiNotes(e.target.value)}
                  className="min-h-[120px] text-sm mb-3"
                />
                <SpiritualButton 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSaveNotes}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Notes
                </SpiritualButton>
              </SpiritualCard>
            </motion.div>
          )}
        </div>

        {/* Right: Chat Area (60%) */}
        <div className="lg:col-span-3 flex flex-col bg-muted/30 rounded-xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'jotshi' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'jotshi' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-card border border-border rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.role === 'jotshi' ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
            {quickActions.map((action) => (
              <SpiritualButton
                key={action.action}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.action)}
                className="whitespace-nowrap"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </SpiritualButton>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <SpiritualInput
                placeholder="Type your guidance..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <SpiritualButton 
                variant="primary" 
                size="icon"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send className="w-5 h-5" />
              </SpiritualButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JotshiConsultationPanel;
