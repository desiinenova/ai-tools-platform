"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login, submitTwoFactorChallenge } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "./AuthShell";

type Step = "credentials" | "two-factor";

export function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { twoFactorRequired } = await login(email, password);

      if (twoFactorRequired) {
        setStep("two-factor");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { message?: string };
        setError(body.message ?? "Invalid credentials.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChallengeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await submitTwoFactorChallenge(code);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { message?: string };
        setError(body.message ?? "The provided code was invalid.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "two-factor") {
    return (
      <AuthShell>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Enter your authentication code
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Check your authenticator app, or use a recovery code.
            </p>
          </div>

          <form onSubmit={handleChallengeSubmit} className="flex flex-col gap-4">
            <Input
              label="Code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <Button type="submit" isLoading={submitting}>
              Verify
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep("credentials");
                setCode("");
                setError(null);
              }}
            >
              Back to login
            </Button>
          </form>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Log in to your account.</p>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <Button type="submit" isLoading={submitting}>
            Log in
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
