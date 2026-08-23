"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function handleCredentialsSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Incorrect email or password");
      setPending(false);
      return;
    }

    // Role-based redirect: BUYER → callbackUrl or /, VENDOR → /vendor/dashboard or
    // /vendor/pending, ADMIN → /admin.
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    const vendorStatus = session?.user?.vendorStatus;

    if (role === "ADMIN") router.push("/admin");
    else if (role === "VENDOR")
      router.push(vendorStatus === "APPROVED" ? "/vendor/dashboard" : "/vendor/pending");
    else if (callbackUrl && callbackUrl.startsWith("/"))
      router.push(callbackUrl);
    else router.push("/");

    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Welcome back.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          className="w-full"
          disabled={pending || googlePending}
          onClick={() => {
            setGooglePending(true);
            signIn("google", { callbackUrl: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/" });
          }}
          type="button"
        >
          {googlePending ? "Redirecting…" : "Continue with Google"}
        </Button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <form
          action={handleCredentialsSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          New here?{" "}
          <Link href="/register" className="text-[var(--color-steel)] hover:underline">
            Create an account
          </Link>
          {" · "}
          <Link href="/vendor/register" className="text-[var(--color-steel)] hover:underline">
            Sell with us
          </Link>
          {" · "}
          <Link href="/forgot-password" className="text-[var(--color-steel)] hover:underline">
            Forgot password?
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}