import { motion } from "framer-motion";
import { Moon, ArrowLeft, Sun, Calendar, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { format } from "date-fns";

const todayPanchang = {
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
};

const auspiciousTimings = [
  { name: 'Brahma Muhurta', time: '05:10 AM - 05:58 AM', good: true },
  { name: 'Abhijit Muhurta', time: '12:05 PM - 12:53 PM', good: true },
  { name: 'Rahu Kaal', time: '10:30 AM - 12:00 PM', good: false },
  { name: 'Yamagandam', time: '03:00 PM - 04:30 PM', good: false },
];

const Panchang = () => {
  const navigate = useNavigate();
  const today = new Date();

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
              <Moon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Daily Panchang</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Date Header */}
        <SpiritualCard variant="spiritual" className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">{format(today, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {todayPanchang.month} | {todayPanchang.paksha}
          </p>
        </SpiritualCard>

        {/* Sun & Moon Times */}
        <div className="grid grid-cols-2 gap-3">
          <SpiritualCard variant="golden" className="p-4 text-center">
            <Sun className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-xs text-muted-foreground">Sunrise</p>
            <p className="font-bold">{todayPanchang.sunrise}</p>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Sunset</p>
              <p className="font-medium">{todayPanchang.sunset}</p>
            </div>
          </SpiritualCard>
          <SpiritualCard variant="mystic" className="p-4 text-center">
            <Moon className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <p className="text-xs text-muted-foreground">Moonrise</p>
            <p className="font-bold">{todayPanchang.moonrise}</p>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Moonset</p>
              <p className="font-medium">{todayPanchang.moonset}</p>
            </div>
          </SpiritualCard>
        </div>

        {/* Panchang Details */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Panchang Elements
          </h3>
          <SpiritualCard variant="elevated" className="overflow-hidden">
            <div className="divide-y divide-border">
              {[
                { label: 'Tithi', value: todayPanchang.tithi.name, end: todayPanchang.tithi.end },
                { label: 'Nakshatra', value: todayPanchang.nakshatra.name, end: todayPanchang.nakshatra.end },
                { label: 'Yoga', value: todayPanchang.yoga.name, end: todayPanchang.yoga.end },
                { label: 'Karana', value: todayPanchang.karana.name, end: todayPanchang.karana.end },
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
          <p className="text-lg font-bold text-accent">{todayPanchang.abhijit}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Best time for starting important tasks
          </p>
        </SpiritualCard>
      </main>
    </motion.div>
  );
};

export default Panchang;
