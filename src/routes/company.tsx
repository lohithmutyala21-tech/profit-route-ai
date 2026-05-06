import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/company")({
  component: CompanyPage,
  head: () => ({ meta: [{ title: "Company — PayRoute AI" }] }),
});

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  role?: string;
}

function CompanyPage() {
  const { user, company, isAdmin, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setDescription(company.description ?? "");
      setIndustry(company.industry ?? "");
      setAddress(company.address ?? "");
    }
  }, [company]);

  useEffect(() => {
    const load = async () => {
      if (!company) return;
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").eq("company_id", company.id);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("company_id", company.id);
      const merged = (profs ?? []).map((p: any) => ({
        ...p,
        role: roles?.find((r: any) => r.user_id === p.id)?.role ?? "member",
      }));
      setMembers(merged);
    };
    load();
  }, [company]);

  if (!user || !company) return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-muted-foreground">Loading company…</p>
    </div>
  );

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("companies")
      .update({ name, description, industry, address })
      .eq("id", company.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Company updated");
    refresh();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Company Profile</h1>

      <div className="metric-card p-6 space-y-4">
        <h2 className="font-semibold">Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cn">Name</Label>
            <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label htmlFor="ci">Industry</Label>
            <Input id="ci" value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={!isAdmin} />
          </div>
        </div>
        <div>
          <Label htmlFor="ca">Address</Label>
          <Input id="ca" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isAdmin} />
        </div>
        <div>
          <Label htmlFor="cd">Description</Label>
          <Textarea id="cd" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isAdmin} />
        </div>
        {isAdmin && <Button onClick={save} disabled={saving}>Save</Button>}
        {!isAdmin && <p className="text-xs text-muted-foreground">Only admins can edit company details.</p>}
      </div>

      <div className="metric-card p-6">
        <h2 className="font-semibold mb-4">Team Members ({members.length})</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
              <div>
                <p className="font-medium">{m.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md ${m.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
