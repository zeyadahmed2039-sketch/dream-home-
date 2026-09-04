import { DefaultSession } from "next-auth";
import { Role } from "@/lib/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isAgentApproved?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    isAgentApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    isAgentApproved?: boolean;
  }
}
