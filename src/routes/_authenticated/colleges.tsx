import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookmarkCheck,
  BookmarkPlus,
  Building2,
  Check,
  CheckCircle2,
  Filter,
  GraduationCap,
  Layers,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { HeaderNav } from "@/components/HeaderNav";
import { motion } from "framer-motion";
import {
  ALL_INDIAN_COLLEGES,
  isStateMatch,
  isCityMatch,
  type CollegeItem,
} from "@/lib/collegesData";
import {
  INDIAN_STATES,
  INDIAN_STATES_AND_CITIES,
  getUserLocation,
  saveUserLocation,
  type UserLocation,
} from "@/lib/locationData";

type SavedCollege = Tables<"saved_colleges">;

export type CollegesSearch = {
  tab?: "explore" | "compare" | "saved";
  state?: string;
  city?: string;
};

export const Route = createFileRoute("/_authenticated/colleges")({
  validateSearch: (search: Record<string, unknown>): CollegesSearch => {
    const validTabs = ["explore", "compare", "saved"];
    const tab = typeof search.tab === "string" && validTabs.includes(search.tab)
      ? (search.tab as "explore" | "compare" | "saved")
      : "explore";
    return {
      tab,
      state: typeof search.state === "string" ? search.state : undefined,
      city: typeof search.city === "string" ? search.city : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "CareerCompass — College Explorer & Comparison" },
      {
        name: "description",
        content:
          "Explore and compare colleges in India based on your state, city, entrance exams, and career pathways.",
      },
      { property: "og:title", content: "CareerCompass — College Explorer" },
    ],
  }),
  component: CollegesPage,
});

const CATEGORIES = [
  "All",
  "Engineering",
  "Management",
  "Commerce",
  "Medical",
  "Law",
  "Design",
  "Science",
  "Arts",
];

function CollegesPage() {
  const { user, isGuest } = useAuth();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const prefersReduced = usePrefersReducedMotion();

  // Active Tab: "explore" | "compare" | "saved"
  const [activeTab, setActiveTab] = useState<"explore" | "compare" | "saved">(
    searchParams.tab || "explore",
  );

  // User Profile & Location
  const [userProfile, setUserProfile] = useState<Tables<"user_profiles"> | null>(null);
  const [savedUserLoc, setSavedUserLoc] = useState<UserLocation | null>(null);

  // Filters State
  const [filterState, setFilterState] = useState<string>("ALL");
  const [filterCity, setFilterCity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterMode, setFilterMode] = useState<"strict" | "all">("strict");

  // Colleges Data
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [extractedRecColleges, setExtractedRecColleges] = useState<CollegeItem[]>([]);
  const [userStage, setUserStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Comparison Selection (limit 4)
  const [selectedForCompare, setSelectedForCompare] = useState<CollegeItem[]>([]);

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);
  const cardHover = getCardHover(prefersReduced);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    if (searchParams.tab && searchParams.tab !== activeTab) {
      setActiveTab(searchParams.tab);
    }
  }, [searchParams.tab]);

  const handleTabChange = (newTab: "explore" | "compare" | "saved") => {
    setActiveTab(newTab);
    navigate({
      search: (prev) => ({
        ...prev,
        tab: newTab,
      }),
    });
  };

  // 1. Initial Load: Profile, Saved Colleges, Career Recs
  const loadData = async () => {
    setLoading(true);
    try {
      let resolvedLoc: UserLocation | null = null;

      if (user && !isGuest) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile(profile);
          setUserStage(profile.education_stage);
          resolvedLoc = getUserLocation(user, profile);
        } else {
          resolvedLoc = getUserLocation(user, null);
        }

        // Fetch saved colleges
        const { data: savedData, error: savedErr } = await supabase
          .from("saved_colleges")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (savedErr) console.error("[Colleges] Error loading saved colleges:", savedErr);
        setSavedColleges(savedData ?? []);

        // Fetch career recommendations
        const { data: recsData, error: recsErr } = await supabase
          .from("career_recommendations")
          .select("*")
          .eq("user_id", user.id);

        if (recsErr) console.error("[Colleges] Error loading recommendations:", recsErr);

        const recColleges: CollegeItem[] = [];
        (recsData ?? []).forEach((rec) => {
          const list = (rec as Record<string, unknown>).colleges as Array<Record<string, unknown>> | undefined;
          (list ?? []).forEach((col, idx) => {
            if (col && (col.name || col.college_name)) {
              const cName = String(col.name ?? col.college_name ?? "Institution");
              const cCity = String(col.city ?? "India");
              // Parse state from city string if formatted as "City, State"
              const parts = cCity.split(",").map((s) => s.trim());
              const cityName = parts[0] || cCity;
              const stateName = parts[1] || "";

              recColleges.push({
                id: `rec-${rec.id}-${idx}`,
                name: cName,
                course: String(col.course ?? col.program ?? "Degree Program"),
                city: cityName,
                state: stateName,
                fees_total: String(col.fees_total ?? col.tuition_estimate ?? "Varies"),
                entrance: String(col.entrance ?? col.application_deadline ?? "Direct / Entrance Exam"),
                why: String(col.why ?? col.notes ?? `Matches your career recommendation: ${rec.career_title}`),
                category: "Science",
                rating: "4.7/5",
                careerTitle: rec.career_title,
              });
            }
          });
        });
        setExtractedRecColleges(recColleges);
      } else {
        resolvedLoc = getUserLocation(null, null);
      }

      setSavedUserLoc(resolvedLoc);

      // Pre-fill location filters if passed in searchParams or from saved location
      if (searchParams.state) {
        setFilterState(searchParams.state);
        if (searchParams.city) {
          setFilterCity(searchParams.city);
        }
      } else if (resolvedLoc?.state) {
        setFilterState(resolvedLoc.state);
        if (resolvedLoc.city) {
          setFilterCity(resolvedLoc.city);
        }
      }
    } catch (err) {
      console.error("[Colleges] Error during initialization:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isGuest]);

  // Combine static colleges and extracted AI recommendation colleges
  const allColleges = useMemo<CollegeItem[]>(() => {
    const list: CollegeItem[] = [...extractedRecColleges];
    const existingNames = new Set(list.map((c) => c.name.toLowerCase()));

    for (const c of ALL_INDIAN_COLLEGES) {
      if (!existingNames.has(c.name.toLowerCase())) {
        list.push(c);
      }
    }
    return list;
  }, [extractedRecColleges]);

  // Filter Colleges strictly based on location, category, and search query
  const { displayedColleges, isCityFallback } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const effectiveState = filterState !== "ALL" ? filterState : null;
    const effectiveCity = filterCity !== "ALL" ? filterCity : null;

    // Helper to test category and search query
    const matchesCategoryAndQuery = (c: CollegeItem) => {
      if (selectedCategory !== "All" && c.category !== selectedCategory) {
        return false;
      }
      if (query) {
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesCourse = c.course.toLowerCase().includes(query);
        const matchesCity = c.city.toLowerCase().includes(query);
        const matchesState = c.state.toLowerCase().includes(query);
        const matchesEntrance = c.entrance.toLowerCase().includes(query);
        const matchesWhy = c.why.toLowerCase().includes(query);
        if (!matchesName && !matchesCourse && !matchesCity && !matchesState && !matchesEntrance && !matchesWhy) {
          return false;
        }
      }
      return true;
    };

    // 1. Strict location filter: when state is selected, NEVER show colleges of other states
    if (effectiveState) {
      // First try matching both state and city
      let stateColleges = allColleges.filter(
        (c) => isStateMatch(c.state, effectiveState) && matchesCategoryAndQuery(c),
      );

      if (effectiveCity) {
        const cityColleges = stateColleges.filter((c) => isCityMatch(c.city, effectiveCity));
        if (cityColleges.length > 0) {
          return {
            displayedColleges: cityColleges.sort((a, b) => {
              let scoreA = a.careerTitle ? 10 : 0;
              let scoreB = b.careerTitle ? 10 : 0;
              return scoreB - scoreA;
            }),
            isCityFallback: false,
          };
        }
        // If 0 colleges in that specific city, fall back to state colleges and notify
        return {
          displayedColleges: stateColleges.sort((a, b) => {
            let scoreA = a.careerTitle ? 10 : 0;
            let scoreB = b.careerTitle ? 10 : 0;
            return scoreB - scoreA;
          }),
          isCityFallback: true,
        };
      }

      return {
        displayedColleges: stateColleges.sort((a, b) => {
          let scoreA = a.careerTitle ? 10 : 0;
          let scoreB = b.careerTitle ? 10 : 0;
          return scoreB - scoreA;
        }),
        isCityFallback: false,
      };
    }

    // 2. All India view: filter only by category and search query
    const filtered = allColleges.filter(matchesCategoryAndQuery);

    // If user has saved location, prioritize their home state at top of All India view
    const sorted = filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (savedUserLoc?.city) {
        if (isCityMatch(a.city, savedUserLoc.city)) scoreA += 100;
        if (isCityMatch(b.city, savedUserLoc.city)) scoreB += 100;
      }

      if (savedUserLoc?.state) {
        if (isStateMatch(a.state, savedUserLoc.state)) scoreA += 40;
        if (isStateMatch(b.state, savedUserLoc.state)) scoreB += 40;
      }

      if (a.careerTitle) scoreA += 10;
      if (b.careerTitle) scoreB += 10;

      return scoreB - scoreA;
    });

    return { displayedColleges: sorted, isCityFallback: false };
  }, [allColleges, filterState, filterCity, searchQuery, selectedCategory, savedUserLoc]);

  // Handle Location Reset to User Saved Location
  const handleResetToUserLocation = () => {
    if (savedUserLoc) {
      setFilterState(savedUserLoc.state);
      setFilterCity(savedUserLoc.city);
      toast.info(`Location set to your saved profile: ${savedUserLoc.city}, ${savedUserLoc.state}`);
    } else {
      setFilterState("ALL");
      setFilterCity("ALL");
      toast.info("No saved profile location. Showing all colleges across India.");
    }
  };

  // Handle Save Current Location as Default Profile Location
  const handleSaveAsDefaultLocation = async () => {
    if (!user || isGuest) {
      toast.error("Please sign in to save your default location.");
      return;
    }
    if (filterState === "ALL" || filterCity === "ALL") {
      toast.error("Please select a specific State and City first.");
      return;
    }

    setIsSavingLocation(true);
    try {
      const res = await saveUserLocation(supabase, user.id, filterState, filterCity);
      if (res.success) {
        setSavedUserLoc({ state: filterState, city: filterCity });
        toast.success(`Saved ${filterCity}, ${filterState} as your default location!`);
      } else {
        toast.error(res.error || "Failed to update location.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not save location.");
    } finally {
      setIsSavingLocation(false);
    }
  };

  // Comparison Management
  const isSelectedForCompare = (col: CollegeItem) => {
    return selectedForCompare.some(
      (item) => item.id === col.id || item.name.toLowerCase() === col.name.toLowerCase(),
    );
  };

  const handleToggleCompare = (col: CollegeItem) => {
    if (isSelectedForCompare(col)) {
      setSelectedForCompare((prev) =>
        prev.filter((item) => item.id !== col.id && item.name.toLowerCase() !== col.name.toLowerCase()),
      );
      toast.info(`Removed ${col.name} from comparison.`);
    } else {
      if (selectedForCompare.length >= 4) {
        toast.warning("You can compare up to 4 colleges at a time. Remove one to add another.");
        return;
      }
      setSelectedForCompare((prev) => [...prev, col]);
      toast.success(`Added ${col.name} to comparison!`);
    }
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
    toast.info("Comparison list cleared.");
  };

  // Save college to database
  const handleSaveCollege = async (col: CollegeItem) => {
    if (!user?.id || isGuest) {
      toast.error("Please sign in to save colleges.");
      return;
    }

    setSavingId(col.id);
    try {
      const { error } = await supabase.from("saved_colleges").insert({
        user_id: user.id,
        college_name: col.name,
        program: col.course,
        city: `${col.city}, ${col.state}`,
        tuition_estimate: col.fees_total,
        application_deadline: col.entrance,
        notes: col.why,
      });

      if (error) {
        toast.error(`Failed to save college: ${error.message}`);
      } else {
        toast.success(`Saved ${col.name} to your target list!`);
        await loadData();
      }
    } catch (err) {
      console.error("[Colleges] Error saving college:", err);
      toast.error("Could not save college. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  // Remove saved college
  const handleRemoveSavedCollege = async (savedId: string, name: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("saved_colleges")
        .delete()
        .eq("id", savedId)
        .eq("user_id", user.id);

      if (error) {
        toast.error(`Failed to remove college: ${error.message}`);
      } else {
        toast.success(`Removed ${name} from your list.`);
        setSavedColleges((prev) => (prev ?? []).filter((item) => item.id !== savedId));
      }
    } catch (err) {
      console.error("[Colleges] Error deleting saved college:", err);
      toast.error("Could not remove college.");
    }
  };

  const isCollegeSaved = (name: string) => {
    return (savedColleges ?? []).some(
      (s) => s.college_name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  };

  // Available cities for selected filter state
  const availableCities = useMemo(() => {
    if (filterState === "ALL") return [];
    return INDIAN_STATES_AND_CITIES[filterState] ?? [];
  }, [filterState]);

  return (
    <div className="min-h-screen bg-charcoal-deep hero-glow dot-grid-bg text-foreground pb-28">
      <HeaderNav />

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="mb-6 border-b border-white/8 pb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">College Explorer & Comparer</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Filter by your location, discover verified institutions & compare options side-by-side.
                </p>
              </div>
            </div>

            {/* Quick Profile Location Status Indicator */}
            <div className="flex items-center gap-2">
              {savedUserLoc ? (
                <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-xs text-primary">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <span className="font-medium">
                    Profile Location: <strong>{savedUserLoc.city}, {savedUserLoc.state}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span>Location: <strong>All India</strong></span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Navigation Tabs ─── */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => handleTabChange(val as "explore" | "compare" | "saved")}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-3">
            <TabsList className="bg-card/80 border border-border/60 p-1">
              <TabsTrigger value="explore" className="gap-2 text-xs px-4">
                <Building2 className="size-3.5" />
                Explore Colleges
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {displayedColleges.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="compare" className="gap-2 text-xs px-4">
                <BarChart3 className="size-3.5" />
                Compare Colleges
                {selectedForCompare.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 font-bold">
                    {selectedForCompare.length}/4
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="saved" className="gap-2 text-xs px-4">
                <BookmarkCheck className="size-3.5" />
                Saved Colleges
                <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">
                  {savedColleges.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {activeTab === "compare" && selectedForCompare.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCompare}
                className="gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-3.5" /> Clear Comparison
              </Button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: EXPLORE COLLEGES
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="explore" className="space-y-6 mt-0">
            {/* Location & Search Control Bar */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Location Selection Controls */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <MapPin className="size-4 text-primary" />
                      <span>Select Location:</span>
                    </div>

                    {/* State Selector */}
                    <div className="w-44">
                      <Select
                        value={filterState}
                        onValueChange={(val) => {
                          setFilterState(val);
                          setFilterCity("ALL");
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="ALL" className="text-xs">
                            All India (All States)
                          </SelectItem>
                          {INDIAN_STATES.map((st) => (
                            <SelectItem key={st} value={st} className="text-xs">
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dependent City Selector */}
                    <div className="w-44">
                      <Select
                        value={filterCity}
                        onValueChange={setFilterCity}
                        disabled={filterState === "ALL"}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder={filterState === "ALL" ? "Select State first" : "All Cities"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="ALL" className="text-xs">
                            All Cities in {filterState}
                          </SelectItem>
                          {availableCities.map((ct) => (
                            <SelectItem key={ct} value={ct} className="text-xs">
                              {ct}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reset to User Location Button */}
                    {savedUserLoc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetToUserLocation}
                        className="h-8 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                        title="Use location from your saved profile"
                      >
                        <RotateCcw className="size-3" />
                        Use My Profile Location
                      </Button>
                    )}
                  </div>

                  {/* Location Action & Scope Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {filterState !== "ALL" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setFilterState("ALL");
                          setFilterCity("ALL");
                          toast.info("Showing all colleges across India.");
                        }}
                        className="h-7 text-[11px] gap-1 px-2.5 font-medium"
                      >
                        <Globe2 className="size-3 text-muted-foreground" />
                        Show All India Colleges
                      </Button>
                    ) : (
                      savedUserLoc && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetToUserLocation}
                          className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <MapPin className="size-3" />
                          Filter to My Location ({savedUserLoc.city})
                        </Button>
                      )
                    )}

                    {user && !isGuest && filterState !== "ALL" && filterCity !== "ALL" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveAsDefaultLocation}
                        disabled={isSavingLocation}
                        className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        title="Save this location to your student profile"
                      >
                        <Check className="size-3" />
                        Save as Default
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search colleges by name, branch, course, or entrance exam (e.g. JEE, CUET, NEET)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 pl-9 text-xs bg-background"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className={`h-7 px-2.5 text-[11px] ${
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "border-border/60 hover:bg-muted"
                        }`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* City Fallback Notice */}
            {isCityFallback && filterState !== "ALL" && filterCity !== "ALL" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-amber-400" />
                  <span>
                    No specific colleges found in <strong>{filterCity}</strong> yet. Showing all {displayedColleges.length} premier colleges across <strong>{filterState}</strong>.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterCity("ALL")}
                  className="h-6 text-[10px] text-amber-300 hover:text-white"
                >
                  Clear City Filter
                </Button>
              </div>
            )}

            {/* Current Active Location Filter Banner */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Showing:</span>
                <Badge variant="outline" className="gap-1 border-primary/30 text-foreground bg-primary/5">
                  <MapPin className="size-3 text-primary" />
                  {filterState === "ALL"
                    ? "All India"
                    : filterCity === "ALL"
                      ? `${filterState}`
                      : `${filterCity}, ${filterState}`}
                </Badge>
                {selectedCategory !== "All" && (
                  <Badge variant="outline" className="border-border/60">
                    {selectedCategory}
                  </Badge>
                )}
                <span>({displayedColleges.length} colleges found)</span>
              </div>

              {selectedForCompare.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTabChange("compare")}
                  className="h-7 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
                >
                  <BarChart3 className="size-3.5" />
                  View Comparison ({selectedForCompare.length}/4)
                </Button>
              )}
            </div>

            {/* Colleges Grid */}
            {loading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
              </div>
            ) : displayedColleges.length === 0 ? (
              <Card className="border-dashed border-border/70 bg-card/40 p-12 text-center">
                <CardContent className="space-y-3 p-0">
                  <Building2 className="mx-auto size-12 text-muted-foreground/40" />
                  <h3 className="text-base font-bold text-foreground">No colleges match your criteria</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Try switching location to &quot;All India&quot;, selecting another state/city, or clearing your category and search filters.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterState("ALL");
                        setFilterCity("ALL");
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setFilterMode("prioritize");
                      }}
                      className="gap-2 text-xs"
                    >
                      <RotateCcw className="size-3.5" /> Reset All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {displayedColleges.map((col) => {
                  const saved = isCollegeSaved(col.name);
                  const inCompare = isSelectedForCompare(col);

                  // Detect location match
                  const isCityMatch =
                    (filterCity !== "ALL" && col.city.toLowerCase() === filterCity.toLowerCase()) ||
                    (Boolean(savedUserLoc?.city) && col.city.toLowerCase() === savedUserLoc?.city.toLowerCase());

                  const isStateMatch =
                    (filterState !== "ALL" && col.state.toLowerCase() === filterState.toLowerCase()) ||
                    (Boolean(savedUserLoc?.state) && col.state.toLowerCase() === savedUserLoc?.state.toLowerCase());

                  return (
                    <motion.div
                      key={col.id}
                      variants={fadeUp}
                      whileHover={cardHover.whileHover}
                      className={`flex flex-col h-full justify-between rounded-2xl border bg-card/85 p-5 shadow-sm transition-all ${
                        inCompare
                          ? "ring-2 ring-primary border-primary/60 bg-primary/5"
                          : isCityMatch
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : isStateMatch
                              ? "border-primary/40 bg-card/90"
                              : "border-border/70"
                      }`}
                    >
                      <div>
                        {/* Header Badges: Location Match & Category */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isCityMatch ? (
                              <Badge className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5">
                                <MapPin className="mr-1 size-2.5" /> In Your City
                              </Badge>
                            ) : isStateMatch ? (
                              <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-medium px-2 py-0.5">
                                <MapPin className="mr-1 size-2.5" /> In Your State
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
                                {col.state || "India"}
                              </Badge>
                            )}

                            {col.category && (
                              <Badge variant="secondary" className="text-[10px]">
                                {col.category}
                              </Badge>
                            )}
                          </div>

                          {col.rating && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              {col.rating}
                            </span>
                          )}
                        </div>

                        {/* Career Alignment Badge */}
                        {col.careerTitle && (
                          <div className="mb-2">
                            <span className="ai-badge text-[10px]">
                              <Sparkles className="size-2.5 mr-1" />
                              {col.careerTitle}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-base font-bold text-foreground leading-snug">
                          {col.name}
                        </h3>

                        {/* Course */}
                        <p className="mt-1 text-xs font-semibold text-primary">{col.course}</p>

                        {/* Key Attributes Box */}
                        <div className="mt-3.5 space-y-1.5 rounded-xl bg-muted/40 p-3 text-xs border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium text-foreground flex items-center gap-1">
                              <MapPin className="size-3 text-muted-foreground/70" />
                              {col.city}{col.state ? `, ${col.state}` : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Tuition / Fees:</span>
                            <span className="font-medium text-foreground">{col.fees_total}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Entrance Exam:</span>
                            <span className="font-semibold text-primary">{col.entrance}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {col.why}
                        </p>
                      </div>

                      {/* Card Actions: Compare Checkbox + Save Button */}
                      <div className="mt-5 space-y-2 pt-2 border-t border-border/40">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Compare Toggle Button */}
                          <Button
                            type="button"
                            variant={inCompare ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleToggleCompare(col)}
                            className={`h-8 gap-1.5 text-xs font-medium transition-all ${
                              inCompare
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                                : "hover:border-primary/50"
                            }`}
                          >
                            {inCompare ? (
                              <>
                                <CheckCircle2 className="size-3.5" /> Comparing
                              </>
                            ) : (
                              <>
                                <BarChart3 className="size-3.5 text-muted-foreground" /> + Compare
                              </>
                            )}
                          </Button>

                          {/* Save College Button */}
                          <Button
                            onClick={() => handleSaveCollege(col)}
                            disabled={saved || savingId === col.id}
                            variant={saved ? "outline" : "default"}
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                          >
                            {saved ? (
                              <>
                                <BookmarkCheck className="size-3.5 text-emerald-500" /> Saved
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="size-3.5" /> Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: COMPARE COLLEGES (SIDE-BY-SIDE MATRIX)
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="compare" className="space-y-6 mt-0">
            {selectedForCompare.length < 2 ? (
              <Card className="border-dashed border-border/70 bg-card/50 p-12 text-center shadow-lg">
                <CardContent className="space-y-4 p-0 max-w-lg mx-auto">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <BarChart3 className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Select at least 2 colleges to compare side-by-side
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      You currently have <strong>{selectedForCompare.length}</strong> college(s) selected. Browse the College Explorer to pick up to 4 target universities and analyze fees, entrance criteria, location advantages, and program details.
                    </p>
                  </div>

                  {selectedForCompare.length === 1 && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs inline-flex items-center gap-2">
                      <Check className="size-3.5 text-primary" />
                      <span>Currently selected: <strong>{selectedForCompare[0].name}</strong></span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      onClick={() => handleTabChange("explore")}
                      className="w-full sm:w-auto gap-2 text-xs font-semibold"
                    >
                      <Building2 className="size-4" /> Browse & Select Colleges
                    </Button>

                    {allColleges.length >= 2 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const autoPick = allColleges.slice(0, 3);
                          setSelectedForCompare(autoPick);
                          toast.success("Added 3 top recommended colleges for comparison!");
                        }}
                        className="w-full sm:w-auto gap-2 text-xs"
                      >
                        <Sparkles className="size-3.5 text-violet-400" />
                        Quick Compare Top 3 Recommendations
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Comparison Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card/60 border border-border/60 rounded-xl p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">
                        Side-by-Side Comparison ({selectedForCompare.length} of 4 max)
                      </h2>
                      <span className="ai-badge">Real Data</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Comparing courses, fees, entrance exams, and location compatibility.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTabChange("explore")}
                      className="gap-1.5 text-xs"
                    >
                      <Building2 className="size-3.5" /> Add More Colleges
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCompare}
                      className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Clear All
                    </Button>
                  </div>
                </div>

                {/* Side-by-Side Responsive Comparison Grid */}
                <div className="overflow-x-auto pb-4">
                  <div
                    className="grid gap-4 min-w-[700px]"
                    style={{
                      gridTemplateColumns: `repeat(${selectedForCompare.length}, minmax(260px, 1fr))`,
                    }}
                  >
                    {selectedForCompare.map((col) => {
                      const saved = isCollegeSaved(col.name);
                      const isCityMatch =
                        savedUserLoc?.city && col.city.toLowerCase() === savedUserLoc.city.toLowerCase();
                      const isStateMatch =
                        savedUserLoc?.state && col.state.toLowerCase() === savedUserLoc.state.toLowerCase();

                      return (
                        <Card
                          key={col.id}
                          className="border-border/80 bg-card/90 shadow-lg flex flex-col justify-between overflow-hidden"
                        >
                          {/* Card Header with remove action */}
                          <div className="p-4 border-b border-border/50 bg-white/5 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {col.category || "Institution"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleCompare(col)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                title="Remove from comparison"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>

                            <h3 className="font-bold text-sm text-foreground leading-snug">
                              {col.name}
                            </h3>

                            {col.rating && (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                {col.rating} Rating
                              </div>
                            )}
                          </div>

                          <CardContent className="p-4 space-y-4 text-xs divide-y divide-border/30">
                            {/* Attribute: Location */}
                            <div className="pt-2">
                              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                                Location & Proximity
                              </span>
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <MapPin className="size-3.5 text-primary shrink-0" />
                                <span>{col.city}, {col.state}</span>
                              </div>
                              {isCityMatch ? (
                                <Badge className="mt-1.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                                  Matches Your Home City
                                </Badge>
                              ) : isStateMatch ? (
                                <Badge className="mt-1.5 bg-primary/15 text-primary border-primary/25 text-[10px]">
                                  In Your Home State
                                </Badge>
                              ) : null}
                            </div>

                            {/* Attribute: Course / Program */}
                            <div className="pt-3">
                              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                                Flagship Program / Course
                              </span>
                              <p className="font-semibold text-primary">{col.course}</p>
                            </div>

                            {/* Attribute: Estimated Tuition */}
                            <div className="pt-3">
                              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                                Total Tuition / Fees
                              </span>
                              <p className="font-bold text-foreground">{col.fees_total}</p>
                            </div>

                            {/* Attribute: Entrance Exam */}
                            <div className="pt-3">
                              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                                Admission / Entrance Exam
                              </span>
                              <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary bg-primary/5">
                                {col.entrance}
                              </Badge>
                            </div>

                            {/* Attribute: Key Highlights & Why */}
                            <div className="pt-3">
                              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                                Why Recommended / Highlights
                              </span>
                              <p className="text-muted-foreground leading-relaxed text-[11px]">
                                {col.why}
                              </p>
                            </div>

                            {/* Attribute: Career Alignment */}
                            {col.careerTitle && (
                              <div className="pt-3">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                                  Path Fit
                                </span>
                                <span className="ai-badge text-[10px]">
                                  {col.careerTitle}
                                </span>
                              </div>
                            )}
                          </CardContent>

                          {/* Footer Action */}
                          <div className="p-4 border-t border-border/50 bg-card">
                            <Button
                              onClick={() => handleSaveCollege(col)}
                              disabled={saved || savingId === col.id}
                              variant={saved ? "outline" : "default"}
                              size="sm"
                              className="w-full gap-2 text-xs"
                            >
                              {saved ? (
                                <>
                                  <BookmarkCheck className="size-3.5 text-emerald-500" /> Saved Target
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="size-3.5" /> Save College
                                </>
                              )}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: SAVED TARGET COLLEGES
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="saved" className="space-y-6 mt-0">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="size-5 text-primary" />
                <h2 className="text-base font-bold">Saved Target Colleges ({savedColleges.length})</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Institutions saved from recommendations and exploration.
              </p>
            </div>

            {savedColleges.length === 0 ? (
              <Card className="border-dashed border-border/70 bg-card/40 p-10 text-center">
                <CardContent className="space-y-3 p-0 max-w-sm mx-auto">
                  <Building2 className="mx-auto size-10 text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground">No saved colleges yet</p>
                  <p className="text-xs text-muted-foreground">
                    Click &quot;Save College&quot; on any institution in the explorer to curate your target applications list.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleTabChange("explore")}
                    className="gap-2 text-xs mt-2"
                  >
                    <Building2 className="size-3.5" /> Browse Colleges
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {savedColleges.map((col) => {
                  const matchingItem: CollegeItem = {
                    id: `saved-${col.id}`,
                    name: col.college_name,
                    course: col.program || "Target Degree",
                    city: col.city || "India",
                    state: "",
                    fees_total: col.tuition_estimate || "Varies",
                    entrance: col.application_deadline || "Entrance Exam",
                    why: col.notes || "Saved target institution.",
                    category: "Science",
                  };
                  const inCompare = isSelectedForCompare(matchingItem);

                  return (
                    <motion.div
                      key={col.id}
                      variants={fadeUp}
                      whileHover={cardHover.whileHover}
                      className="flex flex-col justify-between rounded-xl border border-primary/25 bg-card/90 p-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground leading-snug">
                            {col.college_name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSavedCollege(col.id, col.college_name)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                            title="Remove from saved"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>

                        {col.program && (
                          <p className="mt-1 text-xs font-semibold text-primary">{col.program}</p>
                        )}

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          {col.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3 text-muted-foreground/70" /> {col.city}
                            </span>
                          )}
                          {col.tuition_estimate && (
                            <span className="font-medium text-foreground">
                              Fees: {col.tuition_estimate}
                            </span>
                          )}
                        </div>

                        {col.notes && (
                          <p className="mt-2 text-xs text-muted-foreground/90 line-clamp-2">
                            {col.notes}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 border-t border-border/40 pt-3 flex items-center justify-between gap-2">
                        <Button
                          variant={inCompare ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleToggleCompare(matchingItem)}
                          className="h-7 gap-1 text-[11px]"
                        >
                          <BarChart3 className="size-3" />
                          {inCompare ? "In Compare" : "+ Compare"}
                        </Button>

                        <Badge variant="outline" className="text-[10px] bg-background">
                          {col.application_deadline ?? "Target"}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* ══════════════════════════════════════════════════════════════
            STICKY BOTTOM COMPARISON BAR (WHEN COLLEGES ARE SELECTED)
           ══════════════════════════════════════════════════════════════ */}
        {selectedForCompare.length > 0 && activeTab !== "compare" && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl">
            <div className="rounded-2xl border border-primary/40 bg-charcoal-deep/95 p-3.5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
                  <BarChart3 className="size-4" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground mr-1 hidden sm:inline">
                    Comparing ({selectedForCompare.length}/4):
                  </span>
                  {selectedForCompare.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-foreground font-medium"
                    >
                      <span className="max-w-[120px] truncate">{c.name}</span>
                      <button
                        onClick={() => handleToggleCompare(c)}
                        className="text-muted-foreground hover:text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCompare}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive px-2"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleTabChange("compare")}
                  className="h-8 gap-1.5 text-xs font-semibold px-4 shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Compare Now ({selectedForCompare.length}) <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
