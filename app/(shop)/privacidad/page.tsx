import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Feliu Cosmetics",
};

export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-3xl prose prose-sm">
      <h1>Política de Privacidad</h1>
      <p className="text-muted-foreground text-sm">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <h2>1. Responsable del tratamiento</h2>
      <p>Feliu Cosmetics S.L. (en adelante, &quot;la empresa&quot;), con CIF [CIF DE TU EMPRESA], domicilio en [DIRECCIÓN COMPLETA], es el responsable del tratamiento de sus datos personales, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).</p>

      <h2>2. Datos que recogemos</h2>
      <ul>
        <li>Datos de identificación: nombre, email, teléfono.</li>
        <li>Datos de dirección de envío.</li>
        <li>Datos de navegación: cookies técnicas y analíticas (con su consentimiento).</li>
        <li>Historial de pedidos.</li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <ul>
        <li>Gestión de pedidos y envíos.</li>
        <li>Atención al cliente.</li>
        <li>Envío de comunicaciones comerciales (solo con consentimiento expreso).</li>
        <li>Cumplimiento de obligaciones legales.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>El tratamiento se basa en (a) la ejecución de un contrato, (b) el cumplimiento de obligaciones legales, y (c) su consentimiento para comunicaciones comerciales.</p>

      <h2>5. Conservación de datos</h2>
      <p>Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad, y en todo caso durante el plazo de prescripción legal aplicable (mínimo 6 años para datos contables).</p>

      <h2>6. Sus derechos</h2>
      <p>Puede ejercer sus derechos de acceso, rectificación, supresión, portabilidad, limitación y oposición enviando un email a <a href="mailto:privacidad@feliucosmetics.es">privacidad@feliucosmetics.es</a>. También puede reclamar ante la AEPD (www.aepd.es).</p>

      <h2>7. Cookies</h2>
      <p>Consulte nuestra <a href="/cookies">política de cookies</a> para información detallada.</p>

      <h2>8. Transferencias internacionales</h2>
      <p>Sus datos pueden ser tratados por prestadores de servicios en países terceros (Stripe, Google, etc.) que ofrecen garantías adecuadas de protección mediante las cláusulas contractuales estándar aprobadas por la Comisión Europea.</p>
    </div>
  );
}
