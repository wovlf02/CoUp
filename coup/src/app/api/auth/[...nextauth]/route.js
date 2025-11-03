// C:/Project/CoUp/coup/src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.accessToken = token.accessToken; // Add accessToken to session
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Sign a JWT with user info
        token.accessToken = jwt.sign(
          { id: user.id, email: user.email, name: user.name, image: user.image },
          process.env.JWT_SECRET, // Use a separate secret for the access token
          { expiresIn: '1h' } // Token expiration
        );
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin", // 사용자 정의 로그인 페이지 경로
    error: "/auth/error", // 사용자 정의 에러 페이지 경로
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
