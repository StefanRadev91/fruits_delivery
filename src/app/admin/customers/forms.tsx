"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admin } from "@/i18n/admin.bg";
import {
  createCustomerAction, resetPasswordAction, updateCustomerAction, type CustomerState,
} from "./actions";

const f = admin.form;
const initial: CustomerState = {};

function Field({
  name, label, type = "text", defaultValue, error, hint, testId,
}: {
  name: string; label: string; type?: string; defaultValue?: string; error?: string; hint?: string; testId: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} data-testid={testId} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive" data-testid={`${testId}-error`}>{error}</p>}
    </div>
  );
}

function TermsSelect({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor="terms">{f.terms}</Label>
      <select
        id="terms" name="terms" defaultValue={defaultValue} data-testid="customer-terms"
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
      >
        <option value="">{f.termsNone}</option>
        {[7, 14, 30].map((d) => <option key={d} value={d}>{f.termsDays(d)}</option>)}
      </select>
    </div>
  );
}

export function NewCustomerForm() {
  const [state, action, pending] = useActionState(createCustomerAction, initial);
  const e = state.fieldErrors;

  if (state.created) {
    const c = state.created;
    const a = admin.created;
    return (
      <div className="space-y-4 rounded-xl border bg-card p-6" data-testid="customer-created">
        <h2 className="text-xl font-bold">{a.title}</h2>
        <p className="text-sm text-muted-foreground">{a.text}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">{a.login}</dt>
          <dd className="font-mono" data-testid="created-email">{c.email}</dd>
          <dt className="text-muted-foreground">{a.password}</dt>
          <dd className="font-mono text-lg font-semibold" data-testid="created-password">{c.password}</dd>
        </dl>
        <div className="flex gap-3">
          <Link href={`/admin/customers/${c.companyId}`}><Button>{a.toCustomer}</Button></Link>
          <Button variant="outline" onClick={() => window.location.reload()}>{a.another}</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="max-w-xl space-y-4" data-testid="customer-form">
      <Field name="companyName" label={f.companyName} testId="customer-name" error={e?.companyName} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="eik" label={f.eik} testId="customer-eik" error={e?.eik} />
        <Field name="vatNumber" label={f.vatNumber} testId="customer-vat" error={e?.vatNumber} />
      </div>
      <Field name="mol" label={f.mol} testId="customer-mol" error={e?.mol} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="contactName" label={f.contactName} testId="customer-contact" error={e?.contactName} />
        <Field name="contactPhone" label={f.contactPhone} type="tel" testId="customer-phone" error={e?.contactPhone} />
      </div>
      <Field name="email" label={f.email} type="email" testId="customer-email" error={e?.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="discount" label={f.discount} defaultValue="0" hint={f.discountHint} testId="customer-discount" error={e?.discount} />
        <TermsSelect />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} data-testid="customer-submit">{f.submit}</Button>
    </form>
  );
}

export function EditCustomerForm({
  companyId, discount, terms,
}: { companyId: string; discount: string; terms: string }) {
  const [state, action, pending] = useActionState(updateCustomerAction.bind(null, companyId), initial);
  return (
    <form action={action} className="max-w-md space-y-4" data-testid="customer-edit-form">
      <Field name="discount" label={f.discount} defaultValue={discount} hint={f.discountHint} testId="customer-discount" error={state.fieldErrors?.discount} />
      <TermsSelect defaultValue={terms} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.saved && <p className="text-sm text-forest" data-testid="customer-saved">{admin.detail.saved}</p>}
      <Button type="submit" disabled={pending} data-testid="customer-save">{f.save}</Button>
    </form>
  );
}

export function ResetPasswordForm({ companyId }: { companyId: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction.bind(null, companyId), initial);
  return (
    <form action={action} className="space-y-3" data-testid="reset-form">
      <Button type="submit" variant="outline" disabled={pending} data-testid="reset-submit">{admin.detail.reset}</Button>
      {state.newPassword && (
        <p>
          {admin.created.password}:{" "}
          <span className="font-mono text-lg font-semibold" data-testid="reset-password">{state.newPassword}</span>
        </p>
      )}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
