'use client';

import { ChevronRight, CircleUserRound, EllipsisVertical, LogOut } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from './base';

export interface AdminSidebarItem {
  title: string;
  tooltip?: string;
  defaultOpen?: boolean;
  url?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: AdminSidebarItem[];
}

// Filter sidebar items based on user permissions
function filterSidebarItems(items: AdminSidebarItem[], canAccess: (path: string) => boolean): AdminSidebarItem[] {
  return items
    .map((item) => {
      // If item has URL, check if user can access it
      if (item.url && !canAccess(item.url)) {
        return null;
      }

      // If item has sub-items, filter them recursively
      if (item.items) {
        const filteredSubItems = filterSidebarItems(item.items, canAccess);

        // If no sub-items are accessible, hide the parent item
        if (filteredSubItems.length === 0) {
          return null;
        }

        return {
          ...item,
          items: filteredSubItems
        };
      }

      return item;
    })
    .filter((item): item is AdminSidebarItem => item !== null);
}

export interface SidebarConfig {
  profilePageUrl?: string;
  items: AdminSidebarItem[];
}

const SidebarSection = ({
  section,
  isActive
}: {
  section: AdminSidebarItem;
  isActive: (path?: string, children?: AdminSidebarItem[]) => boolean;
}) => {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const isSectionActive = isActive(section.url, section.items);
  const isChildActive = section.items?.some((sub) => isActive(sub.url)) ?? false;

  return (
    <Collapsible asChild defaultOpen={section.defaultOpen} open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={section.tooltip} isActive={open ? false : isSectionActive || isChildActive}>
          {section.url ? (
            <Link href={section.url}>
              {section.icon && <section.icon />}
              <span>{section.title}</span>
            </Link>
          ) : (
            <span>
              {section.icon && <section.icon />}
              <span>{section.title}</span>
            </span>
          )}
        </SidebarMenuButton>
        {section.items?.length ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90 rounded-sm">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {section.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                      <a href={subItem.url}>
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  );
};

export function AdminSidebar({
  config,
  profile,
  canAccess,
  logout
}: {
  config: SidebarConfig;
  profile?: { username: string; email?: string | null; avatarUrl?: string | null } | null;
  canAccess: (path: string) => boolean;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  function isActive(url?: string, children?: AdminSidebarItem[]) {
    if (!url) return false;
    if (pathname === url) {
      return true;
    }
    if (children?.some((child) => isActive(child.url, child.items || []))) {
      return true;
    }
    return false;
  }

  if (!profile) {
    return null;
  }

  // Filter sidebar data based on user permissions
  const filteredData = filterSidebarItems(config.items, canAccess);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    width={28}
                    height={28}
                    alt="Curby Logo"
                    style={{ objectFit: 'contain' }}
                    src="/Curby-Head.png"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Curby</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredData.map((section) =>
          !section.items ? (
            <SidebarGroup key={section.title}>
              <SidebarMenu key={section.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={section.title} isActive={isActive(section.url)}>
                    <a href={section.url}>
                      {section.icon && <section.icon />}
                      <span>{section.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          ) : (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarMenu>
                {section.items?.map((item) => (
                  <SidebarSection key={item.title} section={item} isActive={isActive} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.username} />
                    <AvatarFallback className="rounded-lg">{profile?.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{profile?.username}</span>
                    <span className="text-muted-foreground truncate text-xs">{profile?.email}</span>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.username} />
                      <AvatarFallback className="rounded-lg">{profile?.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{profile?.username}</span>
                      <span className="text-muted-foreground truncate text-xs">{profile?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href={config.profilePageUrl || '/admin/profile'}>
                    <DropdownMenuItem>
                      <CircleUserRound />
                      Account
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
