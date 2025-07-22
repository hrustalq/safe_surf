import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compareSync } from "bcrypt-ts";
import { z } from "zod";
import { env } from "~/env";
import { type UserRole } from "@prisma/client";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"]; 
  }

  interface User {
    role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = z.string().email().parse(credentials.email);
          const password = z.string().min(8).parse(credentials.password);

          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user?.password) {
            return null;
          }

          const passwordsMatch = compareSync(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: async ({ user, account, profile: _profile, email: _email, credentials: _credentials }) => {
      // For OAuth providers (like Google), create trial subscription for new users
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });
        
        if (existingUser) {
          user.role = existingUser.role;
        } else {
          // This is a new Google user, we'll create trial subscription in a separate process
          // to avoid blocking the sign-in process
          try {
            const { createTrialSubscription } = await import("~/lib/subscription-utils");
            
            // Schedule trial creation after sign-in completes
            // This ensures the user record exists before creating the subscription
            process.nextTick(() => {
              db.user.findUnique({
                where: { email: user.email! },
              }).then((newUser) => {
                if (newUser) {
                  console.log(`Creating trial subscription for new Google user ${newUser.id}`);
                  return createTrialSubscription(newUser.id);
                }
              }).then(() => {
                console.log(`Trial subscription created for Google user ${user.email}`);
              }).catch((error) => {
                console.error("Error creating trial for Google user:", error);
              });
            });
          } catch (error) {
            console.error("Error setting up trial for new Google user:", error);
          }
        }
      }
      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as UserRole,
      },
    }),
  },
} satisfies NextAuthConfig;
