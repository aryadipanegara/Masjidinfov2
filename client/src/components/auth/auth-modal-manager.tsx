"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "./login-dialog";
import { RegisterDialog } from "./register-dialog";

export function AuthModalManager() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <>
      <div className="flex gap-4 p-4">
        <Button onClick={openLogin}>Buka Login</Button>
        <Button onClick={openRegister}>Buka Daftar</Button>
      </div>

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSwitchToRegister={openRegister}
      />
      <RegisterDialog
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onSwitchToLogin={openLogin}
      />
    </>
  );
}
