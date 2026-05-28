import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of AlgoTrail.ai and its DSA roadmap tracking features.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-24">
      <h1 className="text-3xl font-extrabold tracking-tight text-forest-ink">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-forest-ink/50">
        Last updated: May 27, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-forest-ink/75">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using AlgoTrail.ai (&ldquo;the Service&rdquo;), you agree to be
            bound by these Terms of Service. If you do not agree, do not use the
            Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            AlgoTrail.ai is a data structures and algorithms study platform that
            provides a guided roadmap, progress tracking, AI-powered hints, and
            pattern-based learning to help developers prepare for technical
            interviews.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You must provide accurate information when creating an
            account and promptly update it if anything changes.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, scrape, or interfere with the Service</li>
            <li>Share your account with others or create multiple accounts</li>
            <li>Redistribute or resell content provided by the Service</li>
            <li>Upload malicious code or attempt to exploit vulnerabilities</li>
          </ul>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            All content, code templates, AI-generated explanations, and branding
            on AlgoTrail.ai are the property of AlgoTrail.ai or its licensors.
            You may use the content for personal study only. Problem descriptions
            sourced from LeetCode remain the property of LeetCode.
          </p>
        </Section>

        <Section title="6. AI-Generated Content">
          <p>
            The Service uses artificial intelligence to generate hints,
            explanations, and study paths. AI output is provided for educational
            purposes and may contain errors. You are responsible for verifying
            correctness before relying on it in any context outside of personal
            study.
          </p>
        </Section>

        <Section title="7. Availability &amp; Changes">
          <p>
            We strive to keep the Service available but do not guarantee
            uninterrupted access. We may modify, suspend, or discontinue
            features at any time. We will make reasonable efforts to notify you
            of material changes.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            AlgoTrail.ai is provided &ldquo;as is&rdquo; without warranties of any kind.
            To the fullest extent permitted by law, we shall not be liable for
            any indirect, incidental, or consequential damages arising from your
            use of the Service.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            We may suspend or terminate your access if you violate these Terms.
            You may delete your account at any time from the Settings page. Upon
            termination, your data will be deleted within 30 days.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these Terms? Reach out at{" "}
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
