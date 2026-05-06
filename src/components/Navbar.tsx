import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, company, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="text-sm hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Home</Link>
      {user ? (
        <>
          <Link to="/dashboard" className="text-sm hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Dashboard</Link>
          <Link to="/company" className="text-sm hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Company</Link>
          <Link to="/settings" className="text-sm hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Settings</Link>
        </>
      ) : (
        <>
          <Link to="/login" className="text-sm hover:text-primary transition-colors">Login</Link>
          <Link to="/register" className="text-sm hover:text-primary transition-colors">Register</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-primary/40" />
            <span className="font-bold tracking-tight">PayRoute AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-border/50">
                {company && <span className="text-xs text-muted-foreground">{company.name}</span>}
                <Button size="sm" variant="outline" onClick={handleSignOut}>Sign out</Button>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden flex flex-col gap-3 pb-4">
            <NavLinks />
            {user && (
              <Button size="sm" variant="outline" onClick={handleSignOut}>Sign out</Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
