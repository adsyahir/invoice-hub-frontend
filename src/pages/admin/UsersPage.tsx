import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { SelectField } from "@/components/common/SelectField";
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
import { formatDate } from "@/lib/format";
import { roleLabels } from "@/config/nav";
import type { UserRole } from "@/types";

const PAGE_SIZE = 10;
const labelFor = (name: string) => roleLabels[name as UserRole] ?? name;
const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // 1-based for the UI

  const usersQuery = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => api.users.listUsers({ page: page - 1, size: PAGE_SIZE, search }),
    placeholderData: keepPreviousData,
  });

  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: api.roles.listRoles });

  // role name -> id, for the inline role select.
  const roleByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rolesQuery.data ?? []) map.set(r.name, r.id);
    return map;
  }, [rolesQuery.data]);

  const roleOptions = useMemo(
    () =>
      [...(rolesQuery.data ?? [])].map((r) => ({
        value: String(r.id),
        label: labelFor(r.name),
      })),
    [rolesQuery.data],
  );

  const changeRole = useMutation({
    mutationFn: ({ id, roleId }: { id: number; roleId: number }) =>
      api.users.updateUserRole(id, roleId),
    onSuccess: (updated) => {
      toast.success(`${updated.fullName} is now ${labelFor(updated.role)}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Couldn’t update the user’s role."),
  });

  const data = usersQuery.data;
  const rows = data?.content ?? [];
  const total = data?.total ?? 0;

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone with access across the platform. Reassign roles here."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground sm:ml-auto tabular-nums">
          {total} user{total === 1 ? "" : "s"}
        </p>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="w-48">Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No users match your search.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {initials(u.fullName)}
                        </div>
                        <div className="leading-tight">
                          <p className="font-medium">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.tenantName ?? <span className="italic">Platform</span>}
                    </TableCell>
                    <TableCell>
                      <SelectField
                        value={String(roleByName.get(u.role) ?? "")}
                        onValueChange={(v) =>
                          changeRole.mutate({ id: u.id, roleId: Number(v) })
                        }
                        options={roleOptions}
                        disabled={changeRole.isPending}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <DataTablePagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </>
  );
}
