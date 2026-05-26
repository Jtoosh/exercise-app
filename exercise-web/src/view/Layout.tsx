import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="ml-1" />
        <div className="flex flex-1 flex-col p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}