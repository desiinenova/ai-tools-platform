"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Button, Card, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import {
  useConfirmTwoFactor,
  useDisableTwoFactor,
  useEnableTwoFactor,
  useRegenerateRecoveryCodes,
} from "@/lib/hooks/useTwoFactor";
import { ApiError } from "@/lib/api";
import type { ValidationErrorBody } from "@/types";

type ViewState = "idle" | "enrolling" | "recovery-codes";

export function TwoFactorSettings() {
  const { data: user } = useCurrentUser();
  const { toast } = useToast();

  const enableTwoFactor = useEnableTwoFactor();
  const confirmTwoFactor = useConfirmTwoFactor();
  const disableTwoFactor = useDisableTwoFactor();
  const regenerateRecoveryCodes = useRegenerateRecoveryCodes();

  const [view, setView] = useState<ViewState>("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [disableOpen, setDisableOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);

  function resetEnrollment() {
    setView("idle");
    setQrDataUrl(null);
    setManualSecret("");
    setCode("");
    setCodeError(undefined);
  }

  function openDisableModal() {
    setPassword("");
    setPasswordError(undefined);
    setDisableOpen(true);
  }

  async function handleStartEnrollment() {
    try {
      const { secret, qr_code_url } = await enableTwoFactor.mutateAsync();
      const dataUrl = await QRCode.toDataURL(qr_code_url);
      setManualSecret(secret);
      setQrDataUrl(dataUrl);
      setView("enrolling");
    } catch {
      toast({ title: "Failed to start two-factor setup.", variant: "error" });
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(undefined);

    try {
      const { recovery_codes } = await confirmTwoFactor.mutateAsync(code);
      setRecoveryCodes(recovery_codes);
      setView("recovery-codes");
      setCode("");
      toast({ title: "Two-factor authentication enabled.", variant: "success" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as ValidationErrorBody;
        setCodeError(body.errors?.code?.[0]);
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "error" });
      }
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(undefined);

    try {
      await disableTwoFactor.mutateAsync(password);
      setDisableOpen(false);
      toast({ title: "Two-factor authentication disabled.", variant: "success" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as ValidationErrorBody;
        setPasswordError(body.errors?.password?.[0]);
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "error" });
      }
    }
  }

  async function handleRegenerate() {
    try {
      const { recovery_codes } = await regenerateRecoveryCodes.mutateAsync();
      setRecoveryCodes(recovery_codes);
      setView("recovery-codes");
      setRegenerateConfirmOpen(false);
      toast({ title: "Recovery codes regenerated.", variant: "success" });
    } catch {
      toast({ title: "Failed to regenerate recovery codes.", variant: "error" });
    }
  }

  function handleCopyCodes() {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast({ title: "Recovery codes copied.", variant: "success" });
  }

  if (!user) {
    return null;
  }

  if (view === "recovery-codes") {
    return (
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Save your recovery codes
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each code can be used once to sign in if you lose access to your authenticator app.
          Store them somewhere safe — they won&apos;t be shown again.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-4 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          {recoveryCodes.map((rc) => (
            <span key={rc}>{rc}</span>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleCopyCodes}>
            Copy codes
          </Button>
          <Button size="sm" onClick={resetEnrollment}>
            Done
          </Button>
        </div>
      </Card>
    );
  }

  if (view === "enrolling") {
    return (
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Set up two-factor authentication
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Scan this QR code with an authenticator app (e.g. Google Authenticator), or enter the
          code below manually.
        </p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- a locally generated data: URL, not a remote image
          <img src={qrDataUrl} alt="Two-factor authentication QR code" className="h-48 w-48" />
        )}
        <p className="break-all rounded-md bg-gray-50 p-2 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {manualSecret}
        </p>
        <form onSubmit={handleConfirm} className="flex flex-col gap-3">
          <Input
            label="Confirmation code"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={codeError}
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={resetEnrollment}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={confirmTwoFactor.isPending}>
              Confirm
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Two-factor authentication
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user.two_factor_enabled
            ? "Enabled — an authentication code is required at login."
            : "Add an extra layer of security to your account using an authenticator app."}
        </p>
      </div>

      {user.two_factor_enabled ? (
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => setRegenerateConfirmOpen(true)}>
            Regenerate recovery codes
          </Button>
          <Button variant="danger" size="sm" onClick={openDisableModal}>
            Disable
          </Button>
        </div>
      ) : (
        <Button size="sm" isLoading={enableTwoFactor.isPending} onClick={handleStartEnrollment}>
          Enable 2FA
        </Button>
      )}

      <Modal
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title="Disable two-factor authentication"
        description="Enter your password to confirm."
      >
        <form onSubmit={handleDisable} className="flex flex-col gap-4">
          <Input
            label="Password"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDisableOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={disableTwoFactor.isPending}>
              Disable
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={regenerateConfirmOpen}
        onOpenChange={setRegenerateConfirmOpen}
        title="Regenerate recovery codes"
        description="Your existing recovery codes will stop working. New codes will be shown once."
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setRegenerateConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            isLoading={regenerateRecoveryCodes.isPending}
            onClick={handleRegenerate}
          >
            Regenerate
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
