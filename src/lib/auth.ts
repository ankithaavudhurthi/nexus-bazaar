import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { UserRole } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (err) {
          console.error("[AUTH_AUTHORIZE_ERROR]", err);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              email: user.email,
              name: user.name ?? user.email,
              image: user.image,
              role: "BUYER",
              emailVerified: new Date(),
            },
          });
        }
        return true;
      } catch (err) {
        console.error("[AUTH_SIGNIN_CALLBACK_ERROR]", err);
        return true;
      }
    },
    async jwt({ token, user, trigger }) {
      try {
        if (user) {
          token.sub = user.id;
          token.email = user.email;
          token.role = (user as { role?: UserRole }).role ?? "BUYER";
        }
        const email = token.email ?? (user?.email as string | undefined);
        if (email && (!token.role || trigger === "update")) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, vendorProfile: { select: { status: true } } },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.sub = dbUser.id;
            token.vendorStatus = dbUser.vendorProfile?.status;
          }
        }
      } catch (err) {
        console.error("[AUTH_JWT_CALLBACK_ERROR]", err);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        (session.user as { vendorStatus?: string }).vendorStatus = token.vendorStatus as
          | string
          | undefined;
      }
      return session;
    },
  },
});
