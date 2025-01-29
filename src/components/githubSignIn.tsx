import { signIn } from "@/lib/auth";
import { IconBrandGithub } from "@tabler/icons-react";
import { Button } from "./ui/button";

const GithubSignIn = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button className="w-full" variant="outline">
        <IconBrandGithub />
        contiune with github
      </Button>
    </form>
  );
};

export { GithubSignIn };
