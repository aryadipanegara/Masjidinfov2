import { GithubSignIn } from "@/components/githubSignIn";
import { GoogleSignIn } from "@/components/googleSignIn";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div>
      <h1>
        <GithubSignIn />
        <GoogleSignIn />
      </h1>
    </div>
  );
};

export default page;
