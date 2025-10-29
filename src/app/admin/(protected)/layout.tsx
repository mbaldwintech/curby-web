'use client';

import {
  AdminSidebar,
  LinkButton,
  LogoHorizontal,
  SidebarConfig,
  SidebarInset,
  SidebarProvider
} from '@core/components';
import { logout } from '@features/auth/actions';
import { useRoutePermissions } from '@features/auth/hooks';
import { PolicyGateProvider } from '@features/legal/hooks';
import { useProfile } from '@features/users/hooks';
import {
  Bell,
  BookOpen,
  Boxes,
  CheckSquare,
  Clock,
  Coins,
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
import Link from 'next/link';

const sidebarConfig: SidebarConfig = {
  profilePageUrl: '/admin/profile',
  items: [
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
          url: '/admin/events',
          icon: List,
          items: [
            {
              title: 'Event Log',
              tooltip: 'System Event Log',
              url: '/admin/events',
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
  ]
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const { canAccess } = useRoutePermissions();

  return (
    <PolicyGateProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)'
          } as React.CSSProperties
        }
      >
        <AdminSidebar config={sidebarConfig} profile={profile} canAccess={canAccess} logout={logout} />
        <SidebarInset>
          <div className="flex flex-1 flex-col">{children}</div>

          <footer id="contact" className="border-t-2 border-t-sidebar border-border">
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex flex-col items-start justify-start gap-2">
                <Link href="/">
                  <LogoHorizontal className="h-10 w-auto mb-4" />
                </Link>
                <p className="text-sm text-secondary-foreground">
                  Made with ❤️ for neighborhoods. Curby helps you keep good stuff in the community.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton variant="link" href="mailto:hello@curby.app">
                  hello@curby.app
                </LinkButton>
                <LinkButton variant="link" href="/legal/privacy">
                  Privacy
                </LinkButton>
                <LinkButton variant="link" href="/legal/terms">
                  Terms
                </LinkButton>
                <LinkButton variant="link" href="/admin">
                  Admin
                </LinkButton>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </PolicyGateProvider>
  );
}
