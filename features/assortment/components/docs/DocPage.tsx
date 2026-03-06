"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface DocSection {
  id: string;
  title: string;
}

interface DocPageProps {
  title: string;
  subtitle: string;
  sections: DocSection[];
  children: React.ReactNode;
}

export function DocPage({ title, subtitle, sections, children }: DocPageProps) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id ?? ""
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, IntersectionObserverEntry>>(
    new Map()
  );

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        sectionRefs.current.set(entry.target.id, entry);
      });

      // Find the topmost visible section
      let topSection: string | null = null;
      let topY = Infinity;

      sectionRefs.current.forEach((entry, id) => {
        if (entry.isIntersecting && entry.boundingClientRect.top < topY) {
          topY = entry.boundingClientRect.top;
          topSection = id;
        }
      });

      if (topSection) {
        setActiveSection(topSection);
      }
    },
    []
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: [0, 0.25, 0.5],
    });

    const observer = observerRef.current;

    // Observe all section headings
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections, handleIntersection]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {title}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-base max-w-3xl">{subtitle}</p>
      </div>

      {/* Layout: Content + TOC */}
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            {children}
          </div>
        </div>

        {/* Sticky Table of Contents - hidden on mobile */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  On This Page
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable doc building blocks */

export function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight mb-4 pb-2 border-b">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function DocSubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  );
}

export function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4 text-sm">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
              i
            </span>
          </div>
        </div>
        <div className="text-blue-800 dark:text-blue-200">{children}</div>
      </div>
    </div>
  );
}

export function WarningCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 text-sm">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
              !
            </span>
          </div>
        </div>
        <div className="text-amber-800 dark:text-amber-200">{children}</div>
      </div>
    </div>
  );
}

export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
      {children}
    </div>
  );
}
