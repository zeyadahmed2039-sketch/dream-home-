"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getInitials, formatDate } from "@/lib/utils";
import { PROPERTY_TYPES } from "@/lib/constants";
import type { SessionUser } from "@/lib/session";

type TabKey = "overview" | "favorites" | "inquiries" | "viewings" | "profile" | "password" | "notifications";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "favorites", label: "My Favorites", icon: Heart },
  { key: "inquiries", label: "My Inquiries", icon: MessageSquare },
  { key: "viewings", label: "My Viewings", icon: Calendar },
  { key: "profile", label: "Profile", icon: Settings },
  { key: "password", label: "Change Password", icon: Settings },
  { key: "notifications", label: "Notifications", icon: Bell },
];

// Simplified prop types for the nested ServiceObject results
interface FavItem {
  id: string;
  createdAt: Date;
  property: {
    id: string;
    title: string;
    slug: string;
    price: number;
    listingType: string;
    propertyType: string;
    city: string;
    state: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    images: { url: string; sortOrder: number }[];
  };
}
interface InqItem {
  id: string;
  property: { id: string; title: string };
  status: string;
  message: string;
  createdAt: Date;
}
interface ViewingItem {
  id: string;
  property: { id: string; title: string };
  date: Date;
  time: string;
  status: string;
  notes?: string | null;
}
interface NotificationItem {
  id: string;
  title: string;
  message: string | null;
  read: boolean;
  link?: string | null;
  createdAt: Date;
}

export function DashboardShell({
  user,
  profile,
  favorites,
  inquiries,
  viewings,
  notifications,
  unread,
}: {
  user: SessionUser;
  profile: (ProfileRow & { hasPassword: boolean }) | null;
  favorites: FavItem[];
  inquiries: InqItem[];
  viewings: ViewingItem[];
  notifications: NotificationItem[];
  unread: number;
}) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar || undefined} alt={user.name || ""} />
            <AvatarFallback>{getInitials(user.name || "U")}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1 lg:sticky lg:top-24 lg:self-start">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.key === "notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-2 text-xs text-white">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <div>
          {tab === "overview" && (
            <OverviewTab stats={{ favorites: favorites.length, inquiries: inquiries.length, viewings: viewings.length }} userName={user.name!} />
          )}
          {tab === "favorites" && <FavoritesTab favorites={favorites} />}
          {tab === "inquiries" && <InquiriesTab items={inquiries} />}
          {tab === "viewings" && <ViewingsTab items={viewings} />}
          {tab === "profile" && profile && <ProfileTab profile={profile} />}
          {tab === "password" && <PasswordTab hasPassword={profile?.hasPassword} />}
          {tab === "notifications" && <NotificationsTab items={notifications} />}
        </div>
      </div>
    </div>
  );
}

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  role: string;
  isAgentApproved: boolean;
};

function OverviewTab({ stats, userName }: { stats: { favorites: number; inquiries: number; viewings: number }; userName: string }) {
  const cards = [
    { label: "Saved Favorites", value: stats.favorites, href: "/dashboard" },
    { label: "Inquiries Sent", value: stats.inquiries, href: "/dashboard" },
    { label: "Viewings Requested", value: stats.viewings, href: "/dashboard" },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {userName}!</CardTitle>
          <CardDescription>
            Manage your saved properties, inquiries and scheduled viewings all in one place.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">{c.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FavoritesTab({ favorites }: { favorites: FavItem[] }) {
  const router = useRouter();
  if (favorites.length === 0) {
    return <EmptyState title="No favorites yet" desc="Browse properties and tap the heart to save them." href="/properties" cta="Browse properties" />;
  }
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Saved Properties ({favorites.length})</h2>
      {favorites.map((f) => (
        <Card key={f.id}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <Link href={`/properties/${f.property.slug}`} className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg sm:w-36">
              <Image src={f.property.images?.[0]?.url || "/placeholder"} alt={f.property.title} fill className="object-cover" sizes="144px" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={f.property.listingType === "SALE" ? "default" : "secondary"}>
                  {f.property.listingType === "SALE" ? "For Sale" : "For Rent"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {PROPERTY_TYPES.find((t) => t.value === f.property.propertyType)?.label}
                </span>
              </div>
              <Link href={`/properties/${f.property.slug}`} className="mt-1 block truncate font-semibold hover:text-primary">
                {f.property.title}
              </Link>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {f.property.city}, {f.property.state}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <p className="font-bold text-primary">{formatCurrency(f.property.price)}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await fetch(`/api/favorites/${f.property.id}`, { method: "DELETE" });
                  router.refresh();
                  toast.success("Removed from favorites");
                }}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InquiriesTab({ items }: { items: InqItem[] }) {
  const statusColor: Record<string, string> = {
    NEW: "secondary",
    READ: "outline",
    REPLIED: "default",
    CLOSED: "destructive",
  } as const;
  if (items.length === 0) {
    return <EmptyState title="No inquiries" desc="Contact an agent about a property to get started." href="/properties" cta="Browse properties" />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Inquiries</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.property.title}</TableCell>
                <TableCell className="max-w-[260px] truncate text-muted-foreground">{i.message}</TableCell>
                <TableCell>
                  <Badge variant={(statusColor[i.status] as never) || "secondary"}>{i.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(new Date(i.createdAt))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ViewingsTab({ items }: { items: ViewingItem[] }) {
  const statusColor: Record<string, string> = {
    PENDING: "secondary",
    CONFIRMED: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  };
  if (items.length === 0) {
    return <EmptyState title="No viewings scheduled" desc="Schedule a viewing on any property you're interested in." href="/properties" cta="Browse properties" />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Viewings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.property.title}</TableCell>
                <TableCell>{formatDate(new Date(v.date))}</TableCell>
                <TableCell>{v.time}</TableCell>
                <TableCell>
                  <Badge variant={(statusColor[v.status] as never) || "secondary"}>{v.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function NotificationsTab({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    router.refresh();
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await fetch("/api/notifications", { method: "PATCH" });
            router.refresh();
          }}
        >
          Mark all read
        </Button>
      </div>
      {items.length === 0 && <EmptyState title="No notifications" desc="You're all caught up." />}
      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`rounded-lg border p-4 transition ${!n.read ? "cursor-pointer border-primary/40 bg-primary/5" : "bg-card"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
            {n.link && (
              <Link href={n.link} className="mt-2 inline-block text-sm text-primary hover:underline">
                View →
              </Link>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(new Date(n.createdAt))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile: ProfileRow }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bio, avatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled />
          <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
        <Button onClick={save} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}

function PasswordTab({ hasPassword }: { hasPassword?: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next, confirmNewPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }
      toast.success("Password changed successfully");
      setCurrent(""); setNext(""); setConfirm("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (hasPassword === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your account was created with a social login and does not use a password.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update the password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next">New password</Label>
            <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, desc, href, cta }: { title: string; desc: string; href?: string; cta?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
        {href && cta && (
          <Button asChild className="mt-4">
            <Link href={href}>{cta}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
