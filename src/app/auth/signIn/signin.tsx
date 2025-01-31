"use client";

import { handleGoogleSignIn } from "@/lib/googleSignInServerAction";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageKit from "@/components/image";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="relative">
          <ImageKit
            src="/masjid.png"
            w={600}
            h={300}
            alt="Masjid Logo"
            className="w-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        </div>
        <CardHeader className="space-y-1 relative z-10 -mt-6">
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Welcome
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Sign in to access your account
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            onClick={() => handleGoogleSignIn()}
            className="w-full"
          >
            <IconBrandGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
