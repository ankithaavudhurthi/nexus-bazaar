"use client";

import { useFormStatus } from "react-dom";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="nav-link text-sm disabled:opacity-50">
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
