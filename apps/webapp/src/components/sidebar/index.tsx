import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "@/shared/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  );
}
