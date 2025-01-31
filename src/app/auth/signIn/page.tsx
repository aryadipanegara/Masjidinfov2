import { redirect } from "next/navigation";
import { checkIsAuthenticated } from "@/lib/CheckIsAuthenticated";
import type React from "react"; // Import React
import SignInPage from "./signin";

const SignIn: React.FC = async () => {
  const isAuthenticated = await checkIsAuthenticated();

  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <main>
      <SignInPage />
    </main>
  );
};

export default SignIn;
