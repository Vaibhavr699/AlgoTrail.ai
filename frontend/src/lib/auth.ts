import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const user = await res.json();
        // `accessToken` is forwarded into the NextAuth JWT by the jwt callback.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accessToken: user.access_token as string,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    newUser: "/signup",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign-in only (`user`/`account` are undefined on later calls).
      if (account && user) {
        if (account.provider === "credentials") {
          token.id = user.id;
          token.accessToken = (user as { accessToken?: string }).accessToken;
        } else if (account.provider === "google" || account.provider === "github") {
          // Sync the OAuth user into our backend and capture its signed token.
          try {
            const res = await fetch(`${API_URL}/api/auth/oauth`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: account.provider,
                email: user.email,
                name: user.name,
                image: user.image,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              token.id = data.id;
              token.accessToken = data.access_token;
            }
          } catch {
            // Backend sync failed — session still issues; API calls will 401
            // until the next sign-in refreshes the token.
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      (session as { accessToken?: string }).accessToken = token.accessToken as string | undefined;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
