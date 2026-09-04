"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, PROPERTY_TYPES, LISTING_TYPES } from "@/lib/constants";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();

  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [city, setCity] = useState(params.get("city") || "all");
  const [propertyType, setPropertyType] = useState(
    params.get("propertyType") || "all"
  );
  const [listingType, setListingType] = useState(
    params.get("listingType") || "all"
  );
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "all");

  function onSearch() {
    const q = new URLSearchParams();
    if (keyword) q.set("keyword", keyword);
    if (city && city !== "all") q.set("city", city);
    if (propertyType && propertyType !== "all")
      q.set("propertyType", propertyType);
    if (listingType && listingType !== "all")
      q.set("listingType", listingType);
    if (maxPrice && maxPrice !== "all") q.set("maxPrice", maxPrice);
    router.push(`/properties?${q.toString()}`);
  }

  return (
    <div
      className={`grid gap-2 rounded-xl border bg-background p-2 shadow-lg ${
        compact
          ? "sm:grid-cols-2 lg:grid-cols-5"
          : "sm:grid-cols-2 lg:grid-cols-5"
      }`}
    >
      <Input
        placeholder="City, address, or keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="lg:col-span-2"
      />
      <Select value={city} onValueChange={setCity}>
        <SelectTrigger>
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All locations</SelectItem>
          {CITIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={propertyType} onValueChange={setPropertyType}>
        <SelectTrigger>
          <SelectValue placeholder="Property type" />
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
      <Select value={listingType} onValueChange={setListingType}>
        <SelectTrigger>
          <SelectValue placeholder="For sale / rent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Buy or Rent</SelectItem>
          {LISTING_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onSearch} className="lg:col-span-2 lg:row-start-2">
        <Search className="mr-2 h-4 w-4" /> Search Properties
      </Button>
    </div>
  );
}
