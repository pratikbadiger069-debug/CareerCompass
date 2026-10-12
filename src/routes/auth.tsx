import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
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

type AuthSearch = {
  mode?: "signin" | "signup";
  error?: string | undefined;
  error_description?: string | undefined;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
    error: typeof search["error"] === "string" ? search["error"] : undefined,
    error_description:
      typeof search["error_description"] === "string" ? search["error_description"] : undefined,
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
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseOAuthError(raw: unknown): { title: string; message: string; isConfigError: boolean } {
  let errorText = "";
  if (typeof raw === "string") {
    errorText = raw;
  } else if (raw && typeof raw === "object") {
    if ("message" in raw && typeof (raw as any).message === "string") {
      errorText = (raw as any).message;
    } else if ("msg" in raw && typeof (raw as any).msg === "string") {
      errorText = (raw as any).msg;
    } else if ("error_description" in raw && typeof (raw as any).error_description === "string") {
      errorText = (raw as any).error_description;
    } else {
      try {
        errorText = JSON.stringify(raw);
      } catch {
        errorText = String(raw);
      }
    }
  }

  const isMissingSecret =
    errorText.includes("missing OAuth secret") ||
    errorText.includes("Unsupported provider") ||
    errorText.includes("validation_failed");

  if (isMissingSecret) {
    return {
      title: "Google OAuth Secret Missing",
      message:
        "Google sign-in is not configured with client credentials in Supabase yet. Please sign in using Email & Password or explore via Guest Demo Mode below.",
      isConfigError: true,
    };
  }

  return {
    title: "Authentication Failed",
    message: errorText.replace(/\+/g, " ") || "Google sign-in could not be completed. Please try again.",
    isConfigError: false,
  };
}

function AuthPage() {
  const { mode, error: searchError, error_description: searchErrorDesc } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [oauthConfigError, setOauthConfigError] = useState<string | null>(null);
  const [showOauthGuide, setShowOauthGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    mode === "signup" ? "signup" : "signin",
  );

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

  // Catch search and hash errors from OAuth redirects
  useEffect(() => {
    const rawError = searchErrorDesc || searchError;
    if (rawError) {
      const parsed = parseOAuthError(rawError);
      if (parsed.isConfigError) {
        setOauthConfigError(parsed.message);
        toast.error(parsed.title, {
          description: parsed.message,
          duration: 6000,
        });
      } else {
        toast.error(`Authentication error: ${parsed.message}`);
      }
    }

    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const hashError = params.get("error_description") || params.get("error");
      if (hashError) {
        const parsed = parseOAuthError(hashError);
        if (parsed.isConfigError) {
          setOauthConfigError(parsed.message);
          toast.error(parsed.title, {
            description: parsed.message,
            duration: 6000,
          });
        } else {
          toast.error(`Authentication error: ${parsed.message}`);
        }
      }
    }
  }, [searchError, searchErrorDesc]);

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
      toast.success("Account created! Check your email to confirm your account before signing in.");
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
    setGoogleBusy(true);
    try {
      // 1. Try Lovable's OAuth handler if inside iframe preview
      let isInIframe = false;
      try {
        isInIframe = window.self !== window.top;
      } catch {
        isInIframe = true;
      }

      if (isInIframe) {
        try {
          const result = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin,
          });

          if (result && !result.error) {
            if (result.redirected) return;
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user) {
              toast.success("Signed in with Google!");
              await checkOnboardingAndRedirect(sessionData.session.user.id);
              return;
            }
          } else if (result?.error) {
            console.warn("Lovable OAuth note:", result.error);
          }
        } catch (lovableErr) {
          console.warn("Lovable OAuth fallback to Supabase:", lovableErr);
        }
      }

      // 2. Native Supabase OAuth flow (for standalone, custom domains, or direct browser logins)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const parsed = parseOAuthError(err);
      if (parsed.isConfigError) {
        setOauthConfigError(parsed.message);
        toast.error(parsed.title, {
          description: parsed.message,
          duration: 6000,
        });
      } else {
        toast.error(err instanceof Error ? err.message : parsed.message);
      }
      setGoogleBusy(false);
    }
  }

  async function startDemoMode(): Promise<void> {
    setDemoBusy(true);
    const { error } = await supabase.auth.signInAnonymously();
    setDemoBusy(false);
    if (error) {
      toast.error("Could not start demo mode: " + error.message);
      return;
    }
    toast.success("Welcome to Demo Mode! Your progress will be saved as a guest.");
    navigate({ to: "/dashboard", replace: true });
  }

  const isFormDisabled = busy || googleBusy || demoBusy;

  return (
    <main className="hero-glow dot-grid-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(214, 253, 112, 0.25) 0%, transparent 70%)" }}
      />
      <div className="relative z-10 w-full max-w-md">
        {/* Top Header Bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/35 hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Back
          </Link>
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Compass className="size-4" />
            </div>
            Career<span className="text-primary">Compass</span>
          </Link>
        </div>

        {/* Auth Card — Aeline glass style */}
        <Card className="card-glow-top border-white/10 bg-charcoal-mid/80 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
          <CardHeader className="text-center pb-5">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {activeTab === "signin" ? "Welcome Back" : "Create Your Account"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {activeTab === "signin"
                ? "Sign in to access your personalized AI career roadmap and milestones."
                : "Join thousands of students finding clarity in their education and career journey."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2.5 font-medium border-border/80 bg-background/50 hover:bg-secondary/60 hover:text-foreground transition-all shadow-sm"
              onClick={signInWithGoogle}
              disabled={isFormDisabled}
            >
              {googleBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleMark />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            {/* OAuth Configuration Notice */}
            {oauthConfigError && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-amber-300">Google OAuth Not Configured</p>
                      <button
                        type="button"
                        onClick={() => setOauthConfigError(null)}
                        className="text-amber-400/70 hover:text-amber-200"
                        aria-label="Dismiss notice"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-amber-200/80 leading-relaxed text-[11px]">
                      Supabase is missing the Google OAuth Client Secret. You can sign in immediately using <strong>Email &amp; Password</strong> or <strong>Guest Demo Mode</strong>.
                    </p>
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setShowOauthGuide(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-100 underline underline-offset-2"
                      >
                        <HelpCircle className="size-3" />
                        How to configure Google OAuth in Supabase →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OAuth Setup Guide Modal */}
            <Dialog open={showOauthGuide} onOpenChange={setShowOauthGuide}>
              <DialogContent className="sm:max-w-lg border-white/10 bg-charcoal-mid/95 text-foreground backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <ShieldCheck className="size-5 text-primary" />
                    How to Fix: Google OAuth in Supabase
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Supabase returned <code>Unsupported provider: missing OAuth secret</code> because the Google OAuth Client ID and Secret are not yet configured in your Supabase project.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-xs text-muted-foreground mt-2">
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-1.5">
                    <p className="font-semibold text-foreground text-xs">Step 1: Google Cloud Console</p>
                    <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                      <li>
                        Go to{" "}
                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          Google Cloud Console → Credentials
                        </a>.
                      </li>
                      <li>Create or select an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
                      <li>
                        In <strong>Authorized redirect URIs</strong>, add your Supabase Auth callback URL:
                        <br />
                        <code className="mt-1 inline-block text-[11px] text-primary select-all break-all bg-white/5 px-1.5 py-0.5 rounded font-mono">
                          https://&lt;your-supabase-project&gt;.supabase.co/auth/v1/callback
                        </code>
                      </li>
                      <li>Copy your generated <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-1.5">
                    <p className="font-semibold text-foreground text-xs">Step 2: Supabase Dashboard</p>
                    <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                      <li>
                        Open your project at{" "}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          supabase.com/dashboard
                        </a>.
                      </li>
                      <li>Go to <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Google</strong>.</li>
                      <li>Toggle Google on, paste your <strong>Client ID</strong> and <strong>Client Secret</strong>, and click <strong>Save</strong>.</li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-foreground">
                    <p className="font-semibold text-primary text-xs">Immediate Sign In Options</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      You do not need to configure Google right now — you can register/login with <strong>Email &amp; Password</strong> or click <strong>Try Demo Mode as Guest</strong> below.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center bg-card px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                or with email &amp; password
              </div>
            </div>

            {/* Tabs for Sign In vs Sign Up */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/40 border border-border/40">
                <TabsTrigger
                  value="signin"
                  className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              {/* ─── Sign In Tab ─── */}
              <TabsContent value="signin" className="mt-4">
                <form className="space-y-4" onSubmit={signIn}>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-xs font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={isFormDisabled}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs bg-background/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="text-xs font-semibold">
                        Password
                      </Label>
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
                            <DialogDescription className="text-xs">
                              Enter your account email address and we'll send you a secure password reset link.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email" className="text-xs font-semibold">
                                Email Address
                              </Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="h-10 text-xs"
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
                        disabled={isFormDisabled}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 pr-10 text-xs bg-background/70"
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

                  <Button
                    type="submit"
                    className="w-full h-10 font-semibold shadow-md"
                    disabled={isFormDisabled}
                  >
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
              <TabsContent value="signup" className="mt-4">
                <form className="space-y-4" onSubmit={signUp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      disabled={isFormDisabled}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 text-xs bg-background/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={isFormDisabled}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs bg-background/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isFormDisabled}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 pr-10 text-xs bg-background/70"
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
                      <div className="font-semibold text-muted-foreground mb-1 text-[11px] uppercase tracking-wider">
                        Password Requirements:
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasMinLength ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <X className="size-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={hasMinLength ? "text-emerald-500 font-medium" : "text-muted-foreground"}
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasUppercase && hasLowercase ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <X className="size-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={
                            hasUppercase && hasLowercase
                              ? "text-emerald-500 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          Uppercase &amp; lowercase letters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasNumber ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <X className="size-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={hasNumber ? "text-emerald-500 font-medium" : "text-muted-foreground"}
                        >
                          At least 1 number
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm-password" className="text-xs font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isFormDisabled}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 pr-10 text-xs bg-background/70"
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
                    className="w-full h-10 font-semibold shadow-md"
                    disabled={isFormDisabled || !isPasswordValid || !passwordsMatch}
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

            {/* Guest / Demo Mode Quick Access */}
            <div className="pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                Just exploring CareerCompass?
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startDemoMode}
                disabled={isFormDisabled}
                className="mt-1.5 h-8 gap-1.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {demoBusy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                Try Demo Mode as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
