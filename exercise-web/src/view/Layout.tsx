import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dumbbell } from "lucide-react";
import { NavLink } from "react-router";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-background flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6">
          <SidebarTrigger className="h-9 w-9 border rounded-md" />
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Dumbbell className="h-5 w-5 text-emerald-500" />
            <span>FitGen</span>
          </NavLink>

          <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors hover:text-emerald-500 ${isActive ? "text-emerald-500 font-bold" : "text-muted-foreground"}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/buildWorkout"
              className={({ isActive }) =>
                `transition-colors hover:text-emerald-500 ${isActive ? "text-emerald-500 font-bold" : "text-muted-foreground"}`
              }
            >
              Workout Builder
            </NavLink>
            <NavLink
              to="/fetchExercise"
              className={({ isActive }) =>
                `transition-colors hover:text-emerald-500 ${isActive ? "text-emerald-500 font-bold" : "text-muted-foreground"}`
              }
            >
              Exercise Library
            </NavLink>
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}