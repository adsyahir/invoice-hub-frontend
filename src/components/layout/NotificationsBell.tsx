import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Send,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/api/services/queries";
import type { NotificationItem } from "@/types";

// Icon + accent per notification type (falls back to a neutral bell).
const TYPE_META: Record<string, { icon: LucideIcon; className: string }> = {
  PAYMENT_RECEIVED: { icon: CircleDollarSign, className: "text-emerald-600" },
  INVOICE_PAID: { icon: CheckCircle2, className: "text-emerald-600" },
  INVOICE_SENT: { icon: Send, className: "text-sky-600" },
  INVOICE_OVERDUE: { icon: AlertTriangle, className: "text-amber-600" },
  PAYMENT_REFUNDED: { icon: Undo2, className: "text-rose-600" },
  EINVOICE_VALIDATED: { icon: BadgeCheck, className: "text-violet-600" },
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  const handleItem = (n: NotificationItem) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            className="relative"
          />
        }
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={unread === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        </div>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-3 py-10 text-center">
              <Bell className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You're all caught up
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta?.icon ?? Bell;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItem(n)}
                      className={cn(
                        "flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60",
                        !n.read && "bg-primary/[0.04]",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          meta?.className ?? "text-muted-foreground",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {n.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
