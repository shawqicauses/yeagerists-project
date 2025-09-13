// REVIEWED

import { PropsWithChildren } from "react";

import { SidebarMainProvider } from "../provider";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarMainProvider>
      <div className="pt-12 lg:pt-24 xl:pt-32">{children}</div>
    </SidebarMainProvider>
  );
}
