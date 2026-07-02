import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { visibleGroups } from "@/config/nav";
import { useAuthStore } from "@/stores/auth-store";

export function AppSidebar() {
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const { setOpenMobile, isMobile, state } = useSidebar();
  const groups = visibleGroups(role);
  const collapsed = state === "collapsed";

  const isActive = (to: string, matchPrefix?: boolean) =>
    matchPrefix
      ? location.pathname === to || location.pathname.startsWith(`${to}/`)
      : location.pathname === to;

  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b px-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <Link
          to="/dashboard"
          onClick={closeOnMobile}
          className="flex items-center justify-center"
          aria-label="InvoiceHub home"
        >
          {/* showText drives the monogram-only state — avoids hiding the "IH" glyph */}
          <Logo showText={!collapsed} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 pt-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Button
            render={<Link to="/invoices/new" />}
            className="w-full justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0"
            onClick={closeOnMobile}
          >
            <Plus className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              New invoice
            </span>
          </Button>
        </div>

        {groups.map((group, i) => (
          <Fragment key={group.label}>
            {/* In icon mode the group labels disappear; a thin rule keeps the
                clusters visually separated. */}
            {i > 0 && (
              <SidebarSeparator className="mx-auto hidden w-6 group-data-[collapsible=icon]:block" />
            )}
            <SidebarGroup className="group-data-[collapsible=icon]:py-1">
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={isActive(item.to, item.matchPrefix)}
                        tooltip={item.title}
                        render={<Link to={item.to} onClick={closeOnMobile} />}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">
          UI preview — data is mocked.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
