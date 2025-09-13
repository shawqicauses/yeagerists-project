"use client";

// REVIEWED - 01

import { QueryClientProvider } from "@tanstack/react-query";
import { BookCheckIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ElementType, Fragment, PropsWithChildren, useEffect } from "react";

import { SafeHydrate } from "@/components/globals/safe-hydrate";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { getQueryClient } from "@/lib/query";

export const QueryProvider = function QueryProvider({
  children,
}: PropsWithChildren) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const SidebarMenuMainItem = function SidebarMenuMainItem({
  item,
  children,
}: PropsWithChildren & {
  item: { icon: ElementType | undefined; href: string; label: string };
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isActive = pathname.includes(item.href);

  return (
    <SidebarMenuItem className="group-data-[collapsible_=_icon]:flex group-data-[collapsible_=_icon]:justify-center">
      <SidebarMenuButton
        asChild
        tooltip={item.label}
        isActive={isActive}
        onClick={() => {
          setOpenMobile(false);
        }}
        className="relative overflow-visible text-muted-foreground hover:bg-sidebar hover:text-sidebar-primary active:bg-sidebar active:font-medium active:text-sidebar-primary data-[active_=_true]:bg-sidebar data-[active_=_true]:text-sidebar-primary data-[active_=_true]:after:absolute data-[active_=_true]:after:-left-2 data-[active_=_true]:after:top-0 data-[active_=_true]:after:h-full data-[active_=_true]:after:w-px data-[active_=_true]:after:bg-sidebar-primary group-data-[collapsible_=_icon]:!size-[calc(var(--sidebar-width-icon)_-_2rem)] group-data-[collapsible_=_icon]:!p-0 group-data-[collapsible_=_icon]:data-[active_=_true]:after:-left-4">
        <Link href={item.href}>
          {item.icon ? (
            <div className="flex aspect-square size-5 items-center justify-center group-data-[collapsible_=_icon]:size-[calc(var(--sidebar-width-icon)_-_2rem)]">
              <item.icon className="!size-5 stroke-[1.5]" />
            </div>
          ) : null}
          <span className="capitalize">{item.label}</span>
          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const SidebarMainProvider = function SidebarMainProvider({
  children,
}: PropsWithChildren) {
  const { isPending, data: user } = useUser();
  return (
    <SafeHydrate>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <h1 className="font-semibold tracking-tight">
              Yeagerists <span className="text-tertiary-2">Verifier</span>.
            </h1>
            {/* <WebsiteSwitcher /> */}
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Pages</SidebarGroupLabel>
              <SidebarMenu>
                {!isPending && user && user.role === "issuer-user" ? (
                  <Fragment>
                    <SidebarMenuMainItem
                      item={{
                        href: "/dashboard/verifier",
                        label: "Verifier",
                        icon: BookCheckIcon,
                      }}
                    />
                    <SidebarMenuMainItem
                      item={{
                        href: "/dashboard/signer",
                        label: "Signer",
                        icon: ShieldCheckIcon,
                      }}
                    />
                  </Fragment>
                ) : null}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="w-full max-w-full">
          <header className="top-b fixed left-0 right-0 z-40 flex shrink-0 items-center justify-start bg-background py-4 transition-all duration-100 ease-in-out">
            <div className="flex flex-col items-start justify-start gap-4 px-5 lg:px-7 xs:flex-row xs:items-center">
              <Separator
                orientation="vertical"
                className="hidden data-[orientation_=_vertical]:h-5 xs:block"
              />
              <SidebarTrigger />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SafeHydrate>
  );
};

export const RedirectProvider = function RedirectProvider({
  path,
  children,
}: { path: string } & PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    router.push(path);
  }, [router, path]);

  return children;
};
