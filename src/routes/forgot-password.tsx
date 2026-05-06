import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: Forgot,
  head: () => ({ meta: [{ title: "Reset password — PayRoute AI" }] }),
});

function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("OTP sent — check your email.");
    setStep("otp");
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) { setLoading(false); return toast.error(error.message); }
    const { error: pErr } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (pErr) return toast.error(pErr.message);
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="metric-card p-8">
        <h1 className="text-2xl font-bold mb-2">Reset password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {step === "email" ? "We'll email you a one-time code." : "Enter the code we sent and choose a new password."}
        </p>

        {step === "email" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="otp">6-digit code</Label>
              <Input id="otp" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            </div>
            <div>
              <Label htmlFor="np">New password</Label>
              <Input id="np" type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Verifying..." : "Reset password"}</Button>
            <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setStep("email")}>← Use a different email</button>
          </form>
        )}

        <p className="text-sm text-muted-foreground mt-4 text-center">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
