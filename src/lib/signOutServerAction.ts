"use server";

import { signOut } from "@/lib/auth";

export const handleSignOut = async () => {
  try {
    await signOut({
      redirectTo: "/auth/signIn",
    });
  } catch (error) {
    throw error;
  }
};
