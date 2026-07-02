import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { PermissionDto, RoleDto } from "@/lib/api/services/roles";
import { roleLabels } from "@/config/nav";
import type { UserRole } from "@/types";

const labelFor = (name: string) => roleLabels[name as UserRole] ?? name;
const domainOf = (n: string) => n.split(":")[0];
const domainLabel = (d: string) => d.charAt(0).toUpperCase() + d.slice(1);

export function EditRolePermissionsDialog({
  role,
  permissions,
  open,
  onOpenChange,
}: {
  role: RoleDto | null;
  permissions: PermissionDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  // Reset selection from the role each time the dialog opens.
  useEffect(() => {
    if (open && role) setDraft(new Set(role.permissions.map((p) => p.id)));
    if (open) setSearch("");
  }, [open, role]);

  const mutation = useMutation({
    mutationFn: () => api.roles.updateRolePermissions(role!.id, [...draft]),
    onSuccess: () => {
      toast.success(`${role ? labelFor(role.name) : "Role"} permissions updated`);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn’t save changes. Check your access and try again."),
  });

  const groups = useMemo<[string, PermissionDto[]][]>(() => {
    const q = search.trim().toLowerCase();
    const map = new Map<string, PermissionDto[]>();
    for (const p of permissions) {
      if (q && !p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q))
        continue;
      const d = domainOf(p.name);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(p);
    }
    return [...map.entries()];
  }, [permissions, search]);

  const toggle = (id: number, checked: boolean) =>
    setDraft((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {role ? labelFor(role.name) : "role"} permissions</DialogTitle>
          <DialogDescription>
            Assign what this role can do. {draft.size} permission{draft.size === 1 ? "" : "s"} selected.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search permissions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-col -mx-1 max-h-[55vh] gap-4 overflow-y-auto px-1">
          {groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No permissions match “{search}”.
            </p>
          ) : (
            groups.map(([domain, perms]) => (
              <div key={domain} className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {domainLabel(domain)}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {perms.map((perm) => {
                    const id = `perm-${perm.id}`;
                    return (
                      <label
                        key={perm.id}
                        htmlFor={id}
                        className="flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors hover:bg-muted/50 has-data-checked:border-primary/40 has-data-checked:bg-primary/[0.04]"
                      >
                        <Checkbox
                          id={id}
                          checked={draft.has(perm.id)}
                          onCheckedChange={(c) => toggle(perm.id, c === true)}
                          className="mt-0.5"
                        />
                        <span className="leading-tight">
                          <span className="block font-mono text-xs">{perm.name}</span>
                          <Label htmlFor={id} className="font-normal text-muted-foreground">
                            {perm.description}
                          </Label>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!role || mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Save permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
