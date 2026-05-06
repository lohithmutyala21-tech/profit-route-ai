import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings — PayRoute AI" }] }),
});

function Settings() {
  const { user, profile, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) setFullName(profile.full_name ?? "");
  }, [profile]);

  if (!user) return null;

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refresh();
  };

  const changePassword = async () => {
    if (!newPassword) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setNewPassword("");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="metric-card p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div>
          <Label>Email</Label>
          <Input value={user.email ?? ""} disabled />
        </div>
        <div>
          <Label htmlFor="fn">Full name</Label>
          <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <Button onClick={saveProfile} disabled={saving}>Save</Button>
      </div>

      <div className="metric-card p-6 space-y-4">
        <h2 className="font-semibold">Change password</h2>
        <div>
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
        </div>
        <Button onClick={changePassword} disabled={saving || !newPassword}>Update password</Button>
      </div>
    </div>
  );
}
