import type { Role } from "./policy";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; email: string; name?: string | null };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
