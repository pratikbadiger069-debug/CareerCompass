import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Check, Loader2, Sparkles } from "lucide-react";
import {
  INDIAN_STATES,
  INDIAN_STATES_AND_CITIES,
  saveUserLocation,
  validateLocation,
  type UserLocation,
} from "@/lib/locationData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
  initialLocation?: UserLocation | null;
  canSkip?: boolean;
  onSaved?: (location: UserLocation) => void;
  onSkip?: () => void;
  title?: string;
  description?: string;
}

export function LocationSelectDialog({
  open,
  onOpenChange,
  userId,
  initialLocation,
  canSkip = true,
  onSaved,
  onSkip,
  title = "Select Your Location",
  description = "CareerCompass personalizes your college choices, admission timelines, and regional entrance exams based on your state and city.",
}: LocationSelectDialogProps) {
  const [selectedState, setSelectedState] = useState<string>(initialLocation?.state ?? "");
  const [selectedCity, setSelectedCity] = useState<string>(initialLocation?.city ?? "");
  const [saving, setSaving] = useState(false);

  // Sync with initialLocation when opened
  useEffect(() => {
    if (open) {
      if (initialLocation?.state) {
        setSelectedState(initialLocation.state);
        setSelectedCity(initialLocation.city || "");
      }
    }
  }, [open, initialLocation]);

  // When state changes, reset city if not in new state
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const citiesInState = INDIAN_STATES_AND_CITIES[state] ?? [];
    if (!citiesInState.includes(selectedCity)) {
      setSelectedCity("");
    }
  };

  const cities = selectedState ? INDIAN_STATES_AND_CITIES[selectedState] ?? [] : [];
  const isValid = validateLocation(selectedState, selectedCity);

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Please choose both a State and a City.");
      return;
    }

    setSaving(true);
    const location: UserLocation = { state: selectedState, city: selectedCity };

    if (userId) {
      const res = await saveUserLocation(supabase, userId, selectedState, selectedCity);
      if (!res.success) {
        toast.error(res.error ?? "Failed to save location.");
        setSaving(false);
        return;
      }
    } else {
      // Offline/Guest/Pre-save in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("careercompass_user_location", JSON.stringify(location));
        window.dispatchEvent(
          new CustomEvent("careercompass-location-changed", { detail: location }),
        );
      }
    }

    setSaving(false);
    toast.success(`Location set to ${selectedCity}, ${selectedState}`);
    onSaved?.(location);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="card-glow-top glass-card w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-white/10 bg-charcoal-deep/95 p-6 backdrop-blur-2xl text-foreground sm:p-7">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 mb-2">
            <MapPin className="size-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          {/* State Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="location-state-select" className="text-xs font-semibold text-foreground">
              Select State / UT <span className="text-violet-400">*</span>
            </Label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger id="location-state-select" className="h-10 text-xs rounded-xl bg-charcoal-mid/80 border-white/10 focus:ring-violet-500/40">
                <SelectValue placeholder="Choose your state" />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl bg-charcoal-mid border-white/10 text-xs">
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state} className="text-xs focus:bg-violet-500/20 focus:text-violet-200">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dependent City Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="location-city-select" className="text-xs font-semibold text-foreground">
              Select City <span className="text-violet-400">*</span>
            </Label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedState}
            >
              <SelectTrigger
                id="location-city-select"
                className="h-10 text-xs rounded-xl bg-charcoal-mid/80 border-white/10 focus:ring-violet-500/40 disabled:opacity-50"
              >
                <SelectValue placeholder={selectedState ? "Choose your city" : "Select state first"} />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl bg-charcoal-mid border-white/10 text-xs">
                {cities.map((city) => (
                  <SelectItem key={city} value={city} className="text-xs focus:bg-violet-500/20 focus:text-violet-200">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedState && cities.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No predefined cities found for this state.
              </p>
            )}
          </div>

          {/* Active Preview */}
          {selectedState && selectedCity && (
            <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 flex items-center gap-2 text-xs text-violet-300">
              <Check className="size-4 text-violet-400 shrink-0" />
              <span>
                Colleges will be prioritized in: <strong>{selectedCity}, {selectedState}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          {canSkip ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={saving}
              className="text-xs text-muted-foreground hover:text-foreground w-full sm:w-auto"
            >
              Skip for now
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={!isValid || saving}
            className="ai-button w-full sm:w-auto text-xs font-semibold h-9 px-5"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="size-3.5 text-violet-200 mr-1.5" />
            )}
            Save Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

