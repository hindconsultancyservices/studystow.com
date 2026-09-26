import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          const email = String(credentials.email)
            .trim()
            .toLowerCase();

          const password = String(credentials.password);

          const user = await User.findOne({
            email,
            active: true,
          }).select("+password");

          if (!user) {
            return null;
          }

          if (!user.password) {
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
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userWithRole = user as typeof user & { id?: string; role?: string };

        token.id = userWithRole.id;
        token.role = userWithRole.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id: string;
          role: string;
        };

        sessionUser.id = token.id as string;
        sessionUser.role = token.role as string;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler };
export { handler as GET, handler as POST };
