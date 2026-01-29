import { motion } from "framer-motion";
import { Moon, ArrowLeft, Sun, Calendar, Clock, Star, Loader2, RefreshCw, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PanchangData {
  tithi: { name: string; end: string };
  nakshatra: { name: string; end: string };
  yoga: { name: string; end: string };
  karana: { name: string; end: string };
  paksha: string;
  month: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahukaal: string;
  yamagandam: string;
  gulika: string;
  abhijit: string;
  brahmaMuhurta: string;
  samvat?: string;
  ayanamsa?: string;
}

const fallbackPanchang: PanchangData = {
  tithi: { name: 'Shukla Ekadashi', end: '08:45 PM' },
  nakshatra: { name: 'Ashwini', end: '11:30 AM' },
  yoga: { name: 'Siddhi', end: '03:15 PM' },
  karana: { name: 'Bava', end: '08:45 PM' },
  paksha: 'Shukla Paksha',
  month: 'Magha',
  sunrise: '06:42 AM',
  sunset: '06:18 PM',
  moonrise: '02:30 AM',
  moonset: '01:45 PM',
  rahukaal: '10:30 AM - 12:00 PM',
  yamagandam: '03:00 PM - 04:30 PM',
  gulika: '07:30 AM - 09:00 AM',
  abhijit: '12:05 PM - 12:53 PM',
  brahmaMuhurta: '05:10 AM - 05:58 AM',
};

const Panchang = () => {
  const navigate = useNavigate();
  const today = new Date();
  const { userData } = useOnboardingStore();
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPanchang = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = userData.placeOfBirth || "New Delhi, India";
      const dateStr = format(today, 'yyyy-MM-dd');
      
      const { data, error: fnError } = await supabase.functions.invoke('panchang', {
        body: { 
          date: dateStr,
          location: location,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      if (fnError) {
        console.error("Panchang function error:", fnError);
        throw new Error(fnError.message);
      }

      if (data?.error || data?.fallback) {
        console.warn("Using fallback Panchang data");
        setPanchang(fallbackPanchang);
        toast.info("Using approximate Panchang data");
      } else {
        setPanchang(data);
        toast.success("Panchang updated for " + location);
      }
    } catch (err) {
      console.error("Failed to fetch Panchang:", err);
      setError("Failed to load Panchang");
      setPanchang(fallbackPanchang);
      toast.error("Using fallback data - couldn't fetch live Panchang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanchang();
  }, []);

  const currentPanchang = panchang || fallbackPanchang;
  const userLocation = userData.placeOfBirth || "New Delhi, India";

  const auspiciousTimings = [
    { name: 'Brahma Muhurta', time: currentPanchang.brahmaMuhurta || '05:10 AM - 05:58 AM', good: true },
    { name: 'Abhijit Muhurta', time: currentPanchang.abhijit, good: true },
    { name: 'Rahu Kaal', time: currentPanchang.rahukaal, good: false },
    { name: 'Yamagandam', time: currentPanchang.yamagandam, good: false },
  ];

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
              <div className="w-10 h-10 rounded-full bg-gradient-mystic flex items-center justify-center">
                <Moon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Daily Panchang</span>
            </div>
          </div>
          <SpiritualButton 
            variant="ghost" 
            size="icon" 
            onClick={fetchPanchang}
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </SpiritualButton>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Calculating Panchang for {userLocation}...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Personalization Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-4 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-spiritual flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      ✨ Personalized for You
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {userData.fullName ? `${userData.fullName}'s` : 'Your'} Daily Panchang
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    📍 Based on your birthplace: <span className="text-primary font-medium">{userLocation}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="ml-1 hover:text-primary transition-colors">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[280px] text-center p-3">
                          <p className="text-sm font-medium mb-1">Why Location Matters</p>
                          <p className="text-xs text-muted-foreground">
                            Panchang timings like sunrise, sunset, Rahu Kaal, and Muhurtas are calculated based on your geographical coordinates. Different locations see different timings due to Earth's rotation and your longitude/latitude.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Date & Location Header */}
            <SpiritualCard variant="spiritual" className="p-4 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  🔴 LIVE
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">{format(today, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPanchang.month} | {currentPanchang.paksha}
              </p>
              {currentPanchang.samvat && (
                <p className="text-sm font-medium text-primary mt-2">
                  🪷 {currentPanchang.samvat}
                </p>
              )}
            </SpiritualCard>

            {/* Sun & Moon Times - Location Based */}
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                ☀️ Calculated for <span className="text-primary font-medium">{userLocation}</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <SpiritualCard variant="golden" className="p-4 text-center">
                  <Sun className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-xs text-muted-foreground">Sunrise</p>
                  <p className="font-bold">{currentPanchang.sunrise}</p>
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Sunset</p>
                    <p className="font-medium">{currentPanchang.sunset}</p>
                  </div>
                </SpiritualCard>
                <SpiritualCard variant="mystic" className="p-4 text-center">
                  <Moon className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-xs text-muted-foreground">Moonrise</p>
                  <p className="font-bold">{currentPanchang.moonrise}</p>
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Moonset</p>
                    <p className="font-medium">{currentPanchang.moonset}</p>
                  </div>
                </SpiritualCard>
              </div>
            </div>
            <section className="space-y-3">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Panchang Elements
              </h3>
              <SpiritualCard variant="elevated" className="overflow-hidden">
                <div className="divide-y divide-border">
                  {[
                    { label: 'Tithi', value: currentPanchang.tithi.name, end: currentPanchang.tithi.end },
                    { label: 'Nakshatra', value: currentPanchang.nakshatra.name, end: currentPanchang.nakshatra.end },
                    { label: 'Yoga', value: currentPanchang.yoga.name, end: currentPanchang.yoga.end },
                    { label: 'Karana', value: currentPanchang.karana.name, end: currentPanchang.karana.end },
                  ].map((item) => (
                    <div key={item.label} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Until</p>
                        <p className="text-sm font-medium text-primary">{item.end}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SpiritualCard>
            </section>

            {/* Auspicious Timings */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Important Timings
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {auspiciousTimings.map((timing) => (
                  <SpiritualCard
                    key={timing.name}
                    variant={timing.good ? "spiritual" : "default"}
                    className="p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${timing.good ? 'bg-green-500' : 'bg-red-500'}`} />
                      <p className="text-sm font-medium">{timing.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{timing.time}</p>
                  </SpiritualCard>
                ))}
              </div>
            </section>

            {/* Abhijit Muhurta */}
            <SpiritualCard variant="golden" className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h4 className="font-semibold">Abhijit Muhurta (Most Auspicious)</h4>
              <p className="text-lg font-bold text-accent">{currentPanchang.abhijit}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Best time for starting important tasks
              </p>
            </SpiritualCard>

            {/* Gulika Kaal */}
            <SpiritualCard variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gulika Kaal</p>
                  <p className="text-xs text-muted-foreground">{currentPanchang.gulika}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">Avoid</span>
                </div>
              </div>
            </SpiritualCard>
          </>
        )}
      </main>
    </motion.div>
  );
};

export default Panchang;
