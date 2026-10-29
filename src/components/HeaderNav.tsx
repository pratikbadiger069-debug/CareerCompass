import { useEffect, useRef } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Compass,
  GraduationCap,
  LogOut,
  Map,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function HeaderNav() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLElement>(null);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const userEmail = user?.email ?? "Student";
  const userFullName =
    (user?.user_metadata as Record<string, unknown> | undefined)?.["full_name"] as string | undefined;
  const displayName = userFullName || userEmail.split("@")[0] || "Student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Compass },
    { to: "/roadmap", label: "Roadmap", icon: Map, search: { rec: undefined } },
    { to: "/colleges", label: "Colleges", icon: GraduationCap },
    { to: "/compare", label: "Compare", icon: BarChart3 },
  ];

  // Aeline-style scroll: compact + frosted on scroll
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add("nav-scrolled");
      else nav.classList.remove("nav-scrolled");
    };
    onScroll(); // init
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 w-full border-b border-border/40 bg-charcoal-deep/80 backdrop-blur-xl transition-all duration-400"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 font-display text-base font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all hover:scale-105 hover:bg-primary/25">
            <Compass className="size-5" />
          </div>
          <span className="text-foreground">
            Career<span className="text-primary">Compass</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.to;
            return (
              <Link key={link.to} to={link.to} {...(link.search ? { search: link.search } : {})}>
                <button
                  type="button"
                  className={`group flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(214,253,112,0.25)]"
                      : "text-muted-foreground hover:bg-border/40 hover:text-foreground"
                  }`}
                >
                  <Icon className={`size-3.5 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                  {link.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Edit details — AI pill button */}
          <Link to="/profile" className="hidden sm:block">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-white"
            >
              <Sparkles className="size-3 text-violet-400" />
              Edit details
            </button>
          </Link>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full border border-border/60 bg-white/5 p-1 pl-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/8 focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="User menu"
              >
                <span className="hidden max-w-[100px] truncate text-xs font-medium text-muted-foreground group-hover:text-foreground sm:inline-block">
                  {displayName}
                </span>
                <Avatar className="size-7 border border-primary/20">
                  <AvatarImage
                    src={(user?.user_metadata as Record<string, unknown> | undefined)?.["avatar_url"] as string | undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials || <UserIcon className="size-3.5" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/60 bg-charcoal-mid/95 p-2 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5 px-1 py-0.5">
                  <p className="text-sm font-semibold leading-none text-foreground">{displayName}</p>
                  <p className="max-w-[180px] truncate text-xs leading-none text-muted-foreground">{userEmail}</p>
                  {isGuest && (
                    <span className="mt-1 inline-flex w-fit items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                      Guest
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-border/40" />
              {/* Navigation items (especially helpful on mobile where top nav is hidden) */}
              <DropdownMenuItem asChild className="rounded-lg text-xs font-medium hover:bg-primary/8 hover:text-primary">
                <Link to="/dashboard" className="cursor-pointer gap-2">
                  <Compass className="size-3.5 text-primary" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-xs font-medium hover:bg-primary/8 hover:text-primary">
                <Link to="/roadmap" search={{ rec: undefined }} className="cursor-pointer gap-2">
                  <Map className="size-3.5 text-primary" />
                  My Career Roadmap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-xs font-medium hover:bg-primary/8 hover:text-primary">
                <Link to="/colleges" className="cursor-pointer gap-2">
                  <GraduationCap className="size-3.5 text-primary" />
                  College Explorer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-xs font-medium hover:bg-primary/8 hover:text-primary">
                <Link to="/compare" className="cursor-pointer gap-2">
                  <BarChart3 className="size-3.5 text-primary" />
                  Compare Careers
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-xs font-medium hover:bg-violet-500/10 hover:text-violet-300">
                <Link to="/profile" className="cursor-pointer gap-2">
                  <Sparkles className="size-3.5 text-violet-400" />
                  Edit Profile & AI Inputs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-border/40" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer rounded-lg gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
