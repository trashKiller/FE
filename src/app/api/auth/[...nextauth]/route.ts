/* eslint-disable no-param-reassign */
import NextAuth from "next-auth";
import { authOptions } from "./authoption";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
