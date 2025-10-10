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

import { useProfile } from '@core/hooks';
import { useAuth } from '@supa/providers';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
import {
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
} from './sidebar';

export interface AdminSidebarItem {
  title: string;
  tooltip?: string;
  defaultOpen?: boolean;
  url?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: AdminSidebarItem[];
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

export function AdminSidebar({ logout }: { logout: () => Promise<void> }) {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!profile || !user) {
    return null;
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image width={28} height={28} alt="Curby Logo" objectFit="cover" src="/Curby-Head.png" />
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
        {data.map((section) =>
          !section.items ? (
            <SidebarGroup key={section.title}>
              <SidebarMenu key={section.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={section.title}>
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
                  <Collapsible key={item.title} asChild defaultOpen={item.defaultOpen}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={item.tooltip}>
                        {item.url ? (
                          <Link href={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </Link>
                        ) : (
                          <span>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </span>
                        )}
                      </SidebarMenuButton>
                      {item.items?.length ? (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90 rounded-sm">
                              <ChevronRight />
                              <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
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
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
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
