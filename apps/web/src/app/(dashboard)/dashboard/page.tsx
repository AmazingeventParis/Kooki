'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Heart,
  ArrowUpRight,
  Plus,
  Wallet,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, progressPercent } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface FundraiserData {
  id: string;
  title: string;
  slug: string;
  status: string;
  currentAmount: number;
  maxAmount: number;
  donationCount: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [fundraisers, setFundraisers] = useState<FundraiserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.get<{ data: FundraiserData[] }>('/fundraisers/mine');
        setFundraisers(res.data);
      } catch {
        // No fundraisers yet
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalCollected = fundraisers.reduce((sum, f) => sum + f.currentAmount, 0);
  const totalDonors = fundraisers.reduce((sum, f) => sum + f.donationCount, 0);
  const activeFundraisers = fundraisers.filter((f) => f.status === 'ACTIVE').length;

  const statCards = [
    {
      label: 'Total collecte',
      value: totalCollected,
      isCurrency: true,
      icon: TrendingUp,
      color: 'from-kooki-500 to-kooki-600',
    },
    {
      label: 'Donateurs',
      value: totalDonors,
      isCurrency: false,
      icon: Users,
      color: 'from-ocean-500 to-ocean-600',
    },
    {
      label: 'Cagnottes actives',
      value: activeFundraisers,
      isCurrency: false,
      icon: Heart,
      color: 'from-grape-500 to-grape-600',
    },
    {
      label: 'Total cagnottes',
      value: fundraisers.length,
      isCurrency: false,
      icon: Wallet,
      color: 'from-sun-500 to-amber-500',
    },
  ];

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
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* My Fundraisers */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
            Mes cagnottes
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-kooki-500" />
          </div>
        ) : fundraisers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-4">Vous n&apos;avez pas encore de cagnotte</p>
            <Link href="/fundraisers/new">
              <Button variant="primary" size="md">
                <Plus size={18} />
                Creer ma premiere cagnotte
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {fundraisers.map((f) => (
              <Link
                key={f.id}
                href={`/fundraisers/${f.id}`}
                className="block p-4 rounded-xl border border-gray-100 hover:border-kooki-200 hover:bg-kooki-50/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-kooki-600 transition-colors">
                    {f.title}
                  </h3>
                  <Badge variant={f.status === 'ACTIVE' ? 'success' : f.status === 'CLOSED' ? 'error' : f.status === 'DRAFT' ? 'default' : 'warning'} size="sm">
                    {f.status === 'ACTIVE' ? 'Active' : f.status === 'DRAFT' ? 'Brouillon' : f.status === 'PAUSED' ? 'En pause' : f.status === 'CLOSED' ? 'Cloturee' : f.status}
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

            <Link
              href="/fundraisers/new"
              className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-kooki-300 hover:text-kooki-500 hover:bg-kooki-50/30 transition-all duration-200"
            >
              <Plus size={16} />
              Creer une cagnotte
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
