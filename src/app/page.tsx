import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  ShieldCheck,
  Handshake,
  Building2,
  MapPin,
  ArrowRight,
  Star,
} from "lucide-react";
import { getHomeData } from "@/lib/home";
import { SearchBar } from "@/components/search-bar";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PropertyCardData } from "@/types/property";

const heroImage =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80";

const STATS = [
  { value: "25K+", label: "Properties Listed" },
  { value: "1.2K+", label: "Trusted Agents" },
  { value: "50+", label: "Cities Covered" },
  { value: "99%", label: "Satisfied Clients" },
];

const FEATURES = [
  {
    icon: Home,
    title: "Wide Property Selection",
    desc: "Browse homes, apartments, villas and commercial spaces across top neighborhoods.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every property is reviewed and verified by our team to ensure accuracy and safety.",
  },
  {
    icon: Handshake,
    title: "Trusted Agents",
    desc: "Work with vetted, licensed agents who understand your needs and local market.",
  },
  {
    icon: Building2,
    title: "Easy Booking",
    desc: "Schedule viewings and send inquiries instantly with our streamlined tools.",
  },
];

const TESTIMONIALS = [
  {
    name: "Aisha Rahman",
    role: "Bought a home in Austin",
    quote:
      "Dream Home Online made finding and buying our first home effortless. The filters were precise and the agent was fantastic.",
    rating: 5,
  },
  {
    name: "Daniel Kim",
    role: "Rented an apartment in Seattle",
    quote:
      "I love how easy it is to schedule viewings. Found a beautiful apartment within a week of moving to the city.",
    rating: 5,
  },
  {
    name: "Marco Delgado",
    role: "Sold his villa in Miami",
    quote:
      "As a seller, the dashboard and stats helped me understand demand. My villa sold in just 12 days above asking.",
    rating: 5,
  },
];

export const metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <HomeData />
    </div>
  );
}

async function HomeData() {
  const data = await getHomeData();

  return (
    <>
      <section className="container mx-auto px-4 py-12">
        <SectionHeader
          title="Featured Properties"
          subtitle="Hand-picked properties our team has highlighted for you."
          href="/properties"
          linkText="View all properties"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {data.featured.map((p) => (
            <PropertyCard key={p.id} property={p as PropertyCardData} />
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Latest Listings"
            subtitle="Freshly added properties, don't miss out."
            href="/properties?sort=newest"
            linkText="See the latest"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {data.latest.map((p) => (
              <PropertyCard key={p.id} property={p as PropertyCardData} />
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <SectionHeader
          title="Explore Popular Locations"
          subtitle="Discover properties in the most sought-after cities."
          href="/properties"
          linkText="Search all cities"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {data.cityCounts.map((c) => (
            <Link
              key={c.city}
              href={`/properties?city=${encodeURIComponent(c.city)}`}
              className="group rounded-xl border bg-card p-5 text-center transition hover:border-primary hover:shadow-md"
            >
              <MapPin className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="font-semibold group-hover:text-primary">{c.city}</p>
              <p className="text-sm text-muted-foreground">
                {c.count} properties
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Why Choose Dream Home Online
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-6 transition hover:shadow-md"
              >
                <f.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            What Our Clients Say
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border bg-card p-6 transition hover:shadow-md"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground">
          <div className="relative z-10">
            <h2 className="mb-3 text-3xl font-bold">
              Ready to Find Your Dream Home?
            </h2>
            <p className="mx-auto mb-6 max-w-xl text-primary-foreground/80">
              Join thousands of happy homeowners and renters. Start your search
              today or list your property with us.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary" size="lg">
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link href="/agent">Become an Agent</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HomeHero() {
  return (
    <section className="relative">
      <div className="relative h-[520px] overflow-hidden">
        <Image
          src={heroImage}
          alt="Modern home exterior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white backdrop-blur">
            <Search className="mr-1 h-3.5 w-3.5" /> Your trusted property marketplace
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Find Your Dream Home, Easier Than Ever
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">
            Browse buying, selling and renting options across thousands of
            verified properties in top cities.
          </p>
          <div className="mt-8 w-full max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkText,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {linkText} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
