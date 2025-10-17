'use client';

import {
  Bell,
  BookOpen,
  Boxes,
  CheckSquare,
  ChevronRight,
  CircleUserRound,
  Clock,
  Coins,
  EllipsisVertical,
  Eye,
  FileText,
  Flag,
  Gavel,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutPanelTop,
  List,
  ListCheck,
  LogOut,
  Megaphone,
  MessageSquare,
  Monitor,
  Package,
  Scale,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Tags,
  Tv,
  UserCog,
  UserLock,
  UserRoundX,
  Users
} from 'lucide-react';

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
} from '@common/components';
import { useAuth } from '@supa/providers';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logout } from '../../actions/auth.actions';
import { useProfile, useRoutePermissions } from '../hooks';

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

const data: AdminSidebarItem[] = [
  {
    title: 'Dashboard',
    tooltip: 'Dashboard',
    url: '/admin',
    icon: Home
  },
  {
    title: 'Platform',
    tooltip: 'Platform Management',
    items: [
      {
        title: 'User Management',
        tooltip: 'Manage Users & Devices',
        defaultOpen: true,
        url: '/admin/users',
        icon: UserCog,
        items: [
          {
            title: 'Users',
            tooltip: 'Manage Users',
            url: '/admin/users',
            icon: Users
          },
          {
            title: 'Devices',
            tooltip: 'Manage Devices',
            url: '/admin/devices',
            icon: Monitor
          }
        ]
      },
      {
        title: 'Content Management',
        tooltip: 'Manage Items & Media',
        defaultOpen: true,
        url: '/admin/items',
        icon: Boxes,
        items: [
          {
            title: 'Items',
            tooltip: 'Manage Items',
            url: '/admin/items',
            icon: Package
          },
          {
            title: 'Media',
            tooltip: 'Manage Media',
            url: '/admin/media',
            icon: ImageIcon
          }
        ]
      },
      {
        title: 'Moderation',
        tooltip: 'Moderation Queue & History',
        defaultOpen: false,
        url: '/admin/moderation',
        icon: Shield,
        items: [
          {
            title: 'My Queue',
            tooltip: 'My Moderation Queue',
            url: '/admin/moderation/my-queue',
            icon: Inbox
          },
          {
            title: 'Pending Reported Items',
            tooltip: 'Pending Reported Items',
            url: '/admin/moderation/unassigned/reported-items',
            icon: List
          },
          {
            title: 'Pending Flagged Users',
            tooltip: 'Pending Flagged Users',
            url: '/admin/moderation/unassigned/flagged-users',
            icon: Flag
          },
          {
            title: 'Resolved Reports',
            tooltip: 'Resolved Reports',
            url: '/admin/moderation/resolved-reports',
            icon: ListCheck
          },
          {
            title: 'Suspended Users',
            tooltip: 'Suspended Users',
            url: '/admin/moderation/suspended-users',
            icon: UserLock
          },
          {
            title: 'Banned Users',
            tooltip: 'Banned Users',
            url: '/admin/moderation/banned-users',
            icon: UserRoundX
          }
        ]
      },
      {
        title: 'Activity',
        tooltip: 'Activity & Logs',
        defaultOpen: false,
        url: '/admin/events/logs',
        icon: List,
        items: [
          {
            title: 'Event Log',
            tooltip: 'System Event Log',
            url: '/admin/events/logs',
            icon: List
          },
          {
            title: 'Transactions',
            tooltip: 'Curby Coin Transactions',
            url: '/admin/curby-coins/transactions',
            icon: Coins
          },
          {
            title: 'Notifications',
            tooltip: 'User Notifications',
            url: '/admin/notifications',
            icon: Bell
          },
          {
            title: 'Tutorial Views',
            tooltip: 'Tutorial View Tracking',
            url: '/admin/tutorials/views',
            icon: Eye
          },
          {
            title: 'Feedback',
            tooltip: 'User Feedback',
            url: '/admin/feedback',
            icon: MessageSquare
          }
        ]
      },
      {
        title: 'Broadcasts & Messaging',
        tooltip: 'Manage Broadcasts & Messaging',
        defaultOpen: false,
        url: '/admin/broadcasts',
        icon: Megaphone,
        items: [
          {
            title: 'Broadcasts',
            tooltip: 'Manage Broadcasts',
            defaultOpen: false,
            url: '/admin/broadcasts',
            icon: Tv,
            items: [
              {
                title: 'Broadcasts',
                tooltip: 'Manage Broadcasts',
                url: '/admin/broadcasts',
                icon: Megaphone
              },
              {
                title: 'Schedules',
                tooltip: 'Manage Broadcast Schedules',
                url: '/admin/broadcasts/schedules',
                icon: Clock
              },
              {
                title: 'Deliveries',
                tooltip: 'Manage Broadcast Deliveries',
                url: '/admin/broadcasts/deliveries',
                icon: Send
              },
              {
                title: 'Delivery Views',
                tooltip: 'View Broadcast Delivery Views',
                url: '/admin/broadcasts/delivery-views',
                icon: Eye
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'System Settings',
    tooltip: 'Configuration & Settings',
    items: [
      {
        title: 'Event Types',
        tooltip: 'Manage Event Types',
        url: '/admin/events/types',
        icon: Tags
      },
      {
        title: 'Curby Coin Transaction Types',
        tooltip: 'Manage Curby Coin Transaction Types',
        url: '/admin/curby-coins/transactions/types',
        icon: Settings
      },
      {
        title: 'Notification Templates',
        tooltip: 'Manage Notification Templates',
        url: '/admin/notifications/templates',
        icon: LayoutPanelTop
      },
      {
        title: 'Tutorials',
        tooltip: 'Manage Tutorials',
        url: '/admin/tutorials',
        icon: BookOpen
      }
    ]
  },
  {
    title: 'Legal & Compliance',
    tooltip: 'Manage Legal & Compliance',
    items: [
      {
        title: 'Terms & Conditions',
        tooltip: 'Manage Terms & Conditions',
        defaultOpen: false,
        url: '/admin/legal/terms',
        icon: Scale,
        items: [
          {
            title: 'T&C Versions',
            tooltip: 'Terms & Conditions Versions',
            url: '/admin/legal/terms/versions',
            icon: FileText
          },
          {
            title: 'T&C Acceptances',
            tooltip: 'Terms & Conditions Acceptances',
            url: '/admin/legal/terms/acceptances',
            icon: CheckSquare
          }
        ]
      },
      {
        title: 'Privacy Policy',
        tooltip: 'Manage Privacy Policy',
        defaultOpen: false,
        url: '/admin/legal/privacy',
        icon: Gavel,
        items: [
          {
            title: 'Privacy Policy Versions',
            tooltip: 'Privacy Policy Versions',
            url: '/admin/legal/privacy/versions',
            icon: FileText
          },
          {
            title: 'Privacy Acceptances',
            tooltip: 'Privacy Policy Acceptances',
            url: '/admin/legal/privacy/acceptances',
            icon: ShieldCheck
          }
        ]
      }
    ]
  }
];

const SidebarSection = ({
  section,
  isActive
}: {
  section: AdminSidebarItem;
  isActive: (path?: string, exactMatch?: boolean) => boolean;
}) => {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const isSectionActive = isActive(section.url, true);
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

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { canAccess } = useRoutePermissions();

  function isActive(url?: string, exactMatch = false) {
    if (!url) return false;
    if (exactMatch) {
      return pathname === url;
    }
    return pathname === url || pathname.startsWith(`${url}/`);
  }

  if (!profile || !user) {
    return null;
  }

  // Filter sidebar data based on user permissions
  const filteredData = filterSidebarItems(data, canAccess);

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
                  <SidebarMenuButton asChild tooltip={section.title} isActive={isActive(section.url, true)}>
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
                    <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.username} />
                    <AvatarFallback className="rounded-lg">{profile.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{profile.username}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
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
                      <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.username} />
                      <AvatarFallback className="rounded-lg">{profile.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{profile.username}</span>
                      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/admin/profile">
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
