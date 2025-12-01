import { AppPreview, LinkButton } from '@core/components';
import {
  BanknoteX,
  Camera,
  CheckCircle2,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Recycle,
  Search,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import Image from 'next/image';

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-3 items-center">
        <div className="md:col-span-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Find treasures in your neighborhood
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            One person&apos;s trash is another&apos;s treasure.{' '}
            <span className="text-primary">Curby helps you find it.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-prose mb-6 text-muted-foreground">
            The fastest way to discover and share free stuff in your neighborhood. No messaging. No scheduling. Just
            simple curbside pickup that keeps good stuff out of landfills.
          </p>

          <div className="flex flex-wrap gap-4">
            <LinkButton href="/app" variant="default" size="lg" className="text-base">
              Get Curby Free
            </LinkButton>
            <LinkButton href="#how-it-works" variant="outline" size="lg" className="text-base">
              See how it works
            </LinkButton>
          </div>

          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-primary">100% Free</div>
              <div className="text-sm text-muted-foreground">Always. Forever.</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-primary">No Hassle</div>
              <div className="text-sm text-muted-foreground">No messaging required</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-primary">Zero Waste</div>
              <div className="text-sm text-muted-foreground">Keep stuff in circulation</div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <div className="w-full rounded-2xl p-6 bg-card shadow-2xl border border-border">
            <div className="mb-4 text-sm text-muted-foreground font-medium">See it in action</div>
            <AppPreview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why neighbors love Curby</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for real people who want to share, save money, and keep their neighborhood clean.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
              <BanknoteX className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Completely Free</h3>
            <p className="text-muted-foreground">
              No fees, no subscriptions, no hidden costs. Post unlimited items and browse as much as you want.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Skip the Small Talk</h3>
            <p className="text-muted-foreground">
              No endless messaging back and forth. See it, want it, go get it. That&apos;s the Curby way.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hyper Local</h3>
            <p className="text-muted-foreground">
              Only see items actually near you, sorted by distance. No more driving across town for a maybe.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
            <p className="text-muted-foreground">
              Keep perfectly good stuff out of landfills. Every item reused is one less thing going to waste.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Community</h3>
            <p className="text-muted-foreground">
              Connect with neighbors and keep your community thriving. Good stuff stays local.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dead Simple</h3>
            <p className="text-muted-foreground">
              Snap a photo, add a title, hit post. Finding items is just as easy — scroll, tap, navigate.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Curby works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to start finding or sharing free stuff in your neighborhood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* For Finders */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <Search className="h-4 w-4" />
              For Finders
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Browse items near you</h3>
                <p className="text-muted-foreground">
                  Open the app and instantly see free items in your neighborhood, sorted by distance. Swipe through to
                  find your next treasure.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">See what you&apos;re getting</h3>
                <p className="text-muted-foreground">
                  View the photo, title, and exact location. Everything you need to know at a glance — what you see is
                  what you get.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Navigate and pick up</h3>
                <p className="text-muted-foreground">
                  Tap navigate to get directions. Head over and grab it from the curb. No scheduling, no waiting — just
                  go!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Mark it as taken</h3>
                <p className="text-muted-foreground">
                  After you pick it up, mark the item as taken in the app. This notifies the poster and keeps listings
                  accurate.
                </p>
              </div>
            </div>
          </div>

          {/* For Givers */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium">
              <Recycle className="h-4 w-4" />
              For Givers
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Put it on the curb</h3>
                <p className="text-muted-foreground">
                  Place your item curbside where it&apos;s visible and accessible. Make sure it&apos;s safe to pick up.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Snap and post</h3>
                <p className="text-muted-foreground">
                  Take a quick photo and add a title. That&apos;s it! Your item goes live instantly for neighbors to
                  see.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Confirm it&apos;s gone</h3>
                <p className="text-muted-foreground">
                  When someone marks your item as taken, you&apos;ll get notified. Confirm the pickup to complete the
                  cycle and keep the community running smoothly!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What neighbors are saying</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from people using Curby to connect and reduce waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <CheckCircle2 key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              &quot;Found an amazing desk for my home office! Would have cost hundreds new. Curby made it so easy — no
              awkward negotiations.&quot;
            </p>
            <div className="font-semibold">Sarah M.</div>
            <div className="text-sm text-muted-foreground">Portland, OR</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <CheckCircle2 key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              &quot;I posted a couch and it was gone in 20 minutes! So much better than dealing with flaky buyers on
              other apps.&quot;
            </p>
            <div className="font-semibold">Marcus T.</div>
            <div className="text-sm text-muted-foreground">Austin, TX</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <CheckCircle2 key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              &quot;Love that I can help reduce waste AND find cool stuff for free. This app gets neighborhood sharing
              right.&quot;
            </p>
            <div className="font-semibold">Jennifer L.</div>
            <div className="text-sm text-muted-foreground">Seattle, WA</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start finding treasures?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of neighbors who are saving money, reducing waste, and keeping good stuff in their community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LinkButton href="/app" variant="default" size="lg" className="text-base">
              Download Curby Now
            </LinkButton>
            <LinkButton href="#contact" variant="outline" size="lg" className="text-base">
              <MessageCircle className="h-5 w-5 mr-2" />
              Get in Touch
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support-us" className="max-w-5xl mx-auto px-6 py-20 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
              <Heart className="h-4 w-4 fill-current" />
              Support Curby
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Help us keep Curby free forever</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                Curby is built by a small team who believes in keeping neighborhoods connected and reducing waste — not
                in charging fees or bombarding you with ads.
              </p>
              <p>
                Your support helps cover server costs and fund development to keep Curby free for everyone. Every
                contribution, no matter how small, makes a real difference and reduces the need for ads.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Keep ads minimal</div>
                  <div className="text-sm text-muted-foreground">Help reduce reliance on advertising</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Fund new features</div>
                  <div className="text-sm text-muted-foreground">Help build better tools for your community</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Support indie development</div>
                  <div className="text-sm text-muted-foreground">Keep Curby independent and community-focused</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="rounded-2xl border border-border bg-card shadow-xl p-8 text-center flex flex-col items-center gap-6 max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary fill-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Buy us a coffee</h3>
                <p className="text-muted-foreground">
                  Show your appreciation for free, sustainable neighborhood sharing
                </p>
              </div>
              <a
                href="https://ko-fi.com/noahjamessmith"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white font-semibold transition-colors shadow-lg w-full"
              >
                <Image height={24} width={24} src="https://storage.ko-fi.com/cdn/logomarkLogo.png" alt="Ko-fi Logo" />
                Support on Ko-fi
              </a>
              <p className="text-xs text-muted-foreground">100% goes to keeping Curby running and improving</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
