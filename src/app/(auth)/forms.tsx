"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bg } from "@/i18n/bg";
import { loginAction, magicLinkAction, registerAction, type FormState } from "./actions";

const t = bg.auth;
const initial: FormState = {};

function Field({
  name, label, type = "text", error, testId, autoComplete,
}: {
  name: string; label: string; type?: string; error?: string; testId: string; autoComplete?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} autoComplete={autoComplete} data-testid={testId} />
      {error && <p className="text-sm text-destructive" data-testid={`${testId}-error`}>{error}</p>}
    </div>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4" data-testid="login-form">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <Field name="email" label={t.email} type="email" testId="login-email" autoComplete="email" />
      <Field name="password" label={t.password} type="password" testId="login-password" autoComplete="current-password" />
      {state.error && <p className="text-sm text-destructive" data-testid="login-error">{state.error}</p>}
      <Button type="submit" disabled={pending} data-testid="login-submit">{t.submitLogin}</Button>
    </form>
  );
}

export function MagicLinkForm() {
  const [state, action, pending] = useActionState(magicLinkAction, initial);
  return (
    <form action={action} className="space-y-4" data-testid="magic-link-form">
      <Field name="email" label={t.email} type="email" testId="magic-email" error={state.fieldErrors?.email} />
      {state.sent && <p className="text-sm" data-testid="magic-sent">{t.magicLinkSent}</p>}
      <Button type="submit" variant="outline" disabled={pending} data-testid="magic-submit">{t.magicLinkButton}</Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const e = state.fieldErrors;
  return (
    <form action={action} className="space-y-4" data-testid="register-form">
      <Field name="name" label={t.name} testId="register-name" error={e?.name} autoComplete="name" />
      <Field name="email" label={t.email} type="email" testId="register-email" error={e?.email} autoComplete="email" />
      <Field name="phone" label={t.phone} type="tel" testId="register-phone" error={e?.phone} autoComplete="tel" />
      <Field name="password" label={t.password} type="password" testId="register-password" error={e?.password} autoComplete="new-password" />
      {state.error && <p className="text-sm text-destructive" data-testid="register-error">{state.error}</p>}
      <Button type="submit" disabled={pending} data-testid="register-submit">{t.submitRegister}</Button>
    </form>
  );
}
