import { motion } from "framer-motion";
import { ArrowLeft, LifeBuoy, MessageCircle, Mail, Clock, HelpCircle, AlertTriangle, CreditCard, UserX, Shield, Smartphone, Star, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard } from "@/components/ui/spiritual-card";

const Support = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Support</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8 max-w-3xl">

        {/* Hero */}
        <section className="text-center space-y-3">
          <h1 className="text-2xl font-display font-bold">How can we help you?</h1>
          <p className="text-muted-foreground leading-relaxed">
            We're here to make your AstroGuru experience seamless. Browse common topics below or reach out to us directly.
          </p>
        </section>

        {/* Contact */}
        <SpiritualCard className="p-5 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> Contact Us</h2>
          <div className="space-y-2 text-muted-foreground leading-relaxed">
            <p><strong>Email:</strong> support@astroguru.app</p>
            <p><strong>Response Time:</strong> We aim to respond within 24 hours on business days.</p>
            <p><strong>Hours:</strong> Monday – Saturday, 9:00 AM – 9:00 PM IST</p>
            <p>For urgent billing or account issues, please include your registered email address and a detailed description of the problem.</p>
          </div>
        </SpiritualCard>

        {/* FAQ Sections */}
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold">Frequently Asked Questions</h2>

          {/* Account & Auth */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><UserX className="w-5 h-5 text-primary" /> Account & Authentication</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p className="font-semibold text-foreground">How do I create an account?</p>
                <p>Tap "Sign Up" on the login screen and enter your email address and a password. You'll receive a verification email — tap the link to activate your account. Once verified you can complete the onboarding wizard with your birth details.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">I didn't receive the verification email.</p>
                <p>Check your spam/junk folder. If it's not there, return to the login screen and tap "Resend verification email." Make sure you entered the correct email address during sign-up.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I reset my password?</p>
                <p>On the login screen, tap "Forgot Password?" and enter your registered email. You'll receive a password-reset link. The link expires after 1 hour.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I delete my account?</p>
                <p>Go to Settings → Delete Account. This permanently removes all your personal data, consultation history, wallet balance, and stored readings. This action is irreversible and takes effect immediately.</p>
              </div>
            </div>
          </div>

          {/* Subscriptions & Billing */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Subscriptions & Billing</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p className="font-semibold text-foreground">What subscription plans are available?</p>
                <p><strong>Free:</strong> 100 credits/month with access to all AI features. <strong>Pro ($9.99/mo):</strong> 1,500 credits, reduced consultation rates. <strong>Premium ($24.99/mo):</strong> 5,000 credits, lowest consultation rates, priority support.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I manage or cancel my subscription?</p>
                <p>Subscriptions are managed through the Apple App Store. Go to your iPhone's Settings → Apple ID → Subscriptions → AstroGuru. You can change plans or cancel from there. Cancellations take effect at the end of the current billing period.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I restore my purchases on a new device?</p>
                <p>Go to Settings → Restore Purchases. This will sync your active subscription and any previously purchased credit packs with your current device.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I request a refund?</p>
                <p>Since all purchases go through the Apple App Store, refund requests must be submitted to Apple directly. Visit <strong>reportaproblem.apple.com</strong> and select the relevant transaction. We cannot process refunds on Apple's behalf.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">What are credits and how are they used?</p>
                <p>Credits are the in-app currency for expert consultations. Chat sessions cost credits based on message length (tokens), and voice calls cost credits per minute. AI-powered features like Kundli Analysis, Daily Horoscope, Palm Reading, and Guna Milan are free and do not consume credits.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Can I buy credits without a subscription?</p>
                <p>Yes. Credit top-up packs are available as one-time purchases. Some packs include bonus credits. Go to the Wallet page to view available packs.</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> App Features</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p className="font-semibold text-foreground">What is Kundli Analysis?</p>
                <p>Kundli (birth chart) analysis uses your exact date, time, and place of birth to generate a Vedic astrological chart. The AI analyzes planetary positions, houses, dashas, and yogas to provide personalized life insights. This feature is free for all users.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How does Palm Reading work?</p>
                <p>Take a clear photo of your palm using the in-app camera. Our AI analyzes the major lines (heart, head, life, fate) and mounts to provide a detailed reading. Ensure good lighting and a flat palm for best results.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">What is Guna Milan (Compatibility)?</p>
                <p>Guna Milan is a traditional Vedic compatibility analysis that compares two birth charts across 8 categories (Ashta Koot) totaling 36 points. It evaluates compatibility for marriage and partnerships based on Nakshatras.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How accurate are the AI readings?</p>
                <p>Our AI is trained on authentic Vedic astrology principles and provides readings consistent with traditional methods. However, all readings are for informational and entertainment purposes and should not replace professional advice for medical, legal, or financial matters.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">What is the Daily Horoscope based on?</p>
                <p>The Daily Horoscope is generated based on your Moon sign (Rashi) derived from your birth details, taking into account current planetary transits and Nakshatras.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">What is Panchang?</p>
                <p>Panchang is the Vedic Hindu calendar that provides daily information including Tithi (lunar day), Nakshatra (star), Yoga, Karana, and auspicious/inauspicious timings (Muhurta). It helps plan important activities.</p>
              </div>
            </div>
          </div>

          {/* Expert Consultations */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" /> Expert Consultations</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p className="font-semibold text-foreground">Who are the experts (Jotshis)?</p>
                <p>Our experts are AI-powered astrologers with distinct specialties — Vedic astrology, numerology, palmistry, relationship guidance, and spiritual counseling. Each expert has a unique personality and consultation style.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do chat consultations work?</p>
                <p>Select an expert from the Explore page, start a chat, and type your questions. Credits are deducted based on the volume of conversation. Rates depend on your subscription tier.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do voice call consultations work?</p>
                <p>Tap the call button on any expert's profile. Calls are billed per minute. Make sure your microphone permission is enabled. Partial minutes are rounded up.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">What if I run out of credits during a session?</p>
                <p>You'll be notified when your credit balance is low. If credits run out mid-session, the session will end. You can purchase more credits from the Wallet page and start a new session.</p>
              </div>
            </div>
          </div>

          {/* Technical */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><Smartphone className="w-5 h-5 text-primary" /> Technical Issues</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p className="font-semibold text-foreground">The app is crashing or not loading.</p>
                <p>Try force-closing and reopening the app. Make sure you're running the latest version from the App Store. If the problem persists, restart your device and try again. Contact support if the issue continues.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">My Kundli chart is not generating.</p>
                <p>Ensure your birth details (date, time, and place) are complete and accurate. The place of birth must be a recognized city or town. If the time of birth is unknown, select "Approximate" during onboarding.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Palm reading camera is not working.</p>
                <p>Go to your iPhone's Settings → AstroGuru → Camera and ensure permission is enabled. Make sure no other app is using the camera.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Push notifications are not arriving.</p>
                <p>Go to your iPhone's Settings → Notifications → AstroGuru and ensure notifications are allowed. Also check that "Do Not Disturb" is not enabled.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Voice calls have no audio.</p>
                <p>Make sure microphone permission is granted (Settings → AstroGuru → Microphone). Check that your device is not on silent mode and the volume is turned up. Try using earphones if the issue persists.</p>
              </div>
            </div>
          </div>

          {/* Privacy & Safety */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Privacy & Safety</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p className="font-semibold text-foreground">Is my birth data safe?</p>
                <p>Yes. All personal data is encrypted and stored with row-level security, meaning only you can access your own data. We do not sell personal information to third parties. See our <button onClick={() => navigate('/privacy-policy')} className="text-primary underline">Privacy Policy</button> for full details.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I report inappropriate content?</p>
                <p>If you encounter any inappropriate content or behavior, email us at support@astroguru.app with details including screenshots if possible. We take all reports seriously and will investigate promptly.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Can I export my data?</p>
                <p>Yes. You can request a copy of all your stored data by contacting support@astroguru.app. We will provide your data within 30 days of the request.</p>
              </div>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <SpiritualCard className="p-5 space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> System Requirements</h2>
          <div className="text-muted-foreground leading-relaxed space-y-1">
            <p><strong>Platform:</strong> iOS 15.0 or later</p>
            <p><strong>Devices:</strong> iPhone, iPad</p>
            <p><strong>Internet:</strong> Active internet connection required for all features</p>
            <p><strong>Permissions:</strong> Camera (palm reading), Microphone (voice calls), Notifications (optional)</p>
          </div>
        </SpiritualCard>

        {/* Still Need Help */}
        <SpiritualCard className="p-5 space-y-3 text-center">
          <h2 className="text-lg font-bold">Still need help?</h2>
          <p className="text-muted-foreground">Email us at <strong>support@astroguru.app</strong> with your issue and we'll get back to you within 24 hours.</p>
        </SpiritualCard>

        <div className="h-8" />
      </main>
    </motion.div>
  );
};

export default Support;
