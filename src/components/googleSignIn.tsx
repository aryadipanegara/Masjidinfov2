import { signIn } from "@/lib/auth";
import { Button } from "./ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";

const GoogleSignIn = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("Google");
      }}
    >
      <Button className="w-full" variant="outline">
        <IconBrandGoogle />
        contiune with Google
      </Button>
    </form>
  );
};

export { GoogleSignIn };
