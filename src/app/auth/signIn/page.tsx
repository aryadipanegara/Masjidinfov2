import { redirect } from "next/navigation";
import { SignInPage } from "./signin";

const SignIn: React.FC = () => {
  // TODO : Check if user is authenticated
  const isAuthenticated = false; // Contoh
  // const isAuthenticated = await checkIsAuthenticated();

  if (isAuthenticated) {
    redirect("/");
  }
  return <SignInPage />;
};

export default SignIn;
