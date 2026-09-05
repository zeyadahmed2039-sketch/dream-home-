"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function ShareButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Share"
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title: document.title, url: window.location.href });
        } else {
          navigator.clipboard?.writeText(window.location.href);
        }
      }}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}