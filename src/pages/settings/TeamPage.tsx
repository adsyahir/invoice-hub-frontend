import { useState } from "react";
import { Mail, MoreHorizontal, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInviteMember, useTeamMembers } from "@/lib/api/services/queries";
import { inviteRoleOptions } from "@/lib/options";
import { roleLabels } from "@/config/nav";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types";

const statusClass: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  INVITED: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  SUSPENDED: "bg-muted text-muted-foreground",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}



function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ACCOUNTANT");
  const invite = useInviteMember();

  const submit = () =>{

  }

    // invite.mutate(
    //   { email, role },
    //   {
    //     onSuccess: () => {
    //       toast.success("Invitation sent", {
    //         description: `${email} has 48 hours to accept.`,
    //       });
    //       setOpen(false);
    //       setEmail("");
    //     },
    //   },
    // );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="size-4" />
        Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They’ll receive an email to set a password and join your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FormRow label="Email" htmlFor="invite-email" required>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
          </FormRow>
          <FormRow label="Role" htmlFor="invite-role">
            <SelectField
              id="invite-role"
              value={role}
              onValueChange={setRole}
              options={inviteRoleOptions}
            />
          </FormRow>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!email || invite.isPending}>
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamPage() {
  const { data, isLoading } = useTeamMembers();
  console.log("Team members:", data);
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your organization."
        actions={<InviteMemberDialog />}
      />
      <SettingsNav />

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : (data ?? []).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(m.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <p className="font-medium">{m.fullName}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleLabels[m.role]}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", statusClass[m.status])}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="text-muted-foreground">
                      {m.lastLoginAt ? formatRelative(m.lastLoginAt) : "—"}
                    </TableCell> */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label="Member actions" />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {m.status === "INVITED" && (
                            <DropdownMenuItem onClick={() => toast.success("Invitation resent")}>
                              <Mail className="size-4" />
                              Resend invite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => toast.success("Member removed")}
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
