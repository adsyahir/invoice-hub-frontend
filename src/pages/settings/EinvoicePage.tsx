import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plug, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { api } from "@/lib/api";
import type {
  EinvoiceEnvironment,
  EinvoiceSettings,
} from "@/lib/api/services/settings";

const ENV_OPTIONS = [
  { value: "SANDBOX", label: "Sandbox (testing)" },
  { value: "PRODUCTION", label: "Production (live)" },
];

export default function EinvoicePage() {
  const [settings, setSettings] = useState<EinvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable form fields.
  const [environment, setEnvironment] = useState<EinvoiceEnvironment>("SANDBOX");
  const [tin, setTin] = useState("");
  const [brn, setBrn] = useState("");
  const [sstNumber, setSstNumber] = useState("");

  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Snapshot of the last-saved values, to detect unsaved edits.
  const [saved, setSaved] = useState({
    environment: "SANDBOX" as EinvoiceEnvironment,
    tin: "",
    brn: "",
    sstNumber: "",
  });

  const apply = (s: EinvoiceSettings) => {
    setSettings(s);
    setEnvironment(s.environment);
    setTin(s.tin ?? "");
    setBrn(s.brn ?? "");
    setSstNumber(s.sstNumber ?? "");
    setSaved({
      environment: s.environment,
      tin: s.tin ?? "",
      brn: s.brn ?? "",
      sstNumber: s.sstNumber ?? "",
    });
  };

  useEffect(() => {
    let active = true;
    api.settings
      .getEinvoice()
      .then((s) => {
        if (active) apply(s);
      })
      .catch(() => toast.error("Could not load MyInvois settings"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const dirty = useMemo(
    () =>
      environment !== saved.environment ||
      tin.trim() !== saved.tin ||
      brn.trim() !== saved.brn ||
      sstNumber.trim() !== saved.sstNumber,
    [environment, tin, brn, sstNumber, saved],
  );

  const onSave = async () => {
    setErrors({});
    setSaving(true);
    try {
      const s = await api.settings.updateEinvoice({
        environment,
        tin: tin.trim() || undefined,
        brn: brn.trim() || undefined,
        sstNumber: sstNumber.trim() || undefined,
      });
      apply(s);
      toast.success("MyInvois details saved");
    } catch (err) {
      const fieldErrors = (err as { response?: { data?: { errors?: Record<string, string> } } })
        ?.response?.data?.errors;
      if (fieldErrors) {
        setErrors(fieldErrors);
        toast.error("Please fix the highlighted fields");
      } else {
        toast.error("Could not save settings");
      }
    } finally {
      setSaving(false);
    }
  };

  const onVerify = async () => {
    setVerifying(true);
    try {
      const s = await api.settings.verifyEinvoice();
      apply(s);
      if (s.connected) toast.success("Connected to MyInvois");
      else toast.error(s.lastError ?? "Could not connect to MyInvois");
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(msg ?? "Could not connect to MyInvois");
    } finally {
      setVerifying(false);
    }
  };

  const onDisconnect = async () => {
    setDisconnecting(true);
    try {
      const s = await api.settings.disconnectEinvoice();
      apply(s);
      toast.success("Disconnected from MyInvois");
    } catch {
      toast.error("Could not disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Connect your workspace to LHDN MyInvois e-invoicing."
      />
      <SettingsNav />

      <div className="flex max-w-2xl flex-col gap-4">
        {settings && <StatusBanner settings={settings} />}

        <Card>
          <CardHeader>
            <CardTitle>LHDN MyInvois</CardTitle>
            <CardDescription>
              InvoiceHub connects to MyInvois as your intermediary — you only need
              your tax identification number. Test in Sandbox before going live.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <>
                <FormRow label="Environment" htmlFor="ei-env" required>
                  <SelectField
                    id="ei-env"
                    options={ENV_OPTIONS}
                    value={environment}
                    onValueChange={(v) => setEnvironment(v as EinvoiceEnvironment)}
                  />
                </FormRow>

                <FormRow
                  label="Tax Identification Number (TIN)"
                  htmlFor="ei-tin"
                  required
                  hint="Required to connect. e.g. IG12345678900 or C20211234567"
                  error={errors.tin}
                >
                  <Input
                    id="ei-tin"
                    placeholder="IG12345678900"
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                  />
                </FormRow>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormRow
                    label="Business registration no. (BRN)"
                    htmlFor="ei-brn"
                    error={errors.brn}
                  >
                    <Input
                      id="ei-brn"
                      placeholder="202101012345"
                      value={brn}
                      onChange={(e) => setBrn(e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="SST number" htmlFor="ei-sst" error={errors.sstNumber}>
                    <Input
                      id="ei-sst"
                      placeholder="W10-1808-12345678"
                      value={sstNumber}
                      onChange={(e) => setSstNumber(e.target.value)}
                    />
                  </FormRow>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {settings?.connected && (
                    <Button
                      variant="outline"
                      onClick={onDisconnect}
                      disabled={disconnecting}
                    >
                      {disconnecting && <Loader2 className="size-4 animate-spin" />}
                      Disconnect
                    </Button>
                  )}
                  <Button variant="outline" onClick={onSave} disabled={saving || !dirty}>
                    {saving && <Loader2 className="size-4 animate-spin" />}
                    Save details
                  </Button>
                  <Button
                    onClick={onVerify}
                    disabled={verifying || dirty || !tin.trim()}
                    title={
                      dirty
                        ? "Save your details first"
                        : !tin.trim()
                          ? "A TIN is required"
                          : undefined
                    }
                  >
                    {verifying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plug className="size-4" />
                    )}
                    {settings?.connected ? "Re-verify" : "Connect"}
                  </Button>
                </div>

                {settings && !settings.platformReady && (
                  <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    Note: no live MyInvois credentials are configured on this
                    InvoiceHub instance yet, so connecting is <strong>simulated</strong>{" "}
                    for now — the flow works end-to-end but no data is sent to LHDN.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatusBanner({ settings }: { settings: EinvoiceSettings }) {
  const { status, lastVerifiedAt, lastError } = settings;

  const meta =
    status === "CONNECTED"
      ? {
          icon: CheckCircle2,
          className: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
          title: "Connected to MyInvois",
          detail: lastVerifiedAt
            ? `Verified ${formatDateTime(lastVerifiedAt)}`
            : "Ready to submit e-invoices.",
        }
      : status === "ERROR"
        ? {
            icon: AlertTriangle,
            className: "border-destructive/30 bg-destructive/5 text-destructive",
            title: "Connection problem",
            detail: lastError ?? "Verification failed.",
          }
        : {
            icon: ShieldCheck,
            className: "border-border bg-muted/40 text-muted-foreground",
            title: "Not connected",
            detail: "Enter your TIN and connect to enable e-invoicing.",
          };

  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        meta.className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{meta.title}</p>
        <p className="text-xs opacity-90">{meta.detail}</p>
      </div>
    </div>
  );
}
