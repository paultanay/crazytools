import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/logo";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CrazyTools" },
      { name: "description", content: "Access your CrazyTools account to save favorite tools and view history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-8">
          <div className="mb-6 text-center">
            <p className="mono text-[11px] uppercase tracking-[0.25em] text-primary">
              {mode === "signin" ? "Access" : "Register"}
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in to your account" : "Create an account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Save favorite tools and access your history from any device.
            </p>
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-md border border-hairline bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="mono relative mb-6 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="relative z-10 bg-surface px-3">or with email</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-hairline" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="auth-email" className="sr-only">
              Email address
            </label>
            <input
              id="auth-email"
              aria-label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-md border border-hairline bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            <label htmlFor="auth-password" className="sr-only">
              Password
            </label>
            <input
              id="auth-password"
              aria-label="Password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength={8}
              required
              className="w-full rounded-md border border-hairline bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account?" : "Already have one?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.35-1.68 3.96-5.5 3.96-3.3 0-6-2.73-6-6.06s2.7-6.06 6-6.06c1.88 0 3.14.8 3.86 1.5l2.64-2.55C16.86 3.36 14.68 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.55 0 9.22-3.9 9.22-9.4 0-.63-.07-1.11-.16-1.6H12z"
      />
    </svg>
  );
}
