import type { ReactNode } from "react";
import OAuthButtonBridge from "@/components/auth/OAuthButtonBridge";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OAuthButtonBridge />
      {children}
    </>
  );
}
