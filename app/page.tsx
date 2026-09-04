import { GridField } from '@/components/site/grid-field';
import { StatusBar } from '@/components/site/status-bar';
import { Hero } from '@/components/site/hero';
import { SignalStrip } from '@/components/site/signal-strip';
import { Section } from '@/components/site/section';
import { DeploymentLog } from '@/components/site/deployment-log';
import { ServiceCatalog } from '@/components/site/service-catalog';
import { ArchitectureSection } from '@/components/site/architecture-section';
import { StackManifest } from '@/components/site/stack-manifest';
import { Credentials } from '@/components/site/credentials';
import { Contact } from '@/components/site/contact';
import { profile, projects } from '@/lib/data';

export default function Page() {
  return (
    <>
      {/* First focusable thing on the page. The status bar holds a logo link and
          six nav links, so without this every keyboard pass starts by walking
          past all of them. */}
      <a
        href="#systems"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-sodium focus:bg-void focus:px-3 focus:py-2 focus:font-mono focus:text-[0.8rem] focus:text-ink"
      >
        Skip to the systems
      </a>

      <GridField />
      <StatusBar />

      <main>
        <Hero />
        <SignalStrip />

        <Section
          id="experience"
          path="/experience"
          title="Where the work happened"
          lede="Two roles, both spent building retrieval and agent systems that other people depend on. The lines below are things that shipped, not responsibilities."
        >
          <DeploymentLog />
        </Section>

        <Section
          id="systems"
          path="/systems"
          title="The systems"
          lede={`${projects.length} records. Open one and you get the whole account: what it does, how it is wired, the routes it exposes, and where it is still rough. Nothing here is a screenshot of a demo.`}
        >
          <ServiceCatalog />
        </Section>

        <Section
          id="architecture"
          path="/architecture"
          title="How they are wired"
          lede="Five topologies, drawn from the systems above. Each one is a different answer to a different constraint: a load balancer that must never expose a database, a retrieval path that has to stay grounded, an audio loop that has to stay under a second, an authorization server in front of a tool surface, and one webhook that serves many tenants."
        >
          <ArchitectureSection />
        </Section>

        <Section
          id="stack"
          path="/stack"
          title="What I reach for"
          lede="Grouped by the job it does rather than by how new it is. Most of this has been in production; the rest I have shipped at least once and would use again."
        >
          <StackManifest />
        </Section>

        <Section id="credentials" path="/credentials" title="Everything else">
          <Credentials />
        </Section>

        <Section
          id="contact"
          path="/contact"
          title="Talk to me about a system"
          lede="If you are building something that has to answer from real data and stay up while it does, that is the conversation I want."
        >
          <Contact />
        </Section>
      </main>

      <footer className="border-t border-rule px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[0.68rem] text-faint">
          <p>
            {profile.name} · {profile.degree}
          </p>
          <p>next.js · tailwind · motion · no trackers</p>
        </div>
      </footer>
    </>
  );
}
