"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction, type PasswordState } from "./actions";

const initial: PasswordState = {};

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="max-w-sm space-y-3" data-testid="password-form">
      <h2 className="text-lg font-semibold">Смяна на парола</h2>
      <div className="space-y-1">
        <Label htmlFor="current">Текуща парола</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" data-testid="password-current" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="next">Нова парола (поне 8 символа)</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" data-testid="password-new" />
      </div>
      {state.error && <p className="text-sm text-destructive" data-testid="password-error">{state.error}</p>}
      {state.done && <p className="text-sm text-forest" data-testid="password-done">Паролата е сменена.</p>}
      <Button type="submit" disabled={pending} data-testid="password-submit">Смени паролата</Button>
    </form>
  );
}
