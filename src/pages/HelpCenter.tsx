import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, MessageCircle, Mail, Search, Sparkles, CreditCard, Shield, Users, BookOpen, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  icon: typeof HelpCircle;
  title: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    icon: Sparkles,
    title: "Getting Started",
    items: [
      {
        q: "How do I create my Kundli?",
        a: "Navigate to 'My Kundli' from the home screen. Enter your birth date, time, and place. Our system instantly generates your complete Vedic birth chart with planetary positions, house placements, and detailed analysis — all for free."
      },
      {
        q: "Do I need to know my exact birth time?",
        a: "While an exact birth time gives the most accurate chart, you can still get a reading with an approximate time. During onboarding, you can indicate how exact your birth time is, and our system adjusts the analysis accordingly."
      },
      {
        q: "What features are completely free?",
        a: "AI Kundli Analysis, Daily Horoscope, Palm Reading, Guna Milan (compatibility matching), and Panchang are all completely free with no credit charges. Credits are only used for live expert consultations."
      },
    ],
  },
  {
    icon: Users,
    title: "Expert Consultations",
    items: [
      {
        q: "How do I talk to an astrologer?",
        a: "Go to 'Talk to Jotshi' from the home screen. Browse our verified experts, check their specialties, ratings, and availability. You can start a chat or voice call instantly when an expert is online."
      },
      {
        q: "What's the difference between Chat and Call?",
        a: "Chat lets you type messages back and forth with an expert — great for detailed questions. Call connects you via voice for a more personal, real-time conversation. Both use credits from your balance."
      },
      {
        q: "How are experts verified?",
        a: "All experts go through a thorough verification process. We review their credentials, experience, and specialty knowledge. Only approved experts can offer consultations on our platform."
      },
      {
        q: "Can I choose a specific expert?",
        a: "Yes! Browse experts by category (Astrologer, Palmist, Relationship, Guru), check their ratings, experience years, languages spoken, and specialties before starting a session."
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Credits & Subscriptions",
    items: [
      {
        q: "How do credits work?",
        a: "Credits are the in-app currency for expert consultations. You receive free credits monthly with your plan, and can purchase additional credits anytime. AI features like Kundli, Horoscope, and Palm Reading don't use credits."
      },
      {
        q: "What subscription plans are available?",
        a: "We offer three plans: Free (100 credits/month), Pro ($9.99/month with 1,500 credits), and Premium ($24.99/month with 5,000 credits). Higher plans also offer better consultation rates."
      },
      {
        q: "How do I buy more credits?",
        a: "Go to your Wallet and tap 'Top Up Credits', or visit the Pricing page. Credit packs are available as one-time purchases through the App Store, and most packs include bonus credits."
      },
      {
        q: "Do unused credits expire?",
        a: "No, your credits never expire. They stay in your balance until you use them for expert consultations."
      },
      {
        q: "How do I cancel my subscription?",
        a: "Subscriptions are managed through the App Store. Go to your device Settings → Apple ID → Subscriptions, find AstroGuru, and tap Cancel. Your benefits continue until the end of the billing period."
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Features & Services",
    items: [
      {
        q: "How does Palm Reading work?",
        a: "Upload a clear, well-lit photo of your palm. Our AI analyzes your lines (life, heart, head, fate), mounts, and markings to provide a comprehensive reading including personality traits, career guidance, and relationship outlook."
      },
      {
        q: "What is Guna Milan?",
        a: "Guna Milan is the traditional Vedic compatibility matching system. It evaluates 36 Gunas (qualities) between two birth charts across 8 categories (Ashtakoota) to determine compatibility for marriage and partnership."
      },
      {
        q: "What is Panchang?",
        a: "Panchang is the Vedic almanac showing daily auspicious timings (Muhurta), Tithi, Nakshatra, Yoga, and Karana. It helps you plan important activities on favorable days and times."
      },
      {
        q: "How accurate are the AI readings?",
        a: "Our AI is trained on authentic Vedic astrology principles and provides detailed, personalized analysis. For the most nuanced interpretation, especially for life-changing decisions, we recommend consulting with a live expert."
      },
    ],
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    items: [
      {
        q: "Is my personal data safe?",
        a: "Absolutely. All data is encrypted in transit and at rest. We follow industry-standard security practices. Your birth details and consultation history are never shared with third parties."
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Settings and scroll to 'Delete Account'. This permanently removes all your data including profile, consultation history, wallet transactions, and stored readings. This action cannot be undone."
      },
      {
        q: "Who can see my consultation history?",
        a: "Only you can see your consultation history. Experts can only view session details for consultations they conducted with you. Admins may review data for quality assurance purposes."
      },
    ],
  },
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = searchQuery.trim()
    ? faqCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : activeCategory
    ? faqCategories.filter(cat => cat.title === activeCategory)
    : faqCategories;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Help Center</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveCategory(null);
            }}
            className="pl-11 h-12 text-base"
          />
        </div>

        {/* Category Chips */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {faqCategories.map((cat) => (
              <button
                key={cat.title}
                onClick={() => setActiveCategory(cat.title === activeCategory ? null : cat.title)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.title ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Sections */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            <p className="text-sm text-muted-foreground mt-1">Try different keywords or browse categories above</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <category.icon className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">{category.title}</h2>
              </div>
              <SpiritualCard variant="elevated" className="overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((faq, i) => (
                    <AccordionItem key={i} value={`${category.title}-${i}`} className="border-border">
                      <AccordionTrigger className="px-4 text-left text-sm font-medium hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </SpiritualCard>
            </section>
          ))
        )}

        {/* Contact Section */}
        <section className="space-y-3 pt-4">
          <h2 className="font-bold text-lg">Still need help?</h2>
          <div className="grid grid-cols-2 gap-3">
            <SpiritualCard
              variant="elevated"
              interactive
              className="p-4 text-center"
              onClick={() => {
                window.location.href = "mailto:support@astroguru.app";
              }}
            >
              <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">Email Us</p>
              <p className="text-xs text-muted-foreground mt-1">support@astroguru.app</p>
            </SpiritualCard>
            <SpiritualCard
              variant="elevated"
              interactive
              className="p-4 text-center"
              onClick={() => toast.info("Live chat coming soon!")}
            >
              <MessageCircle className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="font-medium text-sm">Live Chat</p>
              <p className="text-xs text-muted-foreground mt-1">Available 9am–9pm</p>
            </SpiritualCard>
          </div>
        </section>

        <div className="h-8" />
      </main>
    </motion.div>
  );
};

export default HelpCenter;
