import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, User, Calendar, Clock, MapPin, Download, Share2, Scan, BookOpen, Languages, FileText, ChevronRight, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { format } from "date-fns";
import DivisionalCharts from "@/components/kundli/DivisionalCharts";
import PlanetaryTable from "@/components/kundli/PlanetaryTable";
import KundliScanner from "@/components/kundli/KundliScanner";
import KundliAnalysisDashboard from "@/components/kundli/KundliAnalysisDashboard";
import LifeReportGenerator from "@/components/kundli/LifeReportGenerator";
import WalkthroughTrigger from "@/components/walkthrough/WalkthroughTrigger";
import { generateSampleKundli } from "@/lib/kundli";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Ganesha SVG icon for Hindu feel
const GaneshaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

const MyKundli = () => {
  const navigate = useNavigate();
  const { userData } = useOnboardingStore();
  const [activeTab, setActiveTab] = useState<"charts" | "scan" | "report">("charts");
  const [scannedAnalysis, setScannedAnalysis] = useState<any>(null);
  const [useHindiTerms, setUseHindiTerms] = useState(false);

  // Generate Kundli based on user's actual birth data
  const kundliData = generateSampleKundli(
    userData.dateOfBirth,
    userData.timeOfBirth,
    userData.placeOfBirth
  );

  const handleAnalysisComplete = (analysis: any) => {
    setScannedAnalysis(analysis);
  };

  const handleBackFromAnalysis = () => {
    setScannedAnalysis(null);
  };

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
              <span className="font-display font-bold text-xl">
                {useHindiTerms ? "मेरी कुंडली" : "My Kundli"}
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 mr-2">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <Switch
                id="hindi-mode"
                checked={useHindiTerms}
                onCheckedChange={setUseHindiTerms}
              />
            </div>
            <WalkthroughTrigger />
            <SpiritualButton variant="ghost" size="icon" onClick={() => toast.info("Share feature coming soon!")}>
              <Share2 className="w-5 h-5" />
            </SpiritualButton>
            <SpiritualButton variant="ghost" size="icon" onClick={() => toast.info("Download feature coming soon!")}>
              <Download className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* User Info Card */}
        <SpiritualCard variant="spiritual" className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold font-display">{userData.fullName || 'Your Name'}</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {userData.dateOfBirth ? format(userData.dateOfBirth, 'PPP') : 'Not set'}
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {userData.timeOfBirth || 'Not set'}
                </p>
                <p className="flex items-center gap-1 col-span-2">
                  <MapPin className="w-3 h-3" />
                  {userData.placeOfBirth || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </SpiritualCard>

        {/* Tabs for Charts / Scan / Report */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full bg-muted/50">
            <TabsTrigger value="charts" className="flex items-center gap-2 text-xs">
              <BookOpen className="w-4 h-4" />
              {useHindiTerms ? "चार्ट्स" : "Charts"}
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2 text-xs">
              <Scan className="w-4 h-4" />
              {useHindiTerms ? "स्कैन" : "Scan"}
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4" />
              {useHindiTerms ? "रिपोर्ट" : "Report"}
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab - With Divisional Charts */}
          <TabsContent value="charts" className="mt-6 space-y-6">
            {/* Lagna Info */}
            <SpiritualCard variant="golden" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {useHindiTerms ? "लग्न (Ascendant)" : "Lagna (Ascendant)"}
                  </p>
                  <p className="text-2xl font-bold text-accent">{kundliData.lagnaSign}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {useHindiTerms ? "चंद्र नक्षत्र" : "Moon Nakshatra"}
                  </p>
                  <p className="font-medium">{kundliData.nakshatras.moon}</p>
                  <p className="text-xs text-muted-foreground">Pada {kundliData.nakshatras.pada}</p>
                </div>
              </div>
            </SpiritualCard>

            {/* Divisional Charts Component */}
            <section>
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                <GaneshaIcon />
                {useHindiTerms ? "विभाजन चार्ट" : "Divisional Charts"}
              </h3>
              <DivisionalCharts baseData={kundliData} />
            </section>

            {/* Dasha Info */}
            {kundliData.dashaInfo && (
              <SpiritualCard variant="mystic" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {useHindiTerms ? "वर्तमान महादशा" : "Current Maha Dasha"}
                    </p>
                    <p className="text-xl font-bold">{kundliData.dashaInfo.currentMahaDasha}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {useHindiTerms ? "अवधि" : "Period"}
                    </p>
                    <p className="font-medium">{kundliData.dashaInfo.startDate} - {kundliData.dashaInfo.endDate}</p>
                  </div>
                </div>
              </SpiritualCard>
            )}

            {/* Planet Positions Table */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                {useHindiTerms ? "ग्रह स्थिति" : "Planetary Positions"}
              </h3>
              <PlanetaryTable data={kundliData} />
            </section>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <SpiritualButton 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={() => setActiveTab("report")}
              >
                <FileText className="w-4 h-4 mr-2" />
                {useHindiTerms ? "जीवन रिपोर्ट" : "Life Report"}
              </SpiritualButton>
              <SpiritualButton 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/explore')}
              >
                {useHindiTerms ? "पुस्तकालय" : "Astro Library"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </SpiritualButton>
            </div>
          </TabsContent>

          {/* Scan Kundli Tab */}
          <TabsContent value="scan" className="mt-6">
            <AnimatePresence mode="wait">
              {scannedAnalysis ? (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <KundliAnalysisDashboard 
                    analysis={scannedAnalysis} 
                    onBack={handleBackFromAnalysis}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Info banner */}
                  <SpiritualCard variant="mystic" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <GaneshaIcon />
                      </div>
                      <div>
                        <h3 className="font-bold font-display">
                          {useHindiTerms ? "AI ज्योतिषी विश्लेषण" : "AI Jotshi Analysis"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {useHindiTerms 
                            ? "अपनी हस्तलिखित या मुद्रित कुंडली की तस्वीर अपलोड करें।"
                            : "Upload a photo of your handwritten or printed Kundli for complete Vedic analysis with doshas, yogas, and remedies."}
                        </p>
                      </div>
                    </div>
                  </SpiritualCard>

                  {/* Scanner component */}
                  <KundliScanner 
                    onAnalysisComplete={handleAnalysisComplete}
                    birthDate={userData.dateOfBirth ? format(userData.dateOfBirth, 'yyyy-MM-dd') : undefined}
                  />

                  {/* Features list */}
                  <SpiritualCard variant="default" className="p-4">
                    <h4 className="font-bold text-sm mb-3">
                      {useHindiTerms ? "AI क्या पढ़ेगा:" : "What AI analyzes:"}
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {useHindiTerms ? "दोष पहचान" : "Dosha Detection (Manglik, Kaal Sarp)"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {useHindiTerms ? "शुभ योग" : "Auspicious Yogas (Raj Yoga, Gaj Kesari)"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {useHindiTerms ? "दशा गणना" : "Mahadasha & Antardasha"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {useHindiTerms ? "उपाय" : "Personalized Remedies"}
                      </li>
                    </ul>
                  </SpiritualCard>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Life Report Tab */}
          <TabsContent value="report" className="mt-6">
            <LifeReportGenerator 
              kundliData={kundliData}
              userName={userData.fullName}
              dateOfBirth={userData.dateOfBirth ? format(userData.dateOfBirth, 'yyyy-MM-dd') : undefined}
            />
          </TabsContent>
        </Tabs>

        {/* Talk to Jotshi CTA */}
        <SpiritualCard 
          variant="spiritual" 
          className="p-4 mt-6 cursor-pointer"
          onClick={() => navigate('/talk')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-primary-foreground">
                  {useHindiTerms ? "ज्योतिषी से बात करें" : "Talk to a Real Jotshi"}
                </h4>
                <p className="text-xs text-primary-foreground/80">
                  {useHindiTerms ? "विस्तृत परामर्श के लिए" : "For deeper clarity & guidance"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </div>
        </SpiritualCard>
      </main>
    </motion.div>
  );
};

export default MyKundli;
