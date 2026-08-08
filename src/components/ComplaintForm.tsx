'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { complaintAction, type FormResult } from '@/lib/forms';

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
      {pending ? 'Registrando…' : 'Registrar'}
    </button>
  );
}

export function ComplaintForm() {
  const [state, action] = useActionState<FormResult, FormData>(complaintAction, {});

  if (state.success) {
    return (
      <p role="status" className="rounded-md border border-green-200 bg-green-50 px-5 py-6 text-sm text-green-800">
        {state.success}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">
          1. Identificación del consumidor
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className={label}>
              Nombres y apellidos <span className="text-red-500">*</span>
            </label>
            <input id="nombre" name="nombre" required className={field} />
          </div>
          <div>
            <label htmlFor="documento" className={label}>
              DNI / RUC / CE <span className="text-red-500">*</span>
            </label>
            <input id="documento" name="documento" required className={field} />
          </div>
          <div>
            <label htmlFor="email" className={label}>
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input id="email" name="email" type="email" required className={field} />
          </div>
          <div>
            <label htmlFor="telefono" className={label}>
              Teléfono
            </label>
            <input id="telefono" name="telefono" type="tel" className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="direccion" className={label}>
              Domicilio
            </label>
            <input id="direccion" name="direccion" className={field} />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">
          2. Detalle de la reclamación
        </legend>

        <div className="mb-4 flex flex-wrap gap-5">
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="radio" name="tipo" value="reclamo" required className="mt-1" />
            <span>
              <strong>Reclamo</strong>
              <span className="block text-xs text-gray-500">Disconformidad con el producto o servicio.</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="radio" name="tipo" value="queja" className="mt-1" />
            <span>
              <strong>Queja</strong>
              <span className="block text-xs text-gray-500">Disconformidad con la atención recibida.</span>
            </span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="pedido" className={label}>
              N.º de pedido o comprobante
            </label>
            <input id="pedido" name="pedido" className={field} />
          </div>
          <div>
            <label htmlFor="detalle" className={label}>
              Detalle y pedido del consumidor <span className="text-red-500">*</span>
            </label>
            <textarea id="detalle" name="detalle" rows={6} required minLength={20} className={field} />
          </div>
        </div>
      </fieldset>

      <Submit />
    </form>
  );
}
