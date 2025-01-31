"use server";

import { auth } from "@/lib/auth";

export const getSession = async () => {
  const session = await auth();
  return session;
};
