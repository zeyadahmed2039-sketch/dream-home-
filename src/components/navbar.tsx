import Link from "next/link";
import { Home } from "lucide-react";
import { getSession } from "@/lib/session";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user ?? null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Buy" },
    { href: "/properties?listingType=RENT", label: "Rent" },
    { href: "/properties?listingType=SALE", label: "Sell" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-5 w-5" />
          </span>
          <span>
            Dream <span className="text-primary">Home</span>
          </span>
        </Link>

        <NavbarClient user={user} links={links} />
      </div>
    </header>
  );
}
