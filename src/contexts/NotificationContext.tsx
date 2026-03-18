"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Notification {
  id: string;
  type: "report" | "system" | "follow";
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  href: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NOTIF_KEY = "flint-notifications";

const defaultNotifications: Notification[] = [
  {
    id: "n1",
    type: "report",
    titleKo: "새 리포트 발행",
    titleEn: "New Report Published",
    descKo: "김서연 애널리스트가 'ADC 파이프라인 가치 재평가 시점의 도래' 리포트를 발행했습니다.",
    descEn: "Analyst Kim Seoyeon published 'ADC Pipeline Revaluation Timing'.",
    href: "/reports/abl-bio-adc-pipeline-revaluation",
    read: false,
    createdAt: "2026-03-15",
  },
  {
    id: "n2",
    type: "report",
    titleKo: "새 리포트 발행",
    titleEn: "New Report Published",
    descKo: "박준혁 애널리스트가 'HBM 후공정 장비 수혜, 실적 턴어라운드 임박' 리포트를 발행했습니다.",
    descEn: "Analyst Park Junhyuk published 'HBM Backend Equipment Turnaround'.",
    href: "/reports/oros-tech-hbm-turnaround",
    read: false,
    createdAt: "2026-03-12",
  },
  {
    id: "n3",
    type: "system",
    titleKo: "서비스 업데이트",
    titleEn: "Service Update",
    descKo: "다크 모드와 댓글 기능이 추가되었습니다. 지금 확인해보세요!",
    descEn: "Dark mode and comments feature have been added. Check it out!",
    href: "/notices",
    read: false,
    createdAt: "2026-03-18",
  },
  {
    id: "n4",
    type: "report",
    titleKo: "새 리포트 발행",
    titleEn: "New Report Published",
    descKo: "박준혁 애널리스트가 '레이저 장비 리더, AI 반도체 수혜 본격화' 리포트를 발행했습니다.",
    descEn: "Analyst Park Junhyuk published 'Laser Equipment Leader, AI Semiconductor'.",
    href: "/reports/eo-technics-ai-semiconductor",
    read: true,
    createdAt: "2026-03-01",
  },
];

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(defaultNotifications);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(defaultNotifications));
      }
    } catch {
      setNotifications(defaultNotifications);
    }
  }, []);

  const save = (items: Notification[]) => {
    setNotifications(items);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(items));
  };

  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      save(updated);
    },
    [notifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    save(updated);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
