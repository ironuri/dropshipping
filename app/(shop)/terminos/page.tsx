import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | EcoSolar Cosmetics",
};

export default function TermsPage() {
  return (
    <div className="container py-12 max-w-3xl prose prose-sm">
      <h1>Términos y Condiciones</h1>
      <p className="text-muted-foreground text-sm">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <h2>1. Identificación</h2>
      <p>EcoSolar Cosmetics S.L., CIF B-XXXXXXXX, inscrita en el Registro Mercantil de [CIUDAD], Tomo X, Folio X. Email: info@ecosolar.es</p>

      <h2>2. Objeto</h2>
      <p>Estas condiciones regulan la compra de productos de cosmética solar y skincare a través de este sitio web, de conformidad con la Ley 34/2002 (LSSI) y el Real Decreto Legislativo 1/2007 (TRLGDCU).</p>

      <h2>3. Proceso de compra</h2>
      <p>Al confirmar un pedido, el usuario realiza una oferta de compra vinculante. La aceptación se produce con la confirmación por email. Todos los precios incluyen IVA (21%).</p>

      <h2>4. Envíos</h2>
      <ul>
        <li>Envío estándar: 3-5 días laborables — 3,99€ (gratis en pedidos +35€).</li>
        <li>Envío express: 24-48h laborables — 6,99€.</li>
        <li>Los pedidos se gestionan mediante dropshipping desde nuestros proveedores europeos.</li>
      </ul>

      <h2>5. Derecho de desistimiento</h2>
      <p>Dispone de 30 días desde la recepción para devolver cualquier producto sin indicar motivo, según el artículo 102 del TRLGDCU. Los gastos de devolución corren a cargo de EcoSolar Cosmetics para pedidos dentro de España.</p>

      <h2>6. Garantías</h2>
      <p>Todos los productos son originales, procedentes de distribuidores oficiales autorizados. Cumplen con el Reglamento (CE) 1223/2009 sobre productos cosméticos.</p>

      <h2>7. Ley aplicable</h2>
      <p>Estas condiciones se rigen por la legislación española. Para la resolución de disputas en línea, puede acceder a la plataforma ODR de la UE.</p>
    </div>
  );
}
