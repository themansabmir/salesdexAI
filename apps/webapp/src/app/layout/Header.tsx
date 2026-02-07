import { Button } from "@/shared/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/app/AuthContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import Sidebar from "@/components/sidebar";

const APP_CONFIG = {
  EXAMS: {
    MIN_PASSING_SCORE: 40,
  },
};

interface HeaderProps {
  user?: {
    fullName: string;
    userType: string;
  };
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const { user: authUser, logout } = useAuth();
  const currentUser = user || authUser;
  const handleLogout = onLogout || logout;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex h-14 items-center px-4">
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ExamDex</span>
          </div>

          {/* Mobile User Info */}
          <div className="ml-auto flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium truncate max-w-[120px]">{currentUser?.fullName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-xl">
        <div className="px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] font-semibold text-muted-foreground">
                Min Score: {APP_CONFIG.EXAMS.MIN_PASSING_SCORE}%
              </span>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">{currentUser?.fullName}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                {currentUser?.userType}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
