export type Role = "READER" | "ANALYST" | "ADMIN";
export type Market = "KOSPI" | "KOSDAQ" | "KONEX";
export type ReportType = "COMPANY" | "INDUSTRY" | "EARNINGS" | "IPO";
export type ReportStatus = "DRAFT" | "REVIEW" | "PUBLISHED";
export type Opinion = "BULL" | "BASE" | "BEAR" | "NONE";

export interface ScenarioItem {
  type: "BULL" | "BASE" | "BEAR";
  label: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  bio?: string;
  coverSectors: string[];
  createdAt: string;
}

export interface Stock {
  id: string;
  code: string;
  name: string;
  market: Market;
  sector: string;
  marketCap?: number;
  isActive: boolean;
}

export interface Report {
  id: string;
  title: string;
  slug: string;
  type: ReportType;
  status: ReportStatus;
  content?: unknown;
  pdfUrl?: string;
  thumbnailUrl?: string;
  opinion?: Opinion;
  targetPrice?: number;
  scenarios?: ScenarioItem[];
  keyPoints: string[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  readTime?: number;
  authorId: string;
  author: User;
  stockId?: string;
  stock?: Stock;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analyst extends User {
  reportCount: number;
  totalViews: number;
}
