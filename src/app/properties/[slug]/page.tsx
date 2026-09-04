import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Calendar,
  Car,
  Sofa,
  Building2,
  Check,
  Phone,
  Mail,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PropertyGallery } from "@/components/property/gallery";
import { ContactAgentForm } from "@/components/property/contact-agent-form";
import { ScheduleViewing } from "@/components/property/schedule-viewing";
import { FavoriteButton } from "@/components/favorite-button";
import { ReportPropertyDialog } from "@/components/property/report-property";
import {
  getPropertyBySlug,
  getSimilarProperties,
} from "@/services/properties";
import { getFavoriteIds } from "@/services/favorites";
import { getSession } from "@/lib/session";
import { formatCurrency, getInitials } from "@/lib/utils";
import { PROPERTY_TYPES, appUrl } from "@/lib/constants";
import type { PropertyCardData } from "@/types/property";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) return { title: "Property Not Found" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: [{ url: property.images?.[0]?.url || "" }],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isOwnerAgent = session?.user?.id === property.agentId;
  const canView = property.status === "ACTIVE" || isAdmin || isOwnerAgent;

  if (!canView) notFound();

  // Increment view count (fire and forget)
  if (property.status === "ACTIVE") {
    fetch(`${appUrl}/api/properties/${property.id}/view`, {
      method: "POST",
    }).catch(() => {});
  }

  const [favoriteIds, similar] = await Promise.all([
    session?.user ? getFavoriteIds(session.user.id) : Promise.resolve([]),
    property.status === "ACTIVE"
      ? getSimilarProperties(property.id, property.city, property.propertyType)
      : Promise.resolve([]),
  ]);

  const isFav = favoriteIds.includes(property.id);
  const images = property.images.map((i) => i.url);
  const typeLabel = PROPERTY_TYPES.find(
    (t) => t.value === property.propertyType
  )?.label;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/properties" className="hover:text-primary">
          Properties
        </Link>{" "}
        / <span className="text-foreground">{property.title}</span>
      </div>

      {/* Header row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge
              variant={property.listingType === "SALE" ? "default" : "success"}
            >
              {property.listingType === "SALE" ? "For Sale" : "For Rent"}
            </Badge>
            {property.status !== "ACTIVE" && <Badge variant="warning">{property.status}</Badge>}
            {typeLabel && <Badge variant="secondary">{typeLabel}</Badge>}
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.address}, {property.city}, {property.state},{" "}
            {property.country}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(property.price)}
            {property.listingType === "RENT" && (
              <span className="text-base font-normal"> /mo</span>
            )}
          </p>
          <div className="flex gap-2">
            <FavoriteButton propertyId={property.id} defaultFavorite={isFav} />
            <Button
              variant="outline"
              size="icon"
              aria-label="Share"
              onClick={() => {
                if (navigator.share) navigator.share({ title: property.title, url: window.location.href });
                else navigator.clipboard?.writeText(window.location.href);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <ReportPropertyDialog propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>
      </div>

      {/* Gallery */}
      <PropertyGallery images={images} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-8">
          {/* Key specs */}
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-5">
              <Spec
                icon={<BedDouble className="h-5 w-5" />}
                label="Bedrooms"
                value={property.bedrooms.toString()}
              />
              <Spec
                icon={<Bath className="h-5 w-5" />}
                label="Bathrooms"
                value={property.bathrooms.toString()}
              />
              <Spec
                icon={<Ruler className="h-5 w-5" />}
                label="Area"
                value={`${property.area.toLocaleString()} sqft`}
              />
              <Spec
                icon={<Calendar className="h-5 w-5" />}
                label="Year Built"
                value={property.yearBuilt?.toString() || "—"}
              />
              <Spec
                icon={<Car className="h-5 w-5" />}
                label="Parking"
                value={property.parking.toString()}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <section>
            <h2 className="mb-3 text-xl font-semibold">Description</h2>
            <p className="leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </section>

          {/* Specs grid */}
          <section>
            <h2 className="mb-3 text-xl font-semibold">Property Details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Detail label="Property Type" value={typeLabel || property.propertyType} />
              <Detail label="Listing Type" value={property.listingType === "SALE" ? "For Sale" : "For Rent"} />
              <Detail label="Status" value={property.status} />
              <Detail label="Bedrooms" value={property.bedrooms.toString()} />
              <Detail label="Bathrooms" value={property.bathrooms.toString()} />
              <Detail label="Area" value={`${property.area.toLocaleString()} sqft`} />
              <Detail label="Year Built" value={property.yearBuilt?.toString() || "—"} />
              <Detail label="Parking" value={property.parking.toString()} />
              <Detail
                label="Furnished"
                value={
                  <span className="flex items-center gap-1">
                    <Sofa className="h-4 w-4" /> {property.furnished ? "Yes" : "No"}
                  </span>
                }
              />
            </div>
          </section>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                <Building2 className="h-5 w-5" /> Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(({ amenity }) => (
                  <span
                    key={amenity.id}
                    className="flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-sm"
                  >
                    <Check className="h-4 w-4 text-primary" /> {amenity.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Location / map */}
          <section>
            <h2 className="mb-3 text-xl font-semibold">Location</h2>
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title="Property location"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                src={
                  property.latitude && property.longitude
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.02}%2C${property.latitude - 0.02}%2C${property.longitude + 0.02}%2C${property.latitude + 0.02}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`
                    : `https://www.openstreetmap.org/export/embed.html?bbox=-74.1%2C40.6%2C-73.9%2C40.8&layer=mapnik`
                }
              />
            </div>
          </section>

          {/* Similar properties */}
          {similar.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">Similar Properties</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <SimilarCard key={s.id} property={s as PropertyCardData} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent card */}
          {property.agent && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 text-lg font-semibold">Listed by</h2>
                <div className="mb-4 flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={property.agent.avatar || ""} alt={property.agent.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(property.agent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{property.agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Licensed Real Estate Agent
                    </p>
                  </div>
                </div>
                {property.agent.bio && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {property.agent.bio}
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  {property.agent.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {property.agent.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {property.agent.email}
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-2">
                  <ScheduleViewing propertyId={property.id} />
                  <Link href={`/agent/${property.agent.id}`}>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Contact the Agent</h2>
              <ContactAgentForm propertyId={property.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function SimilarCard({ property }: { property: PropertyCardData }) {
  return (
    <Link href={`/properties/${property.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.images?.[0]?.url || ""}
            alt={property.title}
            className="h-full w-full object-cover"
          />
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            {formatCurrency(property.price)}
            {property.listingType === "RENT" ? "/mo" : ""}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 font-semibold">{property.title}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {property.city}
          </p>
        </div>
      </Card>
    </Link>
  );
}
