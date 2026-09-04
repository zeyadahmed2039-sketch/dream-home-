"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CITIES, PROPERTY_TYPES, AMENITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const AMENITY_TAGS = [
  "Pool",
  "Gym",
  "Parking",
  "Garden",
  "Balcony",
  "Garage",
  "Security",
  "Furnished",
  "Pets Allowed",
];

export function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [city, setCity] = useState(params.get("city") || "all");
  const [propertyType, setPropertyType] = useState(
    params.get("propertyType") || "all"
  );
  const [listingType, setListingType] = useState(
    params.get("listingType") || "all"
  );
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(params.get("bedrooms") || "any");
  const [bathrooms, setBathrooms] = useState(params.get("bathrooms") || "any");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    params.get("amenities")?.split(",").filter(Boolean) || []
  );

  function applyAll() {
    const q = new URLSearchParams();
    if (keyword) q.set("keyword", keyword);
    if (city && city !== "all") q.set("city", city);
    if (propertyType && propertyType !== "all")
      q.set("propertyType", propertyType);
    if (listingType && listingType !== "all")
      q.set("listingType", listingType);
    if (minPrice) q.set("minPrice", minPrice);
    if (maxPrice) q.set("maxPrice", maxPrice);
    if (bedrooms && bedrooms !== "any") q.set("bedrooms", bedrooms);
    if (bathrooms && bathrooms !== "any") q.set("bathrooms", bathrooms);
    if (selectedAmenities.length) q.set("amenities", selectedAmenities.join(","));
    if (sort && sort !== "newest") q.set("sort", sort);
    q.set("page", "1");
    router.push(`${pathname}?${q.toString()}`);
  }

  function update(key: string, value: string) {
    const q = new URLSearchParams(params.toString());
    if (value && value !== "all" && value !== "any" && value !== "newest") {
      q.set(key, value);
    } else {
      q.delete(key);
    }
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const FilterControls = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="mr-1 h-4 w-4" /> Clear
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Keyword</Label>
        <Input
          placeholder="Search..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyAll()}
        />
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={city} onValueChange={(v) => setCity(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Listing type</Label>
        <Select value={listingType} onValueChange={(v) => setListingType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="SALE">For Sale</SelectItem>
            <SelectItem value="RENT">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Property type</Label>
        <Select value={propertyType} onValueChange={(v) => setPropertyType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price range (USD)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Select
            value={bedrooms}
            onValueChange={(v) => {
              setBedrooms(v);
              update("bedrooms", v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bathrooms</Label>
          <Select
            value={bathrooms}
            onValueChange={(v) => {
              setBathrooms(v);
              update("bathrooms", v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_TAGS.map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
            >
              <Checkbox
                checked={selectedAmenities.includes(a)}
                onCheckedChange={() => {
                  setSelectedAmenities((prev) =>
                    prev.includes(a)
                      ? prev.filter((x) => x !== a)
                      : [...prev, a]
                  );
                }}
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={applyAll}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-lg border bg-card p-4">
          {FilterControls}
        </div>
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{FilterControls}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
