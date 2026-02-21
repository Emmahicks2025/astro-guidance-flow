import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualButton } from "@/components/ui/spiritual-button";

const TermsAndConditions = () => {
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
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Terms & Conditions</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
        <p className="text-sm text-muted-foreground">Last updated: February 17, 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By downloading, installing, or using the Stellar application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree, do not use the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Stellar provides Vedic astrology consultations, kundli generation, horoscope readings, compatibility analysis, palm reading, panchang information, and related spiritual services. The App connects users with astrology experts ("Jotshis") for personalized consultations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate, current, and complete information during registration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Disclaimer of Accuracy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Astrological readings, predictions, and advice provided through the App are for entertainment and informational purposes only. Stellar does not guarantee the accuracy, reliability, or completeness of any astrological information. Readings should not be used as a substitute for professional medical, legal, financial, or psychological advice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Subscriptions & In-App Purchases</h2>
          <p className="text-muted-foreground leading-relaxed">
            The App offers subscription plans and credit top-up packs, all processed exclusively through the Apple App Store. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. You can manage or cancel subscriptions in your device's App Store settings.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Subscription Tiers:</strong> Free (100 credits/month), Pro ($9.99/month, 1,500 credits), and Premium ($24.99/month, 5,000 credits). Pricing and credit allocations are subject to change with notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Credits, Billing & Usage Rates</h2>
          <p className="text-muted-foreground leading-relaxed">
            Credits are the in-app currency used for expert consultations. Free AI-powered features (Kundli Analysis, Daily Horoscope, Palm Reading, Guna Milan) do not consume credits.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Chat Consultations:</strong> Chat sessions with experts are billed based on the volume of conversation (measured in tokens — units of text processed). The credit cost is calculated at 250% of the underlying AI processing cost. Rates vary by subscription tier: Free plan (1 credit per 1,000 tokens), Pro plan (0.8 credits per 1,000 tokens), Premium plan (0.6 credits per 1,000 tokens). A typical chat message consumes approximately 200–500 tokens.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Call Consultations:</strong> Voice call sessions are billed per minute of active call time. Rates vary by subscription tier: Free plan (12 credits/minute), Pro plan (10 credits/minute), Premium plan (8 credits/minute). Partial minutes are rounded up to the next full minute.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Credit Top-Ups:</strong> Additional credits can be purchased as one-time in-app purchases. Top-up packs may include bonus credits as indicated at the time of purchase. Credits do not expire but are non-refundable and non-transferable.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Rate Changes:</strong> We reserve the right to adjust credit rates, subscription pricing, and top-up pack offerings at any time. Users will be notified of material changes in advance. Active subscriptions will not be affected until their next renewal cycle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. User Conduct</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to: (a) use the App for any unlawful purpose; (b) harass, abuse, or threaten other users or experts; (c) impersonate any person or entity; (d) upload harmful content or malware; (e) attempt to gain unauthorized access to the App's systems; (f) use the App to send spam or unsolicited communications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content, trademarks, logos, and intellectual property within the App are owned by Stellar or its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">9. Account Deletion</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may delete your account at any time through the Settings page. Upon deletion, all personal data associated with your account will be permanently removed, including profile information, consultation history, wallet transactions, and any other stored data. This action is irreversible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">10. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Stellar shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App or any decisions made based on astrological readings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">11. Modifications to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the updated Terms. We will notify users of significant changes through the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">12. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">13. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about these Terms, please contact us at support@stellarapp.co.
          </p>
        </section>

        <div className="h-8" />
      </main>
    </motion.div>
  );
};

export default TermsAndConditions;
