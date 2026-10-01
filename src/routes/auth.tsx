import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

type AuthSearch = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in to CareerCompass — Secure Authentication" },
      {
        name: "description",
        content:
          "Create your CareerCompass account or sign in securely to continue your AI-guided career and education plan.",
      },
      { property: "og:title", content: "Sign in to CareerCompass — Secure Authentication" },
      {
        property: "og:description",
        content: "Create your CareerCompass account or sign in securely to continue your career plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C39.9 36.6 44 31 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(mode === "signup" ? "signup" : "signin");

  // Forgot Password Dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  // Password Strength Rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = password === confirmPassword;

  const checkOnboardingAndRedirect = async (userId: string) => {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.onboarding_completed) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      navigate({ to: "/onboarding", replace: true });
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      checkOnboardingAndRedirect(user.id);
    }
  }, [loading, isAuthenticated, user]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as "signin" | "signup");
    setPassword("");
    setConfirmPassword("");
  };

  async function signIn(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setBusy(false);

    if (error) {
      setPassword("");
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please check your credentials.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (data.user) {
      toast.success("Successfully signed in!");
      await checkOnboardingAndRedirect(data.user.id);
    }
  }

  async function signUp(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please meet all password security requirements.");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: cleanName },
      },
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.session) {
      toast.success("Account created! Check your email to confirm your subscription before signing in.");
      return;
    }

    if (data.user) {
      toast.success("Account created & secured successfully!");
      await checkOnboardingAndRedirect(data.user.id);
    }
  }

  async function handleResetPassword(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setResetBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth?mode=signin`,
    });
    setResetBusy(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Please check your inbox.");
      setResetDialogOpen(false);
      setResetEmail("");
    }
  }

  async function signInWithGoogle(): Promise<void> {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    if (user) {
      await checkOnboardingAndRedirect(user.id);
    } else {
      navigate({ to: "/onboarding", replace: true });
    }
  }

  return (
    <main className="hero-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center font-display text-lg font-bold">
          Career<span className="text-primary">Compass</span>
        </Link>

        <Card className="border-border/60 bg-card/80 backdrop-blur shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle>Secure Authentication</CardTitle>
            <CardDescription>
              Sign in or create a password-protected account to access your career roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full gap-2 font-medium"
              onClick={signInWithGoogle}
              disabled={busy}
            >
              <GoogleMark />
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or with email &amp; password
              <span className="h-px flex-1 bg-border" />
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              {/* ─── Sign In Tab ─── */}
              <TabsContent value="signin">
                <form className="space-y-4 pt-4" onSubmit={signIn}>
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Forgot password?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <KeyRound className="size-5 text-primary" />
                              Reset Your Password
                            </DialogTitle>
                            <DialogDescription>
                              Enter your account email address and we'll send you a secure password reset link.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email Address</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={resetBusy}>
                              {resetBusy ? (
                                <>
                                  <Loader2 className="mr-2 size-4 animate-spin" />
                                  Sending reset link...
                                </>
                              ) : (
                                "Send Reset Link"
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-semibold" disabled={busy}>
                    {busy ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* ─── Sign Up Tab ─── */}
              <TabsContent value="signup">
                <form className="space-y-4 pt-4" onSubmit={signUp}>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Security Strength Checklist */}
                  {password.length > 0 && (
                    <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 space-y-1 text-xs">
                      <div className="font-medium text-muted-foreground mb-1">Password Requirements:</div>
                      <div className="flex items-center gap-1.5">
                        {hasMinLength ? <Check className="size-3.5 text-emerald-500" /> : <X className="size-3.5 text-muted-foreground" />}
                        <span className={hasMinLength ? "text-emerald-500 font-medium" : "text-muted-foreground"}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasUppercase && hasLowercase ? <Check className="size-3.5 text-emerald-500" /> : <X className="size-3.5 text-muted-foreground" />}
                        <span className={hasUppercase && hasLowercase ? "text-emerald-500 font-medium" : "text-muted-foreground"}>Uppercase &amp; lowercase letters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasNumber ? <Check className="size-3.5 text-emerald-500" /> : <X className="size-3.5 text-muted-foreground" />}
                        <span className={hasNumber ? "text-emerald-500 font-medium" : "text-muted-foreground"}>At least 1 number</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <X className="size-3" /> Passwords do not match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-semibold"
                    disabled={busy || !isPasswordValid || !passwordsMatch}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
