"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, FileText, Info, UserCheck } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLang } from "@/contexts/LanguageContext";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const iconMap = {
    report: FileText,
    system: Info,
    follow: UserCheck,
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#FAFAF9] hover:text-[#1C1917] dark:hover:bg-[#292524] dark:hover:text-[#F5F5F4]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-[#E5E7EB] dark:border-[#292524] bg-white dark:bg-[#1C1917] shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#292524] px-4 py-3">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
                {t("알림", "Notifications")}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-[#EA580C] hover:underline"
                >
                  {t("모두 읽음", "Mark all read")}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-6 w-6 text-[#A8A29E]" />
                  <p className="mt-2 text-xs text-[#6B7280]">
                    {t("알림이 없습니다", "No notifications")}
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        markAsRead(n.id);
                        setOpen(false);
                      }}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF9] dark:hover:bg-[#292524] ${
                        !n.read ? "bg-[#EA580C]/5" : ""
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          n.type === "report"
                            ? "bg-[#EA580C]/10 text-[#EA580C]"
                            : n.type === "system"
                              ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                              : "bg-[#10B981]/10 text-[#10B981]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                            {t(n.titleKo, n.titleEn)}
                          </p>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C]" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">
                          {t(n.descKo, n.descEn)}
                        </p>
                        <p className="mt-1 text-[10px] text-[#A8A29E]">{n.createdAt}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
