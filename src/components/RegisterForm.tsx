'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { registerAction, type FormState } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-cta px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Enviando…' : 'Solicitar cuenta mayorista'}
    </button>
  );
}

const field = 'w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-cta';
const label = 'mb-1 block text-sm font-semibold text-gray-700';

export function RegisterForm() {
  const [state, formAction] = useActionState<FormState, FormData>(registerAction, {});

  if (state.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-green-800">¡Gracias por registrarte!</p>
        <p className="mt-2 text-sm text-green-700">{state.success}</p>
        <Link href="/tienda" className="mt-4 inline-block text-sm font-semibold text-cta hover:underline">
          Explorar el catálogo
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="ruc" className={label}>
          RUC <span className="text-red-500">*</span>
        </label>
        <input id="ruc" name="ruc" inputMode="numeric" required maxLength={11} placeholder="11 dígitos" className={field} />
      </div>

      <div>
        <label htmlFor="razonSocial" className={label}>
          Razón social <span className="text-red-500">*</span>
        </label>
        <input id="razonSocial" name="razonSocial" required className={field} />
      </div>

      <div>
        <label htmlFor="email" className={label}>
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>

      <div>
        <label htmlFor="phone" className={label}>
          Teléfono / WhatsApp
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} />
      </div>

      <div>
        <label htmlFor="password" className={label}>
          Contraseña <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={field}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
      </div>

      <p className="text-xs leading-relaxed text-gray-500">
        Al registrarte aceptas nuestros{' '}
        <Link href="/terminos-y-condiciones" className="text-cta hover:underline">
          Términos y Condiciones
        </Link>{' '}
        y la{' '}
        <Link href="/politica-de-privacidad" className="text-cta hover:underline">
          Política de Privacidad
        </Link>
        .
      </p>

      <SubmitButton />
    </form>
  );
}
