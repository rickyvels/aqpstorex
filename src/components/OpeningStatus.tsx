'use client';

import { useEffect, useState } from 'react';
import { businessHours, site } from '~/site.config';

type Status = { open: boolean; label: string };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Día de la semana y minutos transcurridos, en la zona horaria del negocio. */
function nowInBusinessZone() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: businessHours.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    day: weekdays[get('weekday')] ?? 0,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

function computeStatus(): Status {
  const { day, minutes } = nowInBusinessZone();

  const today = businessHours.schedule.find((s) => (s.days as readonly number[]).includes(day));
  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) {
      return { open: true, label: `Atendiendo ahora · hasta las ${today.close}` };
    }
    if (minutes < open) return { open: false, label: `Abrimos hoy a las ${today.open}` };
  }

  // Siguiente día con atención, buscando hasta una semana adelante.
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    const slot = businessHours.schedule.find((s) => (s.days as readonly number[]).includes(next));
    if (slot) {
      const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const when = i === 1 ? 'mañana' : names[next];
      return { open: false, label: `Cerrado · abrimos ${when} a las ${slot.open}` };
    }
  }

  return { open: false, label: site.hours };
}

export function OpeningStatus({ className = '' }: { className?: string }) {
  // Se calcula tras montar: el horario depende de la hora real del visitante y
  // hornearlo en el HTML estático daría un estado desfasado.
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    setStatus(computeStatus());
    const timer = setInterval(() => setStatus(computeStatus()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!status) {
    return <span className={className}>{site.hours}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block h-2 w-2 shrink-0 rounded-full ${
          status.open ? 'bg-green-400' : 'bg-amber-400'
        }`}
      />
      {status.label}
    </span>
  );
}
