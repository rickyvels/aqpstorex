import type { Metadata } from 'next';
import { LegalLayout } from '@/components/LegalLayout';
import { site } from '~/site.config';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Condiciones de uso del sitio y de la relación comercial mayorista.',
};

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones" updated="7 de agosto de 2026">
      <p>
        Los presentes términos regulan el uso del sitio web de {site.legalName} («{site.name}») y
        las condiciones de la relación comercial con nuestros clientes mayoristas. Al navegar por el
        sitio o registrarte como cliente, aceptas estas condiciones en su totalidad.
      </p>

      <h2>1. Naturaleza mayorista del servicio</h2>
      <p>
        {site.name} es un distribuidor mayorista y comercializa exclusivamente con personas
        jurídicas o naturales con RUC activo que acrediten actividad comercial. No realizamos ventas
        al consumidor final a través de este sitio.
      </p>

      <h2>2. Registro y cuenta de cliente</h2>
      <ul>
        <li>
          El registro está sujeto a validación. Nos reservamos el derecho de aprobar, rechazar o
          desactivar una cuenta sin expresión de causa.
        </li>
        <li>
          Eres responsable de la confidencialidad de tu contraseña y de toda actividad realizada
          desde tu cuenta. Notifícanos de inmediato cualquier uso no autorizado.
        </li>
        <li>La información que proporciones debe ser veraz, completa y estar actualizada.</li>
      </ul>

      <h2>3. Precios y disponibilidad</h2>
      <ul>
        <li>
          Los precios mostrados son mayoristas, están expresados en soles (S/) y{' '}
          <strong>no incluyen IGV</strong>, salvo indicación expresa.
        </li>
        <li>
          Los precios y el stock son referenciales y pueden variar sin previo aviso por
          fluctuaciones del tipo de cambio, cambios de lista del fabricante o agotamiento de
          existencias. El precio en firme es el consignado en la cotización u orden confirmada.
        </li>
        <li>
          Las imágenes son referenciales. Las especificaciones técnicas son proporcionadas por el
          fabricante y pueden cambiar sin aviso.
        </li>
        <li>
          Nos reservamos el derecho de corregir errores tipográficos en precios o descripciones,
          incluso después de recibida una orden.
        </li>
      </ul>

      <h2>4. Pedidos y pagos</h2>
      <p>
        Todo pedido se considera una oferta de compra sujeta a confirmación por nuestra parte. Las
        condiciones de pago, líneas de crédito y montos mínimos se acuerdan con el asesor comercial
        asignado a cada cliente.
      </p>

      <h2>5. Despacho</h2>
      <p>
        Realizamos despachos a nivel nacional. Los plazos son estimados y dependen del operador
        logístico y del destino. El riesgo sobre la mercadería se transfiere al cliente al momento
        de la entrega al transportista designado, salvo pacto distinto por escrito.
      </p>

      <h2>6. Garantía y devoluciones</h2>
      <ul>
        <li>
          Los productos cuentan con la garantía otorgada por el fabricante o su representante
          autorizado en el Perú, según el plazo y las condiciones de cada marca.
        </li>
        <li>
          La garantía no cubre daños por mal uso, manipulación indebida, sobretensión, humedad,
          caídas ni la apertura del equipo por personal no autorizado.
        </li>
        <li>
          Las devoluciones por error de despacho deben comunicarse dentro de las 48 horas de
          recibida la mercadería, con el producto en su empaque original y sin uso.
        </li>
        <li>
          La gestión de garantías (RMA) se tramita a través de nuestro equipo de post venta.
        </li>
      </ul>

      <h2>7. Propiedad intelectual</h2>
      <p>
        Las marcas, logotipos y nombres comerciales de los productos pertenecen a sus respectivos
        titulares y se muestran únicamente con fines identificativos. El diseño, los textos y la
        estructura de este sitio son propiedad de {site.legalName}.
      </p>

      <h2>8. Limitación de responsabilidad</h2>
      <p>
        {site.name} no será responsable por lucro cesante ni daños indirectos derivados del uso de
        los productos o del sitio. Nuestra responsabilidad se limita, en todo caso, al valor de la
        mercadería objeto del reclamo.
      </p>

      <h2>9. Uso del sitio</h2>
      <p>
        Queda prohibida la extracción automatizada masiva de datos, la ingeniería inversa y
        cualquier uso que pueda afectar la disponibilidad del servicio o los derechos de terceros.
      </p>

      <h2>10. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se
        someterá a la jurisdicción de los jueces y tribunales del distrito judicial de Arequipa.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para consultas sobre estos términos escríbenos a{' '}
        <a href={`mailto:${site.email}`} className="text-cta hover:underline">
          {site.email}
        </a>
        .
      </p>
    </LegalLayout>
  );
}
