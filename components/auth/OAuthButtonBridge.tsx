"use client";

import { useEffect } from "react";

export default function OAuthButtonBridge() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const action = target.closest("button, a");

      if (!(action instanceof HTMLElement)) {
        return;
      }

      const label = action.textContent?.trim().toLowerCase();

      if (label === "google") {
        event.preventDefault();
        window.location.assign("/api/auth/oauth/google");
      }

      if (label === "facebook") {
        event.preventDefault();
        window.location.assign("/api/auth/oauth/facebook");
      }
    }

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
