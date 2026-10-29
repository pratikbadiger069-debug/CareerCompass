/**
 * Comprehensive Indian States and dependent major cities dataset.
 */
export const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  "Maharashtra": [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Thane",
    "Navi Mumbai",
    "Aurangabad",
    "Kolhapur",
    "Solapur",
    "Amravati",
    "Nanded",
    "Jalgaon",
  ],
  "Delhi (NCR)": [
    "New Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
    "Dwarka",
    "Noida",
    "Gurugram",
    "Faridabad",
    "Ghaziabad",
  ],
  "Karnataka": [
    "Bengaluru",
    "Mysuru",
    "Mangaluru",
    "Hubballi-Dharwad",
    "Belagavi",
    "Manipal",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Davangere",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Vellore",
    "Tirunelveli",
    "Erode",
    "Thanjavur",
  ],
  "Telangana": [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Secunderabad",
  ],
  "Uttar Pradesh": [
    "Noida",
    "Greater Noida",
    "Lucknow",
    "Kanpur",
    "Varanasi",
    "Prayagraj",
    "Agra",
    "Meerut",
    "Aligarh",
    "Bareilly",
    "Gorakhpur",
  ],
  "Gujarat": [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Gandhinagar",
    "Bhavnagar",
    "Anand",
    "Jamnagar",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Kharagpur",
    "Kalyani",
  ],
  "Rajasthan": [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Udaipur",
    "Bikaner",
    "Ajmer",
    "Pilani",
    "Alwar",
  ],
  "Kerala": [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Kottayam",
    "Palakkad",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Tirupati",
    "Kakinada",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
    "Sagar",
  ],
  "Punjab": [
    "Chandigarh",
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
  ],
  "Haryana": [
    "Gurugram",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Rohtak",
    "Karnal",
    "Hisar",
  ],
  "Bihar": [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
  ],
  "Odisha": [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Berhampur",
    "Sambalpur",
  ],
  "Assam": [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Tezpur",
  ],
  "Uttarakhand": [
    "Dehradun",
    "Haridwar",
    "Roorkee",
    "Nainital",
    "Rishikesh",
  ],
  "Jharkhand": [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Dharamshala",
    "Solan",
    "Mandi",
  ],
  "Goa": [
    "Panaji",
    "Margao",
    "Vasco da Gama",
    "Mapusa",
  ],
  "Jammu & Kashmir": [
    "Srinagar",
    "Jammu",
  ],
  "Chandigarh": [
    "Chandigarh",
  ],
  "Puducherry": [
    "Puducherry",
  ],
};

export const INDIAN_STATES = Object.keys(INDIAN_STATES_AND_CITIES);

export interface UserLocation {
  state: string;
  city: string;
}

const STORAGE_KEY = "careercompass_user_location";

/**
 * Extracts the user location from multiple possible sources:
 * 1. user_profiles target_country (stored as "City, State")
 * 2. Supabase auth user_metadata
 * 3. LocalStorage cache
 */
export function getUserLocation(
  user?: { user_metadata?: Record<string, unknown> } | null,
  profile?: { target_country?: string | null } | null,
): UserLocation | null {
  // 1. Try profile target_country (e.g. "Mumbai, Maharashtra" or JSON)
  if (profile?.target_country) {
    const raw = profile.target_country.trim();
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.state && parsed.city) {
          return { state: parsed.state, city: parsed.city };
        }
      } catch {
        // Fall through to text parse
      }
    }
    if (raw.includes(",")) {
      const parts = raw.split(",").map((s) => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        // Expected format "City, State"
        return { city: parts[0], state: parts[1] };
      }
    }
  }

  // 2. Try auth user_metadata
  if (user?.user_metadata) {
    const meta = user.user_metadata as Record<string, unknown>;
    const state = typeof meta["state"] === "string" ? meta["state"].trim() : "";
    const city = typeof meta["city"] === "string" ? meta["city"].trim() : "";
    if (state && city) {
      return { state, city };
    }
  }

  // 3. Fallback to localStorage cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.state && parsed?.city) {
          return { state: parsed.state, city: parsed.city };
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  return null;
}

/**
 * Validates state and city.
 */
export function validateLocation(state: string, city: string): boolean {
  if (!state || !city) return false;
  const cities = INDIAN_STATES_AND_CITIES[state];
  if (!cities) return false;
  // Allow city if it is in the state's list or non-empty string
  return city.trim().length > 1;
}

/**
 * Saves user location across Supabase database, auth user_metadata, and localStorage.
 */
export async function saveUserLocation(
  supabase: any,
  userId: string,
  state: string,
  city: string,
): Promise<{ success: boolean; error?: string }> {
  const cleanState = state.trim();
  const cleanCity = city.trim();

  if (!validateLocation(cleanState, cleanCity)) {
    return { success: false, error: "Please select a valid State and City." };
  }

  const locationPayload: UserLocation = { state: cleanState, city: cleanCity };
  const formattedString = `${cleanCity}, ${cleanState}`;

  // 1. Update localStorage immediately for instant UI responsiveness
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locationPayload));
      window.dispatchEvent(
        new CustomEvent("careercompass-location-changed", { detail: locationPayload }),
      );
    } catch (e) {
      console.warn("[location] Could not write to localStorage:", e);
    }
  }

  try {
    // 2. Update Supabase user_profiles (target_country stores "City, State")
    await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        target_country: formattedString,
      },
      { onConflict: "user_id" },
    );

    // 3. Update auth user_metadata
    await supabase.auth.updateUser({
      data: {
        state: cleanState,
        city: cleanCity,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[location] Error saving location:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save location.",
    };
  }
}

