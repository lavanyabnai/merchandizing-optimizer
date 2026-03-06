"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  GitBranch,
  Upload,
  Zap,
  FlaskConical,
  Layers,
  LayoutGrid,
  History,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAssortmentStore } from "@/features/assortment/store/use-assortment-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BASE = "/merchandizing-optimizer";

const NAV_MAIN = [
  { label: "Dashboard", href: `${BASE}/dashboard`, icon: BarChart3 },
  { label: "CDT Analysis", href: `${BASE}/cdt`, icon: GitBranch },
  { label: "Data Upload", href: `${BASE}/data`, icon: Upload },
  { label: "Optimization", href: `${BASE}/optimization`, icon: Zap },
  { label: "Simulation", href: `${BASE}/simulation`, icon: FlaskConical },
  { label: "Clustering", href: `${BASE}/clustering`, icon: Layers },
  { label: "Planogram", href: `${BASE}/planogram`, icon: LayoutGrid },
  { label: "Scenarios", href: `${BASE}/scenarios`, icon: History },
];

const NAV_DOCS = [
  { label: "Optimization Docs", href: `${BASE}/docs/optimization`, icon: FileText },
  { label: "Simulation Docs", href: `${BASE}/docs/simulation`, icon: FileText },
  { label: "Clustering Docs", href: `${BASE}/docs/clustering`, icon: FileText },
];

export function AssortmentSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useAssortmentStore();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-background transition-all duration-300 shrink-0",
        isSidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b">
        {!isSidebarCollapsed && (
          <span className="text-sm font-semibold truncate">Assortment</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {NAV_MAIN.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== `${BASE}/dashboard` && pathname.startsWith(item.href));

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isSidebarCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (isSidebarCollapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </div>

        <Separator className="my-3" />

        {/* Documentation Links */}
        <div className="space-y-1 px-2">
          {!isSidebarCollapsed && (
            <p className="px-2.5 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Documentation
            </p>
          )}
          {NAV_DOCS.map((item) => {
            const isActive = pathname === item.href;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isSidebarCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (isSidebarCollapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </div>
      </nav>
    </aside>
  );
}
