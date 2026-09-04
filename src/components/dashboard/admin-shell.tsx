"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Building2,
  Flag,
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

type TabKey = "overview" | "users" | "properties" | "reports";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "properties", label: "Properties", icon: Building2 },
  { key: "reports", label: "Reports", icon: Flag },
];

interface Stats {
  totalUsers: number;
  totalAgents: number;
  totalProperties: number;
  activeListings: number;
  pendingListings: number;
  totalInquiries: number;
  totalViewings: number;
  totalReports: number;
  openReports: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isAgentApproved: boolean;
  createdAt: Date;
  _count?: { properties: number; favorites: number };
}
interface AdminProp {
  id: string;
  title: string;
  status: string;
  price: number;
  city: string;
  images: { url: string; sortOrder: number }[];
  agent?: { id: string; name: string } | null;
  _count?: { favorites: number; inquiries: number };
}
interface AdminReport {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: Date;
  property?: { id: string; title: string; status: string } | null;
}

function useAdminData() {
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch(`/api/admin/users?page=${page}`).then((r) => r.json()),
      fetch(`/api/admin/properties?page=${page}`).then((r) => r.json()),
      fetch("/api/admin/reports").then((r) => r.json()),
    ])
      .then(([stats, users, properties, reports]) => {
        setData({ stats, users, properties, reports });
      })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [page, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { data, loading, page, setPage, refresh };
}

export function AdminShell() {
  const [tab, setTab] = useState<TabKey>("overview");
  const { data, loading, refresh } = useAdminData();
  const router = useRouter();

  const stats = (data.stats as Stats) || null;
  const users = ((data.users as { users?: AdminUser[] })?.users) || [];
  const properties = ((data.properties as { properties?: AdminProp[] })?.properties) || [];
  const reports = ((data.reports as { reports?: AdminReport[] })?.reports) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage users, listings and reports.</p>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
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
        </aside>

        <div>
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <>
              {tab === "overview" && stats && <AdminOverview stats={stats} />}
              {tab === "users" && <UsersTab users={users} refresh={() => { setTab("overview"); router.refresh(); }} />}
              {tab === "properties" && <PropertiesTab properties={properties} refresh={refresh} />}
              {tab === "reports" && <ReportsTab reports={reports} refresh={() => router.refresh()} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminOverview({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Agents", value: stats.totalAgents },
    { label: "Total Properties", value: stats.totalProperties },
    { label: "Active Listings", value: stats.activeListings },
    { label: "Pending Approval", value: stats.pendingListings },
    { label: "Inquiries", value: stats.totalInquiries },
    { label: "Viewings", value: stats.totalViewings },
    { label: "Open Reports", value: stats.openReports },
  ];
  return (
    <div className="space-y-6">
      {stats.openReports > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {stats.openReports} open report(s) require attention.
        </div>
      )}
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

function UsersTab({ users, refresh }: { users: AdminUser[]; refresh: () => void }) {
  async function setRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      toast.success("User updated");
      refresh();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed");
    }
  }
  async function toggleApproval(u: AdminUser) {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAgentApproved: !u.isAgentApproved }),
    });
    if (res.ok) {
      toast.success("Approval updated");
      refresh();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed");
    }
  }
  if (users.length === 0) {
    return <EmptyCard title="No users" desc="No users match the current filter." />;
  }
  return (
    <Card>
      <CardHeader><CardTitle>Users</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Agent Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={undefined} alt={u.name} />
                      <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => setRole(u.id, v)}>
                    <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {u.role === "AGENT" ? (
                    <Button size="sm" variant={u.isAgentApproved ? "outline" : "default"} onClick={() => toggleApproval(u)}>
                      {u.isAgentApproved ? "Approved" : "Approve"}
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(new Date(u.createdAt))}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
                      if (res.ok) {
                        toast.success("User deleted");
                        refresh();
                      } else {
                        const d = await res.json();
                        toast.error(d.error || "Failed");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PropertiesTab({ properties, refresh }: { properties: AdminProp[]; refresh: () => void }) {
  const statusColor: Record<string, string> = {
    ACTIVE: "success",
    PENDING: "warning",
    REJECTED: "destructive",
    SOLD: "outline",
    RENTED: "outline",
    ARCHIVED: "secondary",
  };
  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/properties", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: id, status }),
    });
    if (res.ok) {
      toast.success("Status updated");
      refresh();
    } else {
      toast.error("Failed to update");
    }
  }
  if (properties.length === 0) {
    return <EmptyCard title="No properties" desc="No properties match the current filter." />;
  }
  return (
    <Card>
      <CardHeader><CardTitle>Properties</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded">
                      <Image src={p.images?.[0]?.url || "/placeholder"} alt={p.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div>
                      <p className="max-w-[200px] truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.city}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.agent?.name || "—"}</TableCell>
                <TableCell>{formatCurrency(p.price)}</TableCell>
                <TableCell><Badge variant={(statusColor[p.status] as never) || "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="space-x-1">
                  {p.status === "PENDING" && (
                    <Button size="sm" onClick={() => setStatus(p.id, "ACTIVE")}>Approve</Button>
                  )}
                  {p.status === "PENDING" && (
                    <Button size="sm" variant="destructive" onClick={() => setStatus(p.id, "REJECTED")}>Reject</Button>
                  )}
                  {(p.status === "ACTIVE") && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "ARCHIVED")}>Archive</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReportsTab({ reports, refresh }: { reports: AdminReport[]; refresh: () => void }) {
  async function update(id: string, status: string) {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, status }),
    });
    if (res.ok) {
      toast.success("Report updated");
      refresh();
    } else {
      toast.error("Failed to update");
    }
  }
  const statusColor: Record<string, string> = {
    OPEN: "destructive",
    RESOLVED: "success",
    DISMISSED: "secondary",
  };
  if (reports.length === 0) {
    return <EmptyCard title="No reports" desc="No property reports have been submitted." />;
  }
  return (
    <Card>
      <CardHeader><CardTitle>Reports</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.property?.title || "Unknown"}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell className="max-w-[180px] truncate text-muted-foreground">{r.details || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(new Date(r.createdAt))}</TableCell>
                <TableCell><Badge variant={(statusColor[r.status] as never) || "secondary"}>{r.status}</Badge></TableCell>
                <TableCell className="space-x-1">
                  {r.status === "OPEN" && (
                    <>
                      <Button size="sm" onClick={() => update(r.id, "RESOLVED")}>Resolve</Button>
                      <Button size="sm" variant="outline" onClick={() => update(r.id, "DISMISSED")}>Dismiss</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-16 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
