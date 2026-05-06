import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [{ title: "Register — PayRoute AI" }] }),
});

function Register() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Signup succeeded but no user returned.");

      // Wait briefly for session
      await new Promise((r) => setTimeout(r, 300));

      // Create company
      const { data: co, error: coErr } = await supabase
        .from("companies")
        .insert({ name: companyName })
        .select()
        .single();
      if (coErr) throw coErr;

      // Link profile
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ company_id: co.id, full_name: fullName })
        .eq("id", userId);
      if (pErr) throw pErr;

      // Assign admin role
      const { error: rErr } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, company_id: co.id, role: "admin" });
      if (rErr) throw rErr;

      toast.success("Welcome to PayRoute AI!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="metric-card p-8">
        <h1 className="text-2xl font-bold mb-2">Create your company</h1>
        <p className="text-sm text-muted-foreground mb-6">You'll be the admin of your new workspace.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company">Company name</Label>
            <Input id="company" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
