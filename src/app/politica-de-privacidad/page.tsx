import type { Metadata } from 'next';
import { LegalLayout } from '@/components/LegalLayout';
import { site } from '~/site.config';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo tratamos los datos personales de nuestros clientes y visitantes.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="7 de agosto de 2026">
      <p>
        En {site.legalName} (en adelante, «{site.name}»), con RUC {site.ruc} y domicilio en{' '}
        {site.address}, valoramos la privacidad de nuestros clientes y visitantes. Esta política
        explica qué datos personales recopilamos, con qué finalidad y qué derechos te asisten,
        conforme a la Ley N.º 29733, Ley de Protección de Datos Personales, y su reglamento.
      </p>

      <h2>1. Datos que recopilamos</h2>
      <ul>
        <li>
          <strong>Datos de registro:</strong> RUC, razón social, correo electrónico, teléfono y
          contraseña cifrada, necesarios para crear tu cuenta mayorista.
        </li>
        <li>
          <strong>Datos de contacto:</strong> los que nos proporcionas voluntariamente en los
          formularios de contacto o en el libro de reclamaciones.
        </li>
        <li>
          <strong>Datos de navegación:</strong> dirección IP, tipo de navegador y páginas visitadas,
          con fines estadísticos y de seguridad.
        </li>
      </ul>

      <h2>2. Finalidad del tratamiento</h2>
      <ul>
        <li>Validar tu condición de cliente mayorista y habilitar el acceso a precios y stock.</li>
        <li>Gestionar cotizaciones, pedidos, despachos y servicios de post venta.</li>
        <li>Atender consultas, reclamos y solicitudes de soporte técnico.</li>
        <li>Cumplir obligaciones legales, tributarias y contables.</li>
      </ul>

      <h2>3. Base legal y consentimiento</h2>
      <p>
        El tratamiento se sustenta en la ejecución de la relación comercial y en el consentimiento
        que otorgas al registrarte o enviar un formulario. Puedes retirar tu consentimiento en
        cualquier momento, sin efecto retroactivo.
      </p>

      <h2>4. Conservación</h2>
      <p>
        Conservamos tus datos mientras se mantenga la relación comercial y, posteriormente, durante
        los plazos exigidos por la normativa tributaria y comercial aplicable.
      </p>

      <h2>5. Transferencia a terceros</h2>
      <p>
        No vendemos ni cedemos tus datos personales. Podemos compartirlos únicamente con
        proveedores que nos prestan servicios (operadores logísticos, pasarelas de pago, servicios
        de alojamiento y correo), obligados contractualmente a mantener la confidencialidad.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: cifrado en
        tránsito, almacenamiento de contraseñas mediante funciones de derivación de clave y control
        de accesos. Ningún sistema es infalible, por lo que no podemos garantizar seguridad
        absoluta.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Utilizamos una cookie técnica estrictamente necesaria para mantener tu sesión iniciada. No
        se emplea para publicidad ni seguimiento entre sitios. Puedes bloquearla desde tu navegador,
        aunque en ese caso no podrás acceder al área de clientes.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, cancelación y oposición (derechos
        ARCO) escribiendo a{' '}
        <a href={`mailto:${site.email}`} className="text-cta hover:underline">
          {site.email}
        </a>
        , adjuntando copia de tu documento de identidad. Responderemos dentro de los plazos legales.
        Si consideras que tus derechos no fueron atendidos, puedes acudir a la Autoridad Nacional de
        Protección de Datos Personales.
      </p>

      <h2>9. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios normativos u operativos. La versión
        vigente será siempre la publicada en esta página, con su fecha de actualización.
      </p>
    </LegalLayout>
  );
}
