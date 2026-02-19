'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Wallet,
  Building2,
  Settings,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard', label: 'Mes cagnottes', icon: Heart, matchPrefix: '/fundraisers' },
  { href: '/withdrawals', label: 'Retraits', icon: Wallet },
  { href: '/dashboard', label: 'Organisation', icon: Building2 },
  { href: '/dashboard', label: 'Parametres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/">
          <span className="text-2xl font-extrabold font-[family-name:var(--font-heading)] gradient-text">
            Kooki
          </span>
        </Link>
      </div>

      {/* User section */}
      <div className="p-4 mx-3 mt-3 rounded-xl bg-gradient-to-r from-kooki-50 to-grape-500/5 border border-kooki-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'K'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`
                : user?.email?.split('@')[0] || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* New fundraiser button */}
      <div className="px-4 mt-4">
        <Link href="/fundraisers/new">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 gradient-cta text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-kooki-500/25 transition-all duration-200 cursor-pointer">
            <Plus size={18} />
            Nouvelle cagnotte
          </button>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.matchPrefix && pathname.startsWith(item.matchPrefix));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-kooki-50 text-kooki-600 border border-kooki-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                size={18}
                className={cn(isActive ? 'text-kooki-500' : 'text-gray-400')}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
