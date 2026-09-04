"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Plus,
  MessageSquare,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Loader2,
  Upload,
  X,
  MapPin,
  Eye,
  Heart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { PROPERTY_TYPES, LISTING_TYPES, AMENITIES } from "@/lib/constants";
import type { SessionUser } from "@/lib/session";

type TabKey =
  | "overview"
  | "properties"
  | "add"
  | "inquiries"
  | "viewings"
  | "profile";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "properties", label: "My Properties", icon: Building2 },
  { key: "add", label: "Add Property", icon: Plus },
  { key: "inquiries", label: "Inquiries", icon: MessageSquare },
  { key: "viewings", label: "Viewings", icon: Calendar },
  { key: "profile", label: "Profile", icon: Settings },
];

interface AgentProp {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: string;
  propertyType: string;
  city: string;
  state: string;
  status: string;
  featured: boolean;
  images: { url: string; sortOrder: number }[];
  _count?: { favorites: number; inquiries: number; viewings: number };
}
interface AgentInq {
  id: string;
  property: { id: string; title: string };
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
}
interface AgentViewing {
  id: string;
  property: { id: string; title: string };
  user: { id: string; name: string; email: string; phone: string | null };
  date: Date;
  time: string;
  status: string;
}

export function AgentShell({
  user,
  isApproved,
  initialProperties,
  initialInquiries,
  initialViewings,
  unread,
}: {
  user: SessionUser;
  isApproved: boolean;
  initialProperties: AgentProp[];
  initialInquiries: AgentInq[];
  initialViewings: AgentViewing[];
  unread: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");
  const [properties, setProperties] = useState(initialProperties);

  return (
    <div className="container mx-auto px-4 py-8">
      {!isApproved && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Your agent account is awaiting approval by an administrator. You can
          prepare a listing, but it will only go live once approved.
        </div>
      )}

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
            <AvatarFallback>{getInitials(user.name || "A")}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {user.role.toLowerCase()} • {properties.length} listings
            </p>
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
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <Bell className="h-4 w-4" /> My Dashboard
            {unread > 0 && <span className="ml-auto rounded-full bg-destructive px-2 text-xs text-white">{unread}</span>}
          </Link>
        </aside>

        <div>
          {tab === "overview" && (
            <OverviewTab properties={properties} />
          )}
          {tab === "properties" && (
            <PropertiesTab
              properties={properties}
              refresh={() => router.refresh()}
            />
          )}
          {tab === "add" && (
            <PropertyForm onSaved={() => router.refresh()} isApproved={isApproved} />
          )}
          {tab === "inquiries" && (
            <InquiriesTab initial={initialInquiries} refresh={() => router.refresh()} />
          )}
          {tab === "viewings" && (
            <ViewingsTab initial={initialViewings} refresh={() => router.refresh()} />
          )}
          {tab === "profile" && <AgentProfileTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ properties }: { properties: AgentProp[] }) {
  const totalValue = properties.reduce((s, p) => s + p.price, 0);
  const active = properties.filter((p) => p.status === "ACTIVE").length;
  const pending = properties.filter((p) => p.status === "PENDING").length;
  const cards = [
    { label: "Total Listings", value: properties.length },
    { label: "Active", value: active },
    { label: "Pending Approval", value: pending },
    { label: "Total Value", value: formatCurrency(totalValue) },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-primary">{c.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PropertiesTab({
  properties,
  refresh,
}: {
  properties: AgentProp[];
  refresh: () => void;
}) {
  const statusColor: Record<string, string> = {
    ACTIVE: "success",
    PENDING: "warning",
    REJECTED: "destructive",
    SOLD: "outline",
    RENTED: "outline",
    ARCHIVED: "secondary",
  };
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <h3 className="text-lg font-semibold">No properties yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first listing to get started.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Properties ({properties.length})</h2>
        <Button asChild size="sm">
          <Link href="/properties/new">
            <Plus className="mr-1 h-4 w-4" /> Add property
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Link href={`/properties/${p.slug}`} className="relative h-32 w-28 shrink-0 overflow-hidden rounded-lg">
                  <Image src={p.images?.[0]?.url || "/placeholder"} alt={p.title} fill className="object-cover" sizes="112px" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={(statusColor[p.status] as never) || "secondary"}>{p.status}</Badge>
                    {p.featured && <Badge variant="warning">Featured</Badge>}
                  </div>
                  <Link href={`/properties/${p.slug}`} className="mt-2 block truncate font-semibold hover:text-primary">
                    {p.title}
                  </Link>
                  <p className="text-sm font-bold text-primary">{formatCurrency(p.price)}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.city}, {p.state}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {p._count?.favorites ?? 0}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p._count?.inquiries ?? 0}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <PropertyEditDialog property={p} refresh={refresh} />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={async () => {
                    const res = await fetch(`/api/agent/properties/${p.id}`, { method: "DELETE" });
                    if (res.ok) {
                      toast.success("Property deleted");
                      refresh();
                    } else {
                      toast.error("Failed to delete");
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PropertyEditDialog({ property, refresh }: { property: AgentProp; refresh: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update your listing details. It will be re-reviewed.</DialogDescription>
        </DialogHeader>
        <PropertyForm initial={property} onSaved={refresh} isApproved />
      </DialogContent>
    </Dialog>
  );
}

const emptyForm = {
  title: "",
  description: "",
  listingType: "SALE",
  propertyType: "HOUSE",
  price: 0,
  address: "",
  city: "",
  state: "",
  country: "United States",
  bedrooms: 1,
  bathrooms: 1,
  area: 0,
  yearBuilt: "",
  furnished: false,
  parking: 0,
  amenities: [] as string[],
  images: [] as string[],
};

export function PropertyForm({
  onSaved,
  isApproved,
  initial,
}: {
  onSaved: () => void;
  isApproved: boolean;
  initial?: AgentProp;
}) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initial
      ? {
          title: initial.title,
          price: initial.price,
          listingType: initial.listingType,
          propertyType: initial.propertyType,
          city: initial.city,
          state: initial.state,
          images: initial.images.map((i) => i.url),
        }
      : {}),
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(name: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(name)
        ? f.amenities.filter((a) => a !== name)
        : [...f.amenities, name],
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : null,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      parking: Number(form.parking),
    };
    try {
      const url = initial ? `/api/agent/properties/${initial.id}` : "/api/agent/properties";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save property");
        return;
      }
      toast.success(initial ? "Property updated" : "Property submitted for review");
      onSaved();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{initial ? "Edit property" : "Add new property"}</CardTitle>
          <CardDescription>
            Fill in the details below. Listings are reviewed before going live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} required minLength={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} required minLength={20} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Listing type</Label>
              <Select value={form.listingType} onValueChange={(v) => set("listingType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property type</Label>
              <Select value={form.propertyType} onValueChange={(v) => set("propertyType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input id="price" type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} required min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} required minLength={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" value={form.country} onChange={(e) => set("country", e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (sqft)</Label>
              <Input id="area" type="number" value={form.area} onChange={(e) => set("area", Number(e.target.value))} min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year built</Label>
              <Input id="yearBuilt" type="number" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} min={1800} max={2100} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parking">Parking spots</Label>
              <Input id="parking" type="number" value={form.parking} onChange={(e) => set("parking", Number(e.target.value))} min={0} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch checked={form.furnished} onCheckedChange={(v) => set("furnished", v)} />
              <Label className="cursor-pointer">Furnished</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.amenities.includes(a)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Images *</Label>
            <div className="flex gap-2">
              <Input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="upload-input" />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
              </Button>
              <Input
                placeholder="or paste image URL"
                onChange={(e) => {
                  const url = e.target.value.trim();
                  if (url && (url.startsWith("http") || url.startsWith("data:"))) {
                    setForm((f) => ({ ...f, images: [...f.images, url] }));
                    e.target.value = "";
                  }
                }}
              />
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image src={img} alt={`image ${i + 1}`} fill className="object-cover" sizes="96px" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={saving || !isApproved}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Submit property"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function InquiriesTab({ initial, refresh }: { initial: AgentInq[]; refresh: () => void }) {
  const statusColor: Record<string, string> = {
    NEW: "warning",
    READ: "secondary",
    REPLIED: "default",
    CLOSED: "outline",
  };
  async function update(id: string, status: string) {
    const res = await fetch(`/api/agent/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Inquiry updated");
      refresh();
    } else {
      toast.error("Failed to update");
    }
  }
  if (initial.length === 0) {
    return <EmptyCard title="No inquiries yet" desc="Inquiries from interested buyers will appear here." />;
  }
  return (
    <Card>
      <CardHeader><CardTitle>Inquiries</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.property.title}</TableCell>
                <TableCell>{i.name}<br /><span className="text-xs text-muted-foreground">{i.email}</span></TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{i.message}</TableCell>
                <TableCell><Badge variant={(statusColor[i.status] as never) || "secondary"}>{i.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(new Date(i.createdAt))}</TableCell>
                <TableCell className="space-x-1">
                  {i.status !== "REPLIED" && <Button size="sm" variant="outline" onClick={() => update(i.id, "REPLIED")}>Reply</Button>}
                  {i.status !== "CLOSED" && <Button size="sm" variant="ghost" onClick={() => update(i.id, "CLOSED")}>Close</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ViewingsTab({ initial, refresh }: { initial: AgentViewing[]; refresh: () => void }) {
  const statusColor: Record<string, string> = {
    PENDING: "warning",
    CONFIRMED: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  };
  async function update(id: string, status: string) {
    const res = await fetch(`/api/agent/viewings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Viewing updated");
      refresh();
    } else {
      toast.error("Failed to update");
    }
  }
  if (initial.length === 0) {
    return <EmptyCard title="No viewings yet" desc="Scheduled viewings for your properties will appear here." />;
  }
  return (
    <Card>
      <CardHeader><CardTitle>Viewings</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.property.title}</TableCell>
                <TableCell>{v.user.name}<br /><span className="text-xs text-muted-foreground">{v.user.email}</span></TableCell>
                <TableCell>{formatDate(new Date(v.date))}</TableCell>
                <TableCell>{v.time}</TableCell>
                <TableCell><Badge variant={(statusColor[v.status] as never) || "secondary"}>{v.status}</Badge></TableCell>
                <TableCell className="space-x-1">
                  {v.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => update(v.id, "CONFIRMED")}>Confirm</Button>}
                  {v.status !== "CANCELLED" && v.status !== "COMPLETED" && <Button size="sm" variant="ghost" onClick={() => update(v.id, "CANCELLED")}>Cancel</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AgentProfileTab() {
  return (
    <Card>
      <CardHeader><CardTitle>Agent Profile</CardTitle><CardDescription>Manage profile via dashboard settings.</CardDescription></CardHeader>
      <CardContent>
        <Button asChild><Link href="/dashboard">Go to My Dashboard →</Link></Button>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-16 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
