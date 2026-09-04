import Link from "next/link";
import { Home, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Explore: [
    { href: "/properties", label: "All Properties" },
    { href: "/properties?listingType=SALE", label: "Buy" },
    { href: "/properties?listingType=RENT", label: "Rent" },
    { href: "/properties?listingType=SALE", label: "Sell" },
    { href: "/properties/new", label: "List a Property" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/properties", label: "Careers" },
    { href: "/properties", label: "Blog" },
  ],
  Support: [
    { href: "/contact", label: "Help Center" },
    { href: "/contact", label: "Privacy Policy" },
    { href: "/contact", label: "Terms of Service" },
    { href: "/contact", label: "FAQs" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-5 w-5" />
              </span>
              <span>
                Dream <span className="text-primary">Home</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted partner in finding the perfect property. We make real
              estate simple, transparent, and accessible for everyone.
            </p>
            <div className="mt-4 flex gap-2">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dream Home Online. All rights reserved.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> support@dreamhome.com
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> +1 (555) 123-4567
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> New York, NY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
