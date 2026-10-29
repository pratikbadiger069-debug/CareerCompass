import { useEffect, useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  FileCheck,
  FileText,
  HardDrive,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HeaderNav } from "@/components/HeaderNav";
import {
  createRealBackup,
  getSavedBackups,
  deleteSavedBackup,
  downloadBackupFile,
  validateBackupJson,
  restoreRealBackup,
  getBackupStorageKey,
  type BackupRecord,
  type CareerCompassBackupPayload,
} from "@/lib/backupService";

export const Route = createFileRoute("/_authenticated/backup")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Data Backup & Recovery Manager" },
      {
        name: "description",
        content:
          "Securely back up, export, download, and restore your student profile, career roadmaps, and saved colleges.",
      },
      { property: "og:title", content: "CareerCompass — Backup Manager" },
    ],
  }),
  component: BackupManagerPage,
});

function BackupManagerPage() {
  const { user, isGuest } = useAuth();

  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Restore Confirmation Dialog
  const [pendingRestore, setPendingRestore] = useState<CareerCompassBackupPayload | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load existing backups for user
  const refreshBackups = () => {
    if (!user || isGuest) {
      setBackups([]);
      setLoading(false);
      return;
    }
    const list = getSavedBackups(user.id);
    setBackups(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshBackups();
  }, [user, isGuest]);

  // 2. Handle Backup Creation
  const handleCreateBackup = async () => {
    if (!user || isGuest) {
      toast.error("Please sign in to back up your student data.");
      return;
    }

    setIsCreating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await createRealBackup(supabase, user);
      if (res.success && res.backup) {
        toast.success("Backup created successfully!");
        setActionSuccess(
          `Backup created with ${res.backup.counts.profile} profile, ${res.backup.counts.recommendations} career paths, ${res.backup.counts.milestones} milestones, and ${res.backup.counts.savedColleges} saved colleges.`,
        );
        refreshBackups();
      } else {
        const msg = res.error || "Failed to create backup.";
        toast.error(msg);
        setActionError(msg);
        refreshBackups();
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unexpected backup failure.";
      toast.error(msg);
      setActionError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Handle Download
  const handleDownload = (backup: BackupRecord) => {
    try {
      downloadBackupFile(backup);
      toast.success("Backup JSON file downloaded to your device.");
    } catch (e) {
      console.error(e);
      toast.error("Could not download backup file.");
    }
  };

  // 4. Handle Delete
  const handleDelete = (backupId: string) => {
    if (!user) return;
    const ok = deleteSavedBackup(user.id, backupId);
    if (ok) {
      toast.info("Backup record deleted from your history.");
      refreshBackups();
    } else {
      toast.error("Failed to delete backup.");
    }
  };

  // 5. Trigger Restore Dialog
  const handlePromptRestore = (payload: CareerCompassBackupPayload) => {
    setPendingRestore(payload);
    setRestoreDialogOpen(true);
  };

  // 6. Confirm and Execute Restore
  const handleConfirmRestore = async () => {
    if (!user || !pendingRestore) return;

    setIsRestoring(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await restoreRealBackup(supabase, user, pendingRestore);
      if (res.success && res.restoredCounts) {
        const msg = `Restore complete: Restored ${res.restoredCounts.profile} profile, ${res.restoredCounts.recommendations} career paths, ${res.restoredCounts.milestones} milestones, and ${res.restoredCounts.savedColleges} saved colleges.`;
        toast.success(msg);
        setActionSuccess(msg);
        setRestoreDialogOpen(false);
        setPendingRestore(null);
      } else {
        const msg = res.error || "Failed to restore backup data.";
        toast.error(msg);
        setActionError(msg);
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unexpected restore failure.";
      toast.error(msg);
      setActionError(msg);
    } finally {
      setIsRestoring(false);
    }
  };

  // 7. Handle Upload from external file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupJson(content);
      if (!validation.valid || !validation.payload) {
        toast.error(validation.error || "Invalid backup file format.");
        return;
      }

      handlePromptRestore(validation.payload);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-charcoal-deep hero-glow dot-grid-bg text-foreground pb-24">
      <HeaderNav />

      <main className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        {/* Header */}
        <header className="border-b border-white/8 pb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Database className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Data Backup & Recovery</h1>
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                    Live Database Export
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create verified backups of your student profile, career roadmaps, milestones, and saved colleges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateBackup}
                disabled={isCreating || !user || isGuest}
                className="gap-2 text-xs font-semibold px-4 shadow-sm"
              >
                {isCreating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <HardDrive className="size-4" />
                )}
                {isCreating ? "Backing up..." : "Create New Backup"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={!user || isGuest}
                className="gap-2 text-xs"
                title="Upload an exported backup JSON file"
              >
                <Upload className="size-3.5" />
                Upload & Restore
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </header>

        {/* Guest Warning */}
        {(!user || isGuest) && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-200">
            <AlertTriangle className="size-4 text-amber-400" />
            <AlertTitle className="text-xs font-bold text-amber-300">Sign-in Required</AlertTitle>
            <AlertDescription className="text-xs text-amber-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
              <span>You are currently in guest mode. Sign in to link your backups to a secure authenticated account.</span>
              <Link to="/auth">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-amber-500/40 text-amber-200 hover:bg-amber-500/20">
                  <UserCheck className="size-3.5" /> Sign In
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Status Banners */}
        {actionSuccess && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <AlertTitle className="text-xs font-bold text-emerald-300">Success</AlertTitle>
            <AlertDescription className="text-xs text-emerald-200/90">{actionSuccess}</AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-bold">Operation Failed</AlertTitle>
            <AlertDescription className="text-xs">{actionError}</AlertDescription>
          </Alert>
        )}

        {/* ─── Storage Path & Architecture Notice ─── */}
        <Card className="border-border/60 bg-card/75">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">
                Backup Path & Storage Location Information
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Transparent breakdown of where your backups are stored and how data privacy is maintained.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-xs text-muted-foreground">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-muted/40 p-3 space-y-1">
                <span className="font-semibold text-foreground block">Client Storage Vault</span>
                <p className="text-[11px] leading-relaxed">
                  Backups are stored in your browser's authenticated vault at key{" "}
                  <code className="text-primary font-mono text-[10px]">
                    {user ? getBackupStorageKey(user.id) : "careercompass_backups_<user_id>"}
                  </code>
                  . Only requests authenticated as you can read or decrypt this data.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-muted/40 p-3 space-y-1">
                <span className="font-semibold text-foreground block">Secure Offline Export</span>
                <p className="text-[11px] leading-relaxed">
                  You can download standard <code className="text-primary font-mono text-[10px]">.json</code> backup files to your local hard drive anytime. Backup files contain zero credentials, passwords, or API secrets.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-[11px] space-y-1">
              <span className="font-semibold text-foreground">Cloud Storage Configuration:</span>
              <p className="text-muted-foreground">
                Remote cloud storage uses Supabase Storage. If a dedicated bucket named <code className="font-mono text-primary">backups</code> is configured in your Supabase project, backups can synchronize across cloud endpoints. Currently, full local exports and safe restores are fully active.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Backups History List ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="size-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">Available Backup Records ({backups.length})</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBackups}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-3.5" /> Refresh List
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : backups.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-card/40 p-12 text-center">
              <CardContent className="space-y-3 p-0 max-w-sm mx-auto">
                <Database className="mx-auto size-12 text-muted-foreground/40" />
                <h3 className="text-base font-bold text-foreground">No backups created yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click &quot;Create New Backup&quot; above to capture a snapshot of your profile, roadmap milestones, and target colleges.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={handleCreateBackup}
                    disabled={isCreating || !user || isGuest}
                    size="sm"
                    className="gap-2 text-xs"
                  >
                    <HardDrive className="size-3.5" /> Create First Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {backups.map((b) => {
                const dateStr = new Date(b.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <Card
                    key={b.id}
                    className="border-border/60 bg-card/85 p-4 sm:p-5 shadow-sm hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            Backup {b.id.slice(0, 8)}
                          </span>
                          {b.status === "completed" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                              <CheckCircle2 className="mr-1 size-2.5" /> Completed
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              <AlertCircle className="mr-1 size-2.5" /> Failed
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            • {formatBytes(b.sizeBytes)}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Created on: <strong className="text-foreground">{dateStr}</strong>
                        </p>

                        {/* Record Counts Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <Badge variant="outline" className="text-[10px] border-border/70">
                            Profile: {b.counts.profile}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-border/70">
                            Roadmap Paths: {b.counts.recommendations}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-border/70">
                            Milestones: {b.counts.milestones}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-border/70">
                            Saved Colleges: {b.counts.savedColleges}
                          </Badge>
                        </div>

                        {b.errorMessage && (
                          <p className="text-xs text-red-400 mt-1">Error: {b.errorMessage}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {b.status === "completed" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(b)}
                              className="h-8 gap-1.5 text-xs font-medium"
                              title="Download backup file"
                            >
                              <Download className="size-3.5" /> Download JSON
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromptRestore(b.payload)}
                              disabled={isRestoring}
                              className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                              title="Restore data from this backup"
                            >
                              <RotateCcw className="size-3.5" /> Restore
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(b.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          title="Delete backup record"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Confirmation Dialog for Restore ─── */}
        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent className="sm:max-w-md bg-charcoal-deep border-border/70 text-foreground">
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RotateCcw className="size-6" />
              </div>
              <DialogTitle className="text-center text-base font-bold">
                Confirm Data Restore
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                Restoring will synchronize your profile, career roadmaps, milestones, and saved colleges from this backup into your active account.
              </DialogDescription>
            </DialogHeader>

            {pendingRestore && (
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Backup Date:</span>
                  <span className="font-medium text-foreground">
                    {new Date(pendingRestore.metadata.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile Record:</span>
                  <span className="font-semibold text-primary">
                    {pendingRestore.metadata.counts.profile > 0 ? "Yes" : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Career Recommendations:</span>
                  <span className="font-semibold text-foreground">
                    {pendingRestore.metadata.counts.recommendations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roadmap Milestones:</span>
                  <span className="font-semibold text-foreground">
                    {pendingRestore.metadata.counts.milestones}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved Colleges:</span>
                  <span className="font-semibold text-foreground">
                    {pendingRestore.metadata.counts.savedColleges}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 sm:justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRestoreDialogOpen(false)}
                disabled={isRestoring}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-3.5" /> Confirm & Restore
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
