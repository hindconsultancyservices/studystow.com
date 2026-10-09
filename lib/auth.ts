
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

type PermissionMap = Record<
  string,
  Record<string, boolean>
>;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      adminRole?: string | null;
      permissions?: PermissionMap;
      status?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    adminRole?: string | null;
    permissions?: PermissionMap;
    status?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    adminRole?: string | null;
    permissions?: PermissionMap;
    status?: string | null;
  }
}

function normalizeStatus(value: unknown): string {
  return String(value ?? "active")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function isAccountActive(user: {
  active?: boolean;
  status?: unknown;
}): boolean {
  const status = normalizeStatus(user.status);

  return (
    user.active !== false &&
    ![
      "inactive",
      "suspended",
      "removed",
      "disabled",
    ].includes(status)
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        try {
          await connectDB();

          const email = String(credentials.email)
            .trim()
            .toLowerCase();

          const password = String(
            credentials.password
          );

          const user = await User.findOne({
            email,
            active: true,
          }).select("+password");

          if (!user || !user.password) {
            return null;
          }

          if (!isAccountActive(user)) {
            return null;
          }

          const passwordMatched = await bcrypt.compare(
            password,
            user.password
          );

          if (!passwordMatched) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name || "",
            email: user.email,
            role: user.role || "user",

            adminRole:
              (user as any).adminRole ?? null,

            permissions:
              (user as any).permissions ?? {},

            status:
              (user as any).status ?? "active",
          };
        } catch (error) {
          console.error(
            "Authentication error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.adminRole = user.adminRole ?? null;
        token.permissions = user.permissions ?? {};
        token.status = user.status ?? "active";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "user";

        session.user.adminRole =
          token.adminRole ?? null;

        session.user.permissions =
          token.permissions ?? {};

        session.user.status =
          token.status ?? "active";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler };
