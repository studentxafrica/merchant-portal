import React from 'react';
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Gift,
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  DollarSign,
  Settings,
  HelpCircle,
  Ticket,
  Tag,
  LayoutDashboard,
  Store
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const navigationItems = [
    { id: '', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'offers', label: 'Active Offers', icon: Tag },
    { id: 'coupons', label: 'Coupons', icon: Gift },
  ];

  const businessItems = [
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'stores', label: 'Stores', icon: Store },
    // { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
    // { id: 'earnings', label: 'Earnings', icon: DollarSign },
    // { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  const supportItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const renderNavItem = (item: any, isActive: boolean) => (
    <Button
      key={item.id}
      variant={isActive ? "default" : "ghost"}
      className={`w-full justify-start h-10 px-3 ${isActive
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
        }`}
      onClick={() => onTabChange(item.id)}
    >
      <item.icon className="h-4 w-4 mr-3" />
      <span className="text-sm">{item.label}</span>
      {item.badge && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Button>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <div className="space-y-1">
            {navigationItems.map((item) => renderNavItem(item, activeTab === item.id))}
          </div>
        </div>

        {/* Business */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Business
          </h3>
          <div className="space-y-1">
            {businessItems.map((item) => renderNavItem(item, activeTab === item.id))}
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Support
          </h3>
          <div className="space-y-1">
            {supportItems.map((item) => renderNavItem(item, activeTab === item.id))}
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Offers</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Orders in Queue</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-green-600">98%</span>
            </div>
          </div>
        </div> */}
      </div>
    </aside>
  );
};