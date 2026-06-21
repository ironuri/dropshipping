"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 8 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "¡Cuenta creada!", description: "Ya puedes iniciar sesión." });
        router.push("/login");
      } else {
        throw new Error(data.error || "Error al crear la cuenta");
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" required className="mt-1" value={form.name} onChange={set("name")} placeholder="María García" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required className="mt-1" value={form.email} onChange={set("email")} placeholder="tu@email.com" />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" required minLength={8} className="mt-1" value={form.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input id="confirmPassword" type="password" required className="mt-1" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repite la contraseña" />
      </div>
      <p className="text-xs text-muted-foreground">
        Al registrarte aceptas nuestros{" "}
        <a href="/terminos" className="underline hover:text-[#2D5016]">términos y condiciones</a>{" "}
        y la{" "}
        <a href="/privacidad" className="underline hover:text-[#2D5016]">política de privacidad</a>.
      </p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
      </Button>
    </form>
  );
}
