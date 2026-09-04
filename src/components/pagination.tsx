import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - page) <= 1
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      <Button variant="outline" size="sm" asChild disabled={page <= 1}>
        <Link href={buildHref(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={buildHref(p)} className={cn(p === page && "rounded-md")}>
              {p}
            </Link>
          </Button>
        )
      )}
      <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
        <Link href={buildHref(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
