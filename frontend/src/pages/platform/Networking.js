import React from 'react';
import PlatformHero from '../../components/platform/PlatformHero';
import ArchitectureSection from '../../components/platform/ArchitectureSection';
import CardGrid from '../../components/platform/CardGrid';
import ScenarioBlock from '../../components/platform/ScenarioBlock';
import ComplianceSection from '../../components/platform/ComplianceSection';
import PlatformCTA from '../../components/platform/PlatformCTA';
import content from '../../data/networking.json';

// Platform — Networking page
// Route: /platform/networking
const Networking = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* S1 — Hero */}
    <PlatformHero
      eyebrow={content.hero.eyebrow}
      title={content.hero.title}
      subtitle={content.hero.subtitle}
      bullets={content.hero.bullets}
    />

    <hr className="gsw-divider" />

    {/* S2 — Architecture */}
    <ArchitectureSection
      eyebrow={content.architecture.eyebrow}
      title={content.architecture.title}
      description={content.architecture.description}
      subsections={content.architecture.subsections}
    />

    <hr className="gsw-divider" />

    {/* S3 — Developer Practices */}
    <CardGrid
      eyebrow={content.devPractices.eyebrow}
      title={content.devPractices.title}
      description={content.devPractices.description}
      cards={content.devPractices.cards}
    />

    <hr className="gsw-divider" />

    {/* S4 — Use Cases */}
    <ScenarioBlock
      eyebrow={content.useCases.eyebrow}
      title={content.useCases.title}
      description={content.useCases.description}
      scenarios={content.useCases.scenarios}
    />

    <hr className="gsw-divider" />

    {/* S5 — Standards & Compliance */}
    <ComplianceSection
      eyebrow={content.compliance.eyebrow}
      title={content.compliance.title}
      description={content.compliance.description}
      items={content.compliance.items}
    />

    {/* S6 — CTA */}
    <PlatformCTA
      eyebrow={content.cta.eyebrow}
      title={content.cta.title}
      description={content.cta.description}
      links={content.cta.links}
    />

  </div>
);

export default Networking;
