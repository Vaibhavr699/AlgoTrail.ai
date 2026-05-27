import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — AlgoTrail.ai",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-24">
      <h1 className="text-3xl font-extrabold tracking-tight text-forest-ink">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-forest-ink/50">
        Last updated: May 27, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-forest-ink/75">
        <Section title="1. Information We Collect">
          <p className="font-medium text-forest-ink/85">Account Information</p>
          <p>
            When you create an account, we collect your name, email address, and
            profile picture (if you sign in via Google or GitHub). Passwords are
            hashed and never stored in plain text.
          </p>
          <p className="mt-3 font-medium text-forest-ink/85">Usage Data</p>
          <p>
            We collect data about how you use the Service, including problems
            solved, time spent, streaks, notes, and AI interactions. This powers
            your dashboard, progress tracking, and personalized suggestions.
          </p>
          <p className="mt-3 font-medium text-forest-ink/85">Technical Data</p>
          <p>
            We automatically collect browser type, device information, IP
            address, and pages visited for analytics and security purposes.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and personalize the Service (roadmap, AI hints, stats)</li>
            <li>Track your progress and maintain your streak</li>
            <li>Generate AI-powered hints and explanations tailored to your level</li>
            <li>Send essential account emails (password reset, security alerts)</li>
            <li>Improve the Service through aggregated, anonymized analytics</li>
          </ul>
        </Section>

        <Section title="3. Information Sharing">
          <p>
            We do not sell your personal information. We share data only in these
            cases:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Service providers:</strong> hosting (Vercel/Render), database
              (Neon), and AI (OpenAI) — only the minimum data needed to operate
            </li>
            <li>
              <strong>Legal requirements:</strong> if required by law or to protect
              rights and safety
            </li>
          </ul>
        </Section>

        <Section title="4. AI &amp; Third-Party Services">
          <p>
            When you use AI features (hints, explanations, pattern lessons), your
            question context is sent to OpenAI for processing. We do not send
            your personal information — only the problem context needed to
            generate a response. OpenAI&apos;s usage policies apply to their
            processing.
          </p>
        </Section>

        <Section title="5. Data Storage &amp; Security">
          <p>
            Your data is stored in a PostgreSQL database hosted on Neon with
            encryption at rest and in transit. We use industry-standard security
            measures including HTTPS, hashed passwords, and secure session
            tokens. No system is 100% secure, but we take reasonable steps to
            protect your data.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Access your personal data from the Settings page</li>
            <li>Update or correct your account information</li>
            <li>Export your progress and notes data</li>
            <li>Delete your account and all associated data</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, visit Settings or email us at{" "}
            <a
              href="mailto:support@algotrail.ai"
              className="font-medium text-forest-600 hover:text-forest-700"
            >
              support@algotrail.ai
            </a>
            .
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use essential cookies for authentication and session management.
            We do not use advertising or third-party tracking cookies. Analytics
            cookies (if used) are anonymized and can be disabled in your browser.
          </p>
        </Section>

        <Section title="8. Data Retention">
          <p>
            We retain your data for as long as your account is active. When you
            delete your account, all personal data is permanently removed within
            30 days. Anonymized, aggregated data may be retained for analytics.
          </p>
        </Section>

        <Section title="9. Children&apos;s Privacy">
          <p>
            AlgoTrail.ai is not intended for children under 13. We do not
            knowingly collect personal information from children. If you believe
            a child has provided us with personal data, please contact us.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by email or a notice on the Service. Your
            continued use after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions or concerns? Email us at{" "}
            <a
              href="mailto:support@algotrail.ai"
              className="font-medium text-forest-600 hover:text-forest-700"
            >
              support@algotrail.ai
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-bold text-forest-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
