import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { type Role } from "@/lib/enums";

export type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAgentApproved?: boolean;
};

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session as unknown as
    | { user: SessionUser }
    | null;
}

/** Require an authenticated user; redirect to /login if absent. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

/** Require any one of the given roles; returns the user or null. */
export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  if (!roles.includes(session.user.role)) {
    return null;
  }
  return session.user;
}

/** API route guard: returns a session-user object or a NextResponse error. */
export async function getApiUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { user: null, response: unauthorized() };
  }
  return {
    user: (session.user as unknown) as SessionUser,
    response: null,
  };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
