"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      setSuccess(true);
      // For demo purposes, show the reset link (in production, this would be sent via email)
      setResetLink(`http://localhost:3002/reset-password?email=${email}`);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>
              {success
                ? "Check your email for a reset link"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Password reset initiated for {email}. In production, an email would be sent with the reset link.
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <p className="font-semibold mb-2">Demo Reset Link:</p>
                  <a href={resetLink} className="underline break-all">
                    {resetLink}
                  </a>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

                <Button type="submit" disabled={pending}>
                  {pending ? "Sending..." : "Send reset link"}
                </Button>

                <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                  Remember your password?{" "}
                  <Link href="/login" className="text-[var(--color-steel)] hover:underline">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}