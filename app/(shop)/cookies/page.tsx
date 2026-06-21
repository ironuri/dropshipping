import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | Feliu Cosmetics",
};

export default function CookiesPage() {
  return (
    <div className="container py-12 max-w-3xl prose prose-sm">
      <h1>Política de Cookies</h1>
      <p className="text-muted-foreground text-sm">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <p>
        En cumplimiento del artículo 22.2 de la Ley 34/2002, de servicios de la sociedad de la información (LSSI), y del Reglamento (UE) 2016/679 (RGPD), le informamos sobre el uso de cookies en este sitio web.
      </p>

      <h2>¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Permiten que el sitio recuerde sus preferencias y mejoren su experiencia de navegación.
      </p>

      <h2>Cookies que utilizamos</h2>

      <h3>Cookies estrictamente necesarias</h3>
      <p>Son imprescindibles para el funcionamiento del sitio. No requieren su consentimiento.</p>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
        </thead>
        <tbody>
          <tr><td>next-auth.session-token</td><td>Feliu Cosmetics</td><td>Sesión de usuario autenticado</td><td>Sesión</td></tr>
          <tr><td>cookie-consent</td><td>Feliu Cosmetics</td><td>Guardar preferencia de cookies</td><td>1 año</td></tr>
        </tbody>
      </table>

      <h3>Cookies analíticas (opcionales)</h3>
      <p>Nos ayudan a entender cómo se utiliza el sitio. Solo se activan con su consentimiento.</p>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
        </thead>
        <tbody>
          <tr><td>_ga, _ga_*</td><td>Google Analytics</td><td>Estadísticas de uso anónimas</td><td>2 años</td></tr>
        </tbody>
      </table>

      <h2>¿Cómo gestionar las cookies?</h2>
      <p>
        Puede retirar su consentimiento en cualquier momento haciendo clic en el banner de cookies o configurando su navegador para bloquear o eliminar cookies. Tenga en cuenta que deshabilitar algunas cookies puede afectar al funcionamiento del sitio.
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h2>Contacto</h2>
      <p>
        Para cualquier consulta sobre nuestra política de cookies, puede contactarnos en{" "}
        <a href="mailto:privacidad@feliucosmetics.es">privacidad@feliucosmetics.es</a>.
      </p>
    </div>
  );
}
