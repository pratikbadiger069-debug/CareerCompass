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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform hover:scale-105">
            <Compass className="size-5" />
          </div>
          <span>
            Career<span className="text-primary">Compass</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.to;
            return (
              <Link key={link.to} to={link.to} {...(link.search ? { search: link.search } : {})}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-2 text-xs font-medium transition-colors ${
                    isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Top-Right Profile Icon & Actions */}
        <div className="flex items-center gap-3">
          <Link to="/profile" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-medium">
              <Sparkles className="size-3.5 text-primary" />
              Edit Details
            </Button>
          </Link>

          {/* Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full border border-border/70 p-1 pl-2 text-left transition hover:border-primary/60 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="User menu"
              >
                <span className="hidden text-xs font-medium text-muted-foreground group-hover:text-foreground sm:inline-block max-w-[100px] truncate">
                  {displayName}
                </span>
                <Avatar className="size-8 border border-primary/20">
                  <AvatarImage src={(user?.user_metadata as Record<string, unknown> | undefined)?.["avatar_url"] as string | undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials || <UserIcon className="size-4" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer gap-2 text-xs font-medium">
                  <UserIcon className="size-4 text-primary" />
                  Edit Profile & Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/roadmap" search={{ rec: undefined }} className="cursor-pointer gap-2 text-xs font-medium">
                  <Map className="size-4 text-primary" />
                  My Career Roadmap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/colleges" className="cursor-pointer gap-2 text-xs font-medium">
                  <GraduationCap className="size-4 text-primary" />
                  Saved Colleges
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
