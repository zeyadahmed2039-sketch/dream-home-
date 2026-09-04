"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const placeholderImage =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80";

export function PropertyGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const list = images.length > 0 ? images : [placeholderImage];

  return (
    <div>
      <button
        onClick={() => setLightbox(true)}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-xl"
      >
        <Image
          src={list[active]}
          alt="Property"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </button>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md border-2",
                i === active ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={src}
                alt={`Photo ${i + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={() =>
              setActive((a) => (a === 0 ? list.length - 1 : a - 1))
            }
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <Image
            src={list[active]}
            alt="Property large"
            width={1200}
            height={800}
            className="max-h-[85vh] max-w-full object-contain"
          />
          <button
            onClick={() => setActive((a) => (a + 1) % list.length)}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
