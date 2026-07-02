import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { EditRolePermissionsDialog } from "@/components/admin/EditRolePermissionsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import type { RoleDto } from "@/lib/api/services/roles";
import { roleLabels } from "@/config/nav";
import type { UserRole } from "@/types";

const PAGE_SIZE = 10;
const ROLE_ORDER = ["SUPER_ADMIN", "TENANT_ADMIN", "ACCOUNTANT", "VIEWER"];
const roleRank = (name: string) => {
  const i = ROLE_ORDER.indexOf(name);
  return i === -1 ? ROLE_ORDER.length : i;
};
const labelFor = (name: string) => roleLabels[name as UserRole] ?? name;

export default function RolesPage() {
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: api.roles.listRoles });
  const permsQuery = useQuery({ queryKey: ["permissions"], queryFn: api.roles.listPermissions });

  const [editRole, setEditRole] = useState<RoleDto | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const roles = useMemo(
    () => [...(rolesQuery.data ?? [])].sort((a, b) => roleRank(a.name) - roleRank(b.name)),
    [rolesQuery.data],
  );
  const permissions = permsQuery.data ?? [];

  // Filter by role name/description or any of the role's permission names.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        labelFor(r.name).toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.permissions.some((p) => p.name.toLowerCase().includes(q)),
    );
  }, [roles, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Keep the open dialog's role in sync after a save (roles refetch → new object).
  const dialogRole = editRole
    ? roles.find((r) => r.id === editRole.id) ?? editRole
    : null;

  const openEdit = (role: RoleDto) => {
    setEditRole(role);
    setEditOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Each role and the permissions it grants. Edit a role to assign permissions."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles or permissions…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground sm:ml-auto tabular-nums">
          {filtered.length} of {roles.length} roles
        </p>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-56">Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-24 text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                    No roles match your search.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((role) => {
                  return (
                    <TableRow key={role.id} className="align-top">
                      <TableCell className="py-3">
                        <p className="font-medium">{labelFor(role.name)}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.description ?? role.name}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        {role.permissions.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No permissions</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1">
                            {role.permissions.map((p) => (
                              <Badge
                                key={p.id}
                                variant="secondary"
                                className="font-mono text-[11px] font-normal"
                              >
                                {p.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => openEdit(role)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {!rolesQuery.isLoading && filtered.length > 0 && (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      )}

      <EditRolePermissionsDialog
        role={dialogRole}
        permissions={permissions}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
