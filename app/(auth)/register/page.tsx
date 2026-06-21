import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta | Feliu Cosmetics Cosmetics",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#2D5016]">🌿 Feliu Cosmetics</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Crea tu cuenta</h1>
          <p className="text-muted-foreground">Únete y empieza a disfrutar</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-8">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#2D5016] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
