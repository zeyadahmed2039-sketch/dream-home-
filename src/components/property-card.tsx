import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Ruler, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorite-button";
import { formatCurrency } from "@/lib/utils";
import { typeToLabel } from "@/lib/constants";
import type { PropertyCardData } from "@/types/property";

const placeholderImage =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80";

export function PropertyCard({
  property,
  isFavorite = false,
}: {
  property: PropertyCardData;
  isFavorite?: boolean;
}) {
  const image = property.images?.[0]?.url || placeholderImage;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link
        href={`/properties/${property.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden"
      >
        <Image
          src={image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            className={
              property.listingType === "SALE"
                ? "bg-primary text-primary-foreground"
                : "bg-emerald-500 text-white"
            }
          >
            {property.listingType === "SALE" ? "For Sale" : "For Rent"}
          </Badge>
          {property.featured && (
            <Badge variant="warning">Featured</Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-white">
            <p className="text-lg font-bold">
              {formatCurrency(property.price)}
              <span className="text-sm font-normal">
                {property.listingType === "RENT" ? "/mo" : ""}
              </span>
            </p>
            <p className="flex items-center gap-1 text-sm text-white/90">
              <MapPin className="h-3.5 w-3.5" />
              {property.city}, {property.state}
            </p>
          </div>
          <FavoriteButton
            propertyId={property.id}
            defaultFavorite={isFavorite}
          />
        </div>
      </Link>

      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-primary">
          {typeToLabel(property.propertyType)} • {property.listingType === "SALE" ? "Sale" : "Rent"}
        </p>
        <Link href={`/properties/${property.slug}`}>
          <h3 className="mb-2 line-clamp-1 text-base font-semibold hover:text-primary">
            {property.title}
          </h3>
        </Link>

        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-4 w-4" /> {property.area.toLocaleString()} sqft
          </span>
        </div>

        <Link
          href={`/properties/${property.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
