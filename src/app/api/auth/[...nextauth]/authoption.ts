/* eslint-disable no-param-reassign */
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";

import { AuthOptions } from "next-auth";
import { sql } from "@vercel/postgres";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    KakaoProvider({
      clientId: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    NaverProvider({
      clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_KEY,
  callbacks: {
    signIn: async ({ user }) => {
      try {
        await sql`INSERT INTO user_info ("userId") VALUES (${user.id}) ON CONFLICT ("userId") DO NOTHING`;
        const res =
          await sql`SELECT "isAdmin" from user_info where "userId" = ${user.id}`;

        if (res.rowCount === 1 && res.rows[0]?.isAdmin) {
          user.isAdmin = true;
        } else {
          user.isAdmin = false;
        }
      } catch (err) {
        console.error(err);
        return false;
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (token.sub)
        session.user = {
          name: token.name,
          email: token.email,
          image: token.picture,
          id: token.sub,
        };
      return session;
    },
  },
};
