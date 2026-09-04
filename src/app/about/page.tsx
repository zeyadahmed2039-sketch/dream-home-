import type { Metadata } from "next";
import Image from "next/image";
import { Building2, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { placeholders } from "@/lib/constants";

export const metadata: Metadata = { title: "About Us" };

const VALUES = [
  { icon: ShieldCheck, title: "Trust & Transparency", desc: "Every listing is verified. We're upfront about everything so you can make confident decisions." },
  { icon: Users, title: "Customer First", desc: "Our team is dedicated to understanding your goals and guiding you at every step." },
  { icon: Building2, title: "Extensive Portfolio", desc: "From starter homes to luxury estates, we cover a wide range of property types and locations." },
  { icon: HeartHandshake, title: "Local Expertise", desc: "Deep knowledge of neighborhoods gives you a real edge whether buying, selling or renting." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">About Dream Home Online</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We&apos;re on a mission to make finding and selling your dream home
            simple, transparent and rewarding.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <Image src={placeholders.about} alt="About Dream Home Online" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Our Story</h2>
          <p className="mt-4 text-muted-foreground">
            Founded with a simple idea — that finding a home shouldn&apos;t be
            stressful. We built a platform that connects buyers, renters and
            agents with verified listings, powerful search and seamless tools to
            schedule viewings and ask questions.
          </p>
          <p className="mt-4 text-muted-foreground">
            Today, thousands of people across major cities trust Dream Home
            Online to help them find where they belong. Whether you&apos;re buying
            your first home, selling a family property or renting in a new city,
            we&apos;re here to help you every step of the way.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border bg-card p-6 text-center">
                <v.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
