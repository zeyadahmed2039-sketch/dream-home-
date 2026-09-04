"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={(value) => {
        const q = new URLSearchParams(window.location.search);
        if (value === "newest") q.delete("sort");
        else q.set("sort", value);
        q.delete("page");
        window.location.href = `/properties?${q.toString()}`;
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="oldest">Oldest</SelectItem>
        <SelectItem value="price_asc">Price: Low to High</SelectItem>
        <SelectItem value="price_desc">Price: High to Low</SelectItem>
        <SelectItem value="area_desc">Largest Area</SelectItem>
      </SelectContent>
    </Select>
  );
}
