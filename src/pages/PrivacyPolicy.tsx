import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualButton } from "@/components/ui/spiritual-button";

const PrivacyPolicy = () => {
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
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Privacy Policy</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
        <p className="text-sm text-muted-foreground">Last updated: February 17, 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly: name, email address, date of birth, time of birth, place of birth, gender, and relationship status. We also collect partner details if you use the compatibility feature. This data is essential for generating accurate astrological charts and readings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your information is used to: (a) generate personalized astrological charts and readings; (b) connect you with expert astrologers; (c) process wallet transactions; (d) improve our services; (e) send relevant notifications (with your consent); (f) provide customer support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. Data Storage & Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is stored securely using industry-standard encryption and security practices. We use secure cloud infrastructure with row-level security to ensure your data is only accessible to you. We do not store payment card details—all payment processing is handled by secure third-party providers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell your personal data to third parties. Your birth details may be shared with expert astrologers during consultations, solely for the purpose of providing readings. We may share anonymized, aggregated data for analytics and service improvement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            The App may use third-party services for analytics, authentication, and payment processing. These services have their own privacy policies. We use AI-powered features for generating readings, and your birth data may be processed by AI models to provide personalized insights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) delete your account and all associated data; (d) export your data; (e) withdraw consent for data processing; (f) opt out of marketing communications. You can exercise these rights through the Settings page or by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days. Anonymized analytics data may be retained indefinitely.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete such information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">9. Cookies & Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            The App uses local storage for session management and user preferences. We do not use third-party tracking cookies. Analytics data is collected in an anonymized manner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes through the App. Continued use of the App after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy-related inquiries, contact us at privacy@stellarapp.co.
          </p>
        </section>

        <div className="h-8" />
      </main>
    </motion.div>
  );
};

export default PrivacyPolicy;
