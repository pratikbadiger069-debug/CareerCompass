import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface BackupCounts {
  profile: number;
  recommendations: number;
  milestones: number;
  savedColleges: number;
  chatMessages: number;
}

export interface CareerCompassBackupPayload {
  metadata: {
    version: "1.0.0";
    app: "CareerCompass";
    backupId: string;
    createdAt: string;
    userId: string;
    userEmail: string;
    counts: BackupCounts;
  };
  data: {
    profile: Record<string, unknown> | null;
    recommendations: Array<Record<string, unknown>>;
    milestones: Array<Record<string, unknown>>;
    savedColleges: Array<Record<string, unknown>>;
    chatMessages: Array<Record<string, unknown>>;
  };
}

export interface BackupRecord {
  id: string;
  createdAt: string;
  sizeBytes: number;
  status: "completed" | "failed";
  counts: BackupCounts;
  payload: CareerCompassBackupPayload;
  errorMessage?: string;
}

const STORAGE_PREFIX = "careercompass_backups_";

export function getBackupStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * Load all backup records saved for this user.
 */
export function getSavedBackups(userId: string): BackupRecord[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(getBackupStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (e) {
    console.error("[backupService] Error reading backups from storage:", e);
    return [];
  }
}

/**
 * Save backups array to localStorage for this user.
 */
function persistBackups(userId: string, backups: BackupRecord[]): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(getBackupStorageKey(userId), JSON.stringify(backups));
  } catch (e) {
    console.error("[backupService] Error saving backups to storage:", e);
  }
}

/**
 * Delete a specific backup by ID.
 */
export function deleteSavedBackup(userId: string, backupId: string): boolean {
  try {
    const current = getSavedBackups(userId);
    const updated = current.filter((b) => b.id !== backupId);
    persistBackups(userId, updated);
    return true;
  } catch (e) {
    console.error("[backupService] Error deleting backup:", e);
    return false;
  }
}

/**
 * Execute a real database export and create a new backup record.
 */
export async function createRealBackup(
  supabase: SupabaseClient,
  user: User,
): Promise<{ success: boolean; backup?: BackupRecord; error?: string }> {
  if (!user || !user.id) {
    return { success: false, error: "Authentication required to generate backup." };
  }

  const backupId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `backup_${Date.now()}`;
  const createdAt = new Date().toISOString();

  try {
    // 1. Fetch user_profiles (associated with user.id)
    const { data: profileData, error: profileErr } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileErr) {
      throw new Error(`Failed to fetch user profile: ${profileErr.message}`);
    }

    // 2. Fetch career_recommendations
    const { data: recsData, error: recsErr } = await supabase
      .from("career_recommendations")
      .select("*")
      .eq("user_id", user.id);

    if (recsErr) {
      throw new Error(`Failed to fetch recommendations: ${recsErr.message}`);
    }

    // 3. Fetch roadmap_milestones
    const { data: milestonesData, error: milestonesErr } = await supabase
      .from("roadmap_milestones")
      .select("*")
      .eq("user_id", user.id);

    if (milestonesErr) {
      throw new Error(`Failed to fetch milestones: ${milestonesErr.message}`);
    }

    // 4. Fetch saved_colleges
    const { data: collegesData, error: collegesErr } = await supabase
      .from("saved_colleges")
      .select("*")
      .eq("user_id", user.id);

    if (collegesErr) {
      throw new Error(`Failed to fetch saved colleges: ${collegesErr.message}`);
    }

    // 5. Fetch chat_messages
    const { data: chatData, error: chatErr } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id);

    if (chatErr) {
      throw new Error(`Failed to fetch chat messages: ${chatErr.message}`);
    }

    const counts: BackupCounts = {
      profile: profileData ? 1 : 0,
      recommendations: recsData?.length ?? 0,
      milestones: milestonesData?.length ?? 0,
      savedColleges: collegesData?.length ?? 0,
      chatMessages: chatData?.length ?? 0,
    };

    // Strip sensitive / unnecessary internal fields
    const sanitizedProfile = profileData ? { ...profileData } : null;

    const payload: CareerCompassBackupPayload = {
      metadata: {
        version: "1.0.0",
        app: "CareerCompass",
        backupId,
        createdAt,
        userId: user.id,
        userEmail: user.email || "Unknown",
        counts,
      },
      data: {
        profile: sanitizedProfile,
        recommendations: recsData ?? [],
        milestones: milestonesData ?? [],
        savedColleges: collegesData ?? [],
        chatMessages: chatData ?? [],
      },
    };

    const payloadJson = JSON.stringify(payload);
    const sizeBytes = new TextEncoder().encode(payloadJson).length;

    const record: BackupRecord = {
      id: backupId,
      createdAt,
      sizeBytes,
      status: "completed",
      counts,
      payload,
    };

    // Save to user's storage registry
    const existing = getSavedBackups(user.id);
    persistBackups(user.id, [record, ...existing]);

    return { success: true, backup: record };
  } catch (err) {
    console.error("[backupService] Backup creation failed:", err);
    const errorMsg = err instanceof Error ? err.message : "Unknown error creating backup";

    const failedRecord: BackupRecord = {
      id: backupId,
      createdAt,
      sizeBytes: 0,
      status: "failed",
      counts: {
        profile: 0,
        recommendations: 0,
        milestones: 0,
        savedColleges: 0,
        chatMessages: 0,
      },
      errorMessage: errorMsg,
      payload: {
        metadata: {
          version: "1.0.0",
          app: "CareerCompass",
          backupId,
          createdAt,
          userId: user.id,
          userEmail: user.email || "",
          counts: { profile: 0, recommendations: 0, milestones: 0, savedColleges: 0, chatMessages: 0 },
        },
        data: {
          profile: null,
          recommendations: [],
          milestones: [],
          savedColleges: [],
          chatMessages: [],
        },
      },
    };

    const existing = getSavedBackups(user.id);
    persistBackups(user.id, [failedRecord, ...existing]);

    return { success: false, error: errorMsg, backup: failedRecord };
  }
}

/**
 * Triggers a secure download of the backup payload as a .json file.
 */
export function downloadBackupFile(record: BackupRecord): void {
  if (typeof window === "undefined") return;

  const jsonString = JSON.stringify(record.payload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const cleanDate = record.createdAt.replace(/[:.]/g, "-");
  const filename = `careercompass_backup_${record.payload.metadata.userId.slice(0, 8)}_${cleanDate}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates an uploaded JSON backup file string.
 */
export function validateBackupJson(rawString: string): {
  valid: boolean;
  error?: string;
  payload?: CareerCompassBackupPayload;
} {
  try {
    const parsed = JSON.parse(rawString);
    if (!parsed || typeof parsed !== "object") {
      return { valid: false, error: "File does not contain a valid JSON object." };
    }

    if (parsed.metadata?.app !== "CareerCompass") {
      return { valid: false, error: "Unrecognized backup file. Missing 'CareerCompass' application signature." };
    }

    if (!parsed.metadata?.version || !parsed.metadata?.backupId) {
      return { valid: false, error: "Invalid backup metadata format." };
    }

    if (!parsed.data || typeof parsed.data !== "object") {
      return { valid: false, error: "Corrupted backup: Missing data payload block." };
    }

    return { valid: true, payload: parsed as CareerCompassBackupPayload };
  } catch (e) {
    return {
      valid: false,
      error: `Failed to parse backup JSON file: ${e instanceof Error ? e.message : "Syntax error"}`,
    };
  }
}

/**
 * Safely restores a backup into Supabase for the current authenticated user.
 */
export async function restoreRealBackup(
  supabase: SupabaseClient,
  user: User,
  payload: CareerCompassBackupPayload,
): Promise<{
  success: boolean;
  error?: string;
  restoredCounts?: {
    profile: number;
    recommendations: number;
    milestones: number;
    savedColleges: number;
  };
}> {
  if (!user?.id) {
    return { success: false, error: "You must be signed in to restore a backup." };
  }

  try {
    let restoredProfile = 0;
    let restoredRecs = 0;
    let restoredMilestones = 0;
    let restoredColleges = 0;

    // 1. Restore Profile if present
    if (payload.data.profile) {
      const p = {
        ...payload.data.profile,
        user_id: user.id, // Enforce authenticated user's ID
        updated_at: new Date().toISOString(),
      };
      // Delete primary key if generating collision or let Supabase upsert on user_id
      const { error: pErr } = await supabase
        .from("user_profiles")
        .upsert(p, { onConflict: "user_id" });

      if (pErr) {
        console.warn("[backupService] Profile restore warning:", pErr.message);
      } else {
        restoredProfile = 1;
      }
    }

    // 2. Restore Recommendations
    const recs = payload.data.recommendations ?? [];
    const oldIdToNewIdMap: Record<string, string> = {};

    for (const r of recs) {
      const originalId = r.id as string;
      const recPayload = {
        ...r,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data: insertedRec, error: rErr } = await supabase
        .from("career_recommendations")
        .upsert(recPayload)
        .select("id")
        .maybeSingle();

      if (!rErr && insertedRec) {
        oldIdToNewIdMap[originalId] = insertedRec.id;
        restoredRecs++;
      } else if (!rErr) {
        restoredRecs++;
      }
    }

    // 3. Restore Milestones
    const milestones = payload.data.milestones ?? [];
    for (const m of milestones) {
      const oldRecId = m.recommendation_id as string | undefined;
      const mappedRecId = oldRecId && oldIdToNewIdMap[oldRecId] ? oldIdToNewIdMap[oldRecId] : oldRecId;

      const milestonePayload = {
        ...m,
        user_id: user.id,
        recommendation_id: mappedRecId || null,
        updated_at: new Date().toISOString(),
      };

      const { error: mErr } = await supabase
        .from("roadmap_milestones")
        .upsert(milestonePayload);

      if (!mErr) {
        restoredMilestones++;
      }
    }

    // 4. Restore Saved Colleges
    const colleges = payload.data.savedColleges ?? [];
    for (const c of colleges) {
      const colPayload = {
        ...c,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { error: cErr } = await supabase
        .from("saved_colleges")
        .upsert(colPayload);

      if (!cErr) {
        restoredColleges++;
      }
    }

    return {
      success: true,
      restoredCounts: {
        profile: restoredProfile,
        recommendations: restoredRecs,
        milestones: restoredMilestones,
        savedColleges: restoredColleges,
      },
    };
  } catch (err) {
    console.error("[backupService] Restore failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to restore backup data.",
    };
  }
}

