import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Session } from "next-auth";

interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface CustomSession extends Session {
  user: CustomUser;
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }): Promise<CustomSession> {
      if (session?.user) {
        const customSession: CustomSession = {
          ...session,
          user: {
            ...session.user,
            id: token.sub!,
          },
        };
        return customSession;
      }
      return session as CustomSession;
    },
    async jwt({ token }) {
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };