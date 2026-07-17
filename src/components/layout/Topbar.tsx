import { useNavigate } from "react-router-dom";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { roleLabels } from "@/config/nav";
import type { UserRole } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const actualRole = useAuthStore((s) => s.actualRole);
  const tenant = useAuthStore((s) => s.tenant);
  const switchRole = useAuthStore((s) => s.switchRole);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationsBell />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2" />
            }
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">
                {user ? initials(user.fullName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {tenant?.name}
              </div>
            </div>
            <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span>{user?.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* Demo-only role switcher — visible to platform SUPER_ADMINs.
               Gated on the *actual* role so previewing as another role can't
               hide the switcher and trap them. */}
            {actualRole === "SUPER_ADMIN" && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserCog className="size-3.5" />
                    Preview as role
                    <Badge variant="secondary" className="ml-auto">
                      Demo
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={user?.role}
                    onValueChange={(v) => switchRole(v as UserRole)}
                  >
                    {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                      <DropdownMenuRadioItem key={role} value={role}>
                        {roleLabels[role]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                // Tell the backend to revoke the refresh token + clear the cookie.
                // Clear local state regardless of the result so the user always
                // ends up signed out.
                try {
                  await api.auth.logout();
                } catch {
                  // ignore — log out locally anyway
                }
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
