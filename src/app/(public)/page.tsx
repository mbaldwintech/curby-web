import { LinkButton } from '@common/components';
import { LogoHorizontal } from '@core/components';

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <section className="max-w-7xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Curby — find, give, and discover free local treasures
          </h1>
          <p className="text-lg max-w-prose mb-6 text-secondary-foreground">
            Curby helps your neighborhood find new homes for items — no fees, no fuss. Snap a photo, add a short note,
            and your item is visible to local folks nearby. Built for low friction, high joy.
          </p>

          <div className="flex flex-wrap gap-4">
            <LinkButton href="/app" variant="default" size="lg">
              Get the app
            </LinkButton>
            <LinkButton href="#features" variant="outline" size="lg">
              Learn more
            </LinkButton>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3">
            <li className="inline-flex items-start gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-muted text-muted-foreground font-semibold">
                🏷️
              </span>
              <div>
                <div className="font-semibold">Local-first listings</div>
                <div className="text-sm text-secondary-foreground">See items near you and claim them quickly.</div>
              </div>
            </li>
            <li className="inline-flex items-start gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-muted text-muted-foreground font-semibold">
                ⚡
              </span>
              <div>
                <div className="font-semibold">Fast & anonymous</div>
                <div className="text-sm text-secondary-foreground">
                  No accounts required to browse — post if you want the credit.
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl p-6 bg-card shadow-lg">
            <div className="mb-4 text-sm text-muted-foreground">Preview</div>
            <div className="h-80 flex items-center justify-center rounded-lg border border-border overflow-hidden bg-background">
              <LogoHorizontal className="h-32 w-auto" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Local Feed"
            desc="Curated by location and freshness so you see the best nearby finds."
            emoji="📍"
          />
          <FeatureCard
            title="Safe & Simple"
            desc="Flag/report moderation and quick mark-taken behavior keeps things tidy."
            emoji="🛡️"
          />
          <FeatureCard
            title="For People & Businesses"
            desc="Businesses can post promos; people can claim free items."
            emoji="🏬"
          />
        </div>
      </section>

      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-6">A plan for every neighborhood</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard
            name="Free"
            price="$0"
            bullets={['Browse listings', 'Post free items', 'Community moderation']}
          />
          <PricingCard
            name="Curby Pro (Businesses)"
            price="$9/mo"
            bullets={['Promote listings', 'Analytics dashboard', 'Priority support']}
            highlight
          />
          <PricingCard
            name="Enterprise"
            price="Contact"
            bullets={['Bulk postings', 'Custom integrations', 'Dedicated support']}
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, emoji }: { title: string; desc: string; emoji: string }) {
  return (
    <div className="rounded-xl p-6 bg-card border border-border">
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm text-secondary-foreground mt-2">{desc}</div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  bullets,
  highlight
}: {
  name: string;
  price: string;
  bullets: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-6 border ${highlight ? 'border-sidebar-ring scale-102 shadow-lg' : 'border-border'} bg-card`}
    >
      <div className="flex items-baseline justify-between gap-6">
        <div className="text-lg font-semibold">{name}</div>
        <div className="text-2xl font-extrabold">{price}</div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-secondary-foreground">
        {bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
      <div className="mt-6">
        <a
          className={`inline-block px-4 py-2 rounded-lg ${highlight ? 'bg-primary text-primary-foreground' : 'border border-border'}`}
          href="#"
        >
          Choose
        </a>
      </div>
    </div>
  );
}
