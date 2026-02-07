import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";

interface PageHeader {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface MainContentProps {
  children: ReactNode;
  header?: PageHeader;
}

export function MainContent({ children, header }: MainContentProps) {
  return (
    <main className="flex-1">
      <div className="container  max-w-7xl">
        {/* Page Header */}
        {header && (
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{header.title}</h1>
                {header.description && (
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    {header.description}
                  </p>
                )}
              </div>
              {header.action && (
                <Button className="btn-primary shrink-0" onClick={header.action.onClick}>
                  {header.action.label}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative">{children}</div>
        </div>
      </div>
    </main>
  );
}
