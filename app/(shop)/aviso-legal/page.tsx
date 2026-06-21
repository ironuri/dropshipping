import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal | Feliu Cosmetics",
};

export default function AvisoLegalPage() {
  return (
    <div className="container py-12 max-w-3xl prose prose-sm">
      <h1>Aviso Legal</h1>
      <p className="text-muted-foreground text-sm">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <h2>1. Datos identificativos</h2>
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa que el titular de este sitio web es:</p>
      <ul>
        <li><strong>Razón social:</strong> Feliu Cosmetics S.L.</li>
        <li><strong>CIF:</strong> [CIF DE TU EMPRESA]</li>
        <li><strong>Domicilio social:</strong> [DIRECCIÓN COMPLETA], [CIUDAD], España</li>
        <li><strong>Email de contacto:</strong> <a href="mailto:info@feliucosmetics.es">info@feliucosmetics.es</a></li>
        <li><strong>Registro Mercantil:</strong> [DATOS DE INSCRIPCIÓN]</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El presente aviso legal regula el acceso y uso del sitio web feliucosmetics.es, cuya titularidad corresponde a Feliu Cosmetics S.L. El acceso al sitio web implica la aceptación de las presentes condiciones de uso.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Todos los contenidos de este sitio web (textos, imágenes, diseño gráfico, código fuente) son propiedad de Feliu Cosmetics S.L. o de sus proveedores, y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
      </p>

      <h2>4. Exclusión de responsabilidad</h2>
      <p>
        Feliu Cosmetics S.L. no se hace responsable de los posibles errores u omisiones en los contenidos del sitio, ni de los daños derivados del uso de los mismos. Nos reservamos el derecho a modificar los contenidos sin previo aviso.
      </p>

      <h2>5. Legislación aplicable y jurisdicción</h2>
      <p>
        El presente aviso legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del consumidor, de conformidad con el artículo 52.3 de la LEC.
      </p>

      <h2>6. Resolución de litigios en línea</h2>
      <p>
        De acuerdo con el Reglamento (UE) 524/2013, los consumidores europeos pueden acceder a la plataforma de resolución de litigios en línea de la UE en:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>
      </p>
    </div>
  );
}
