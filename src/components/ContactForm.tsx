'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { contactAction, type FormResult } from '@/lib/forms';

const field = 'w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-cta';
const label = 'mb-1 block text-sm font-semibold text-gray-700';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-cta px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-cta-hover disabled:opacity-60"
    >
      {pending ? 'Enviando…' : 'Enviar mensaje'}
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<FormResult, FormData>(contactAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className={label}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input id="nombre" name="nombre" required className={field} />
        </div>
        <div>
          <label htmlFor="empresa" className={label}>
            Empresa
          </label>
          <input id="empresa" name="empresa" className={field} />
        </div>
        <div>
          <label htmlFor="email" className={label}>
            Correo <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" required className={field} />
        </div>
        <div>
          <label htmlFor="telefono" className={label}>
            Teléfono
          </label>
          <input id="telefono" name="telefono" type="tel" className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className={label}>
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea id="mensaje" name="mensaje" rows={5} required className={field} />
      </div>

      <Submit />
    </form>
  );
}
