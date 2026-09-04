import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { defaultAgentAvatar } from "@/lib/constants";
import type { PropertyCardData } from "@/types/property";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const agent = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return {
    title: agent ? `${agent.name} - Agent` : "Agent",
    description: `View properties by agent ${agent?.name || ""}`,
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const agent = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      isAgentApproved: true,
      createdAt: true,
    },
  });

  if (!agent || !agent.isAgentApproved) {
    notFound();
  }

  const [properties, favoriteCount] = await Promise.all([
    prisma.property.findMany({
      where: { agentId: agent.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        listingType: true,
        propertyType: true,
        status: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        yearBuilt: true,
        furnished: true,
        parking: true,
        featured: true,
        createdAt: true,
        images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
        agent: {
          select: { id: true, name: true, avatar: true },
        },
      },
    }),
    prisma.favorite.count({ where: { property: { agentId: agent.id } } }),
  ]);

  const avatar = agent.avatar || defaultAgentAvatar;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 overflow-hidden rounded-2xl border bg-card">
        <div className="h-32 bg-gradient-to-r from-primary to-primary/70" />
        <div className="flex flex-col items-start gap-4 px-6 pb-6 sm:flex-row sm:items-center">
          <Avatar className="-mt-10 h-20 w-20 ring-4 ring-background">
            <AvatarImage src={avatar} alt={agent.name} />
            <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Badge variant="success" className="mr-1">Verified Agent</Badge>
              Member since {new Date(agent.createdAt).getFullYear()}
            </p>
            {agent.bio && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{agent.bio}</p>}
          </div>
          <div className="space-y-1 text-sm">
            {agent.phone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" /> {agent.phone}
              </p>
            )}
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" /> {agent.email}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Listings</h2>
        <span className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? "listing" : "listings"} • {favoriteCount} total saves
        </span>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No active listings from this agent right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p as unknown as PropertyCardData} />
          ))}
        </div>
      )}
    </div>
  );
}
