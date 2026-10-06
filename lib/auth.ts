import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      adminRole?: string | null;
      permissions?: Record<
        string,
        Record<string, boolean>
      >;
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
    permissions?: Record<
      string,
      Record<string, boolean>
    >;
    status?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    adminRole?: string | null;
    permissions?: Record<
      string,
      Record<string, boolean>
    >;
    status?: string | null;
  }
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

          const passwordMatched =
            await bcrypt.compare(
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
              (user as any).adminRole || null,

            permissions:
              (user as any).permissions || {},

            status:
              (user as any).status || "active",
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

        token.adminRole =
          user.adminRole || null;

        token.permissions =
          user.permissions || {};

        token.status =
          user.status || "active";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          token.id as string;

        session.user.role =
          token.role as string;

        session.user.adminRole =
          token.adminRole || null;

        session.user.permissions =
          token.permissions || {};

        session.user.status =
          token.status || "active";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug:
    process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler };