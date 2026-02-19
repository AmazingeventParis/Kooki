'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Heart,
  ArrowUpRight,
  Plus,
  Eye,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, progressPercent } from '@/lib/utils';

// TODO: Replace with API data
const MOCK_STATS = {
  totalCollected: 845000,
  totalDonors: 234,
  activeFundraisers: 2,
  pendingWithdrawals: 50000,
};

const MOCK_RECENT_DONATIONS = [
  { id: '1', donorName: 'Pierre M.', amount: 5000, fundraiserTitle: 'Refuge animal de Nantes', createdAt: '2025-12-20T14:30:00Z' },
  { id: '2', donorName: 'Sophie L.', amount: 2500, fundraiserTitle: 'Refuge animal de Nantes', createdAt: '2025-12-19T09:15:00Z' },
  { id: '3', donorName: 'Famille Durand', amount: 15000, fundraiserTitle: 'Voyage scolaire CM2', createdAt: '2025-12-18T18:45:00Z' },
  { id: '4', donorName: 'Anonyme', amount: 10000, fundraiserTitle: 'Refuge animal de Nantes', createdAt: '2025-12-17T11:00:00Z' },
  { id: '5', donorName: 'Jean-Paul R.', amount: 3000, fundraiserTitle: 'Voyage scolaire CM2', createdAt: '2025-12-16T16:20:00Z' },
];

const MOCK_FUNDRAISERS = [
  {
    id: '1',
    title: 'Refuge animal de Nantes',
    status: 'ACTIVE',
    currentAmount: 845000,
    maxAmount: 1200000,
    donationCount: 234,
    slug: 'refuge-animal',
  },
  {
    id: '2',
    title: 'Voyage scolaire CM2',
    status: 'ACTIVE',
    currentAmount: 312000,
    maxAmount: 500000,
    donationCount: 89,
    slug: 'voyage-scolaire-cm2',
  },
];

const statCards = [
  {
    label: 'Total collecte',
    value: MOCK_STATS.totalCollected,
    isCurrency: true,
    icon: TrendingUp,
    color: 'from-kooki-500 to-kooki-600',
    bgLight: 'bg-kooki-50',
    change: '+12%',
  },
  {
    label: 'Donateurs',
    value: MOCK_STATS.totalDonors,
    isCurrency: false,
    icon: Users,
    color: 'from-ocean-500 to-ocean-600',
    bgLight: 'bg-ocean-400/10',
    change: '+8',
  },
  {
    label: 'Cagnottes actives',
    value: MOCK_STATS.activeFundraisers,
    isCurrency: false,
    icon: Heart,
    color: 'from-grape-500 to-grape-600',
    bgLight: 'bg-grape-500/10',
    change: null,
  },
  {
    label: 'En attente de retrait',
    value: MOCK_STATS.pendingWithdrawals,
    isCurrency: true,
    icon: Wallet,
    color: 'from-sun-500 to-amber-500',
    bgLight: 'bg-sun-500/10',
    change: null,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
            Bonjour, {user?.firstName || 'Createur'} !
          </h1>
          <p className="text-gray-500 mt-1">
            Voici un apercu de vos cagnottes aujourd&apos;hui.
          </p>
        </div>
        <Link href="/fundraisers/new">
          <Button variant="primary" size="md">
            <Plus size={18} />
            Nouvelle cagnotte
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Card hover={false} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stat.isCurrency
                      ? formatCurrency(stat.value)
                      : stat.value.toLocaleString('fr-FR')}
                  </p>
                  {stat.change && (
                    <p className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1">
                      <ArrowUpRight size={12} />
                      {stat.change} ce mois
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donations */}
        <div className="lg:col-span-2">
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
                Derniers dons recus
              </h2>
              <Badge variant="brand">{MOCK_RECENT_DONATIONS.length} recents</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-medium">Donateur</th>
                    <th className="pb-3 font-medium">Cagnotte</th>
                    <th className="pb-3 font-medium text-right">Montant</th>
                    <th className="pb-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_RECENT_DONATIONS.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kooki-100 to-grape-500/10 flex items-center justify-center text-xs font-bold text-kooki-600 shrink-0">
                            {donation.donorName[0]}
                          </div>
                          <span className="font-medium text-sm text-gray-900">
                            {donation.donorName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {donation.fundraiserTitle}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-sm text-emerald-600">
                          +{formatCurrency(donation.amount)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm text-gray-400">
                          {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* My Fundraisers */}
        <div>
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
                Mes cagnottes
              </h2>
            </div>

            <div className="space-y-4">
              {MOCK_FUNDRAISERS.map((f) => (
                <Link
                  key={f.id}
                  href={`/fundraisers/${f.id}`}
                  className="block p-3 rounded-xl border border-gray-100 hover:border-kooki-200 hover:bg-kooki-50/30 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-kooki-600 transition-colors">
                      {f.title}
                    </h3>
                    <Badge variant={f.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {f.status === 'ACTIVE' ? 'Active' : f.status}
                    </Badge>
                  </div>
                  <Progress
                    value={progressPercent(f.currentAmount, f.maxAmount)}
                    size="sm"
                    className="mt-3"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {formatCurrency(f.currentAmount)}
                    </span>
                    <span>{f.donationCount} dons</span>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/fundraisers/new"
              className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-kooki-300 hover:text-kooki-500 hover:bg-kooki-50/30 transition-all duration-200"
            >
              <Plus size={16} />
              Creer une cagnotte
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
