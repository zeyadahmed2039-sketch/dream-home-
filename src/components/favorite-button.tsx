"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  defaultFavorite = false,
  className,
}: {
  propertyId: string;
  defaultFavorite?: boolean;
  className?: string;
}) {
  const { status } = useSession();
  const [isFav, setIsFav] = useState(defaultFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (status !== "authenticated") {
      toast.info("Please log in to save favorites.", {
        action: {
          label: "Log in",
          onClick: () => (window.location.href = "/login"),
        },
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/${propertyId}`, {
        method: isFav ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Failed");
      setIsFav(!isFav);
      toast.success(isFav ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={loading}
      aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "rounded-full bg-background/80 backdrop-blur hover:bg-background",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-5 w-5",
            isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
          )}
        />
      )}
    </Button>
  );
}
