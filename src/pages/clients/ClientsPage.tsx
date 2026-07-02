import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";
import { useClients } from "@/lib/api/services/queries";
import { formatDate } from "@/lib/format";
import type { Client } from "@/types";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/services/queries";
export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useClients();
  const qc = useQueryClient();   // ← the cache controller

  const rows = (data ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const { page, setPage, pageItems, total } = usePagination(rows, 10);

  // The client awaiting delete confirmation; null = dialog closed.
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);

  // TODO(you): wire up the actual delete (mutation + invalidate).
  const  handleDelete =  async (id: string) => {
    try {
      const response = await api.clients.remove(id);
      await qc.invalidateQueries({ queryKey: queryKeys.clients });  // ← refetch the list
      console.log("Client deleted:", response);
      // Optionally, you can refresh the client list or update the state to remove the deleted client.
    } catch (error) {
      console.error("Error deleting client:", error);
    } finally {
      // Close the confirmation modal whether the delete succeeded or failed.
      setPendingDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Clients"
        description="The companies and people you bill."
        actions={
          <Button render={<Link to="/clients/new" />}>
            <Plus className="size-4" />
            New client
          </Button>
        }
      />

      <Card className="overflow-hidden py-0">
        <div className="border-b p-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Terms</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-px text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-56 p-0">
                  <EmptyState
                    icon={Users}
                    title="No clients found"
                    description="Add a client to start invoicing them."
                    className="border-0"
                    action={
                      <Button size="sm" render={<Link to="/clients/new" />}>
                        New client
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {/* Only the name opens the read-only view page (by uuid). */}
                    <Link to={`/clients/${c.uuid}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    Net {c.paymentTermsDays}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.currency}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${c.name}`}
                        className="text-muted-foreground hover:text-foreground"
                        render={<Link to={`/clients/${c.uuid}/edit`} />}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${c.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setPendingDelete(c)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && total > 0 && (
        <DataTablePagination
          page={page}
          pageSize={10}
          total={total}
          onPageChange={setPage}
        />
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.name}
              </span>{" "}
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => pendingDelete && handleDelete(pendingDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
