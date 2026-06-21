import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Feliu Cosmetics Cosmetics",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#2D5016]">🌿 Feliu Cosmetics</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Bienvenida de nuevo</h1>
          <p className="text-muted-foreground">Inicia sesión en tu cuenta</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-[#2D5016] font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
