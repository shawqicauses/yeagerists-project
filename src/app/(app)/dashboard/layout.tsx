// REVIEWED - 01

import { PropsWithChildren } from "react";

import { SidebarMainProvider } from "../provider";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarMainProvider>
      <div className="py-24 lg:py-32">{children}</div>
    </SidebarMainProvider>
  );
}
