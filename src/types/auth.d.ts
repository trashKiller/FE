/* eslint-disable no-unused-vars */
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
      error?: string;
    } & DefaultSession["user"];
    accessToken: string;
    error?: string;
  }

  interface User extends DefaultUser {
    accessToken: string;
    jwtExpiredTime: number;
    memberRole: string;
    isAdmin?: boolean;
  }

  interface Token extends DefaultJWT {
    accessToken?: string;
    accessTokenExpires?: number;
    memberRole?: string;
    error?: string;
  }
}
