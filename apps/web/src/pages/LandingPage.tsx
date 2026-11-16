import React, { useEffect } from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingMetrics } from "../components/landing/LandingMetrics";
import { LandingBentoGrid } from "../components/landing/LandingBentoGrid";
import { LandingPlayground } from "../components/landing/LandingPlayground";
import { LandingCodeShowcase } from "../components/landing/LandingCodeShowcase";
import { LandingComparisonTable } from "../components/landing/LandingComparisonTable";
import { LandingTestimonials } from "../components/landing/LandingTestimonials";
import { LandingPricing } from "../components/landing/LandingPricing";
import { LandingFAQ } from "../components/landing/LandingFAQ";
import { LandingCTA } from "../components/landing/LandingCTA";
import { LandingFooter } from "../components/landing/LandingFooter";

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Set document title for high SEO and clear branding
    document.title = "NeuralDesk — Autonomous Multi-Agent DAG Orchestration Engine";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-charcoal-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Floating Header */}
      <LandingNavbar />

      {/* Hero Section with Interactive Live Canvas Simulator */}
      <LandingHero />

      {/* Production Scale Metrics Strip */}
      <LandingMetrics />

      {/* Bento Grid Architecture Showcase */}
      <LandingBentoGrid />

      {/* Interactive Workflow Playground (Lead Scoring, SecOps, HITL) */}
      <LandingPlayground />

      {/* Developer-First Code & API Showcase */}
      <LandingCodeShowcase />

      {/* Architectural Comparison Matrix */}
      <LandingComparisonTable />

      {/* Customer Proof & Testimonials */}
      <LandingTestimonials />

      {/* Transparent Developer & Team Pricing */}
      <LandingPricing />

      {/* Interactive FAQ Accordion */}
      <LandingFAQ />

      {/* Pre-Footer Conversion Call-to-Action */}
      <LandingCTA />

      {/* Comprehensive Enterprise Footer */}
      <LandingFooter />
    </div>
  );
};