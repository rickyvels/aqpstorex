'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { loginAction, type FormState } from '@/lib/actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-cta px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Verificando…' : label}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="ruc" className="mb-1 block text-sm font-semibold text-gray-700">
          RUC
        </label>
        <input
          id="ruc"
          name="ruc"
          inputMode="numeric"
          autoComplete="username"
          required
          placeholder="20xxxxxxxxx"
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-cta"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-cta"
        />
      </div>

      <SubmitButton label="Acceder" />

      <p className="text-center text-sm text-gray-500">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="font-semibold text-cta hover:underline">
          Solicítala aquí
        </Link>
      </p>
    </form>
  );
}
