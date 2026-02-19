'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Pause,
  Play,
  X,
  Wallet,
  TrendingUp,
  Users,
  Eye,
  Edit3,
  Copy,
  Check,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, progressPercent } from '@/lib/utils';

// TODO: Replace with API call using id param
const MOCK_FUNDRAISER = {
  id: 'f1',
  title: 'Aide pour la reconstruction du refuge animal de Nantes',
  slug: 'refuge-animal',
  type: 'PERSONAL' as const,
  status: 'ACTIVE' as string,
  planCode: 'PERSONAL_STANDARD',
  currentAmount: 845000,
  maxAmount: 1200000,
  donationCount: 234,
  createdAt: '2025-12-01T10:00:00Z',
  updatedAt: '2025-12-20T14:30:00Z',
};

const MOCK_DONATIONS = [
  { id: '1', donorName: 'Pierre M.', amount: 5000, donorMessage: 'Courage !', status: 'COMPLETED', createdAt: '2025-12-20T14:30:00Z' },
  { id: '2', donorName: 'Anonyme', amount: 10000, donorMessage: '', status: 'COMPLETED', createdAt: '2025-12-19T09:15:00Z' },
  { id: '3', donorName: 'Sophie L.', amount: 2500, donorMessage: 'Pour les animaux', status: 'COMPLETED', createdAt: '2025-12-18T18:45:00Z' },
  { id: '4', donorName: 'Famille Durand', amount: 15000, donorMessage: 'Bravo !', status: 'COMPLETED', createdAt: '2025-12-17T11:00:00Z' },
  { id: '5', donorName: 'Jean-Paul R.', amount: 3000, donorMessage: '', status: 'COMPLETED', createdAt: '2025-12-16T16:20:00Z' },
  { id: '6', donorName: 'Marie C.', amount: 7500, donorMessage: 'On est avec vous', status: 'COMPLETED', createdAt: '2025-12-15T08:00:00Z' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  PAUSED: { label: 'En pause', variant: 'warning' },
  CLOSED: { label: 'Cloturee', variant: 'error' },
  DRAFT: { label: 'Brouillon', variant: 'default' },
  COMPLETED: { label: 'Terminee', variant: 'success' },
};

export default function FundraiserManagementPage() {
  const fundraiser = MOCK_FUNDRAISER;
  const percent = progressPercent(fundraiser.currentAmount, fundraiser.maxAmount);
  const [copied, setCopied] = useState(false);
  const statusInfo = STATUS_MAP[fundraiser.status] || STATUS_MAP.DRAFT;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/c/${fundraiser.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900 line-clamp-1">
                {fundraiser.title}
              </h1>
              <Badge variant={statusInfo.variant} size="sm">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Calendar size={14} />
              Creee le {new Date(fundraiser.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copie' : 'Lien'}
          </Button>
          <Link href={`/c/${fundraiser.slug}`} target="_blank">
            <Button variant="ghost" size="sm">
              <ExternalLink size={16} />
              Voir
            </Button>
          </Link>
          <Button variant="secondary" size="sm">
            <Edit3 size={16} />
            Modifier
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total collecte',
            value: formatCurrency(fundraiser.currentAmount),
            icon: TrendingUp,
            color: 'from-kooki-500 to-kooki-600',
          },
          {
            label: 'Objectif',
            value: formatCurrency(fundraiser.maxAmount),
            icon: Eye,
            color: 'from-ocean-500 to-ocean-600',
          },
          {
            label: 'Donateurs',
            value: fundraiser.donationCount.toString(),
            icon: Users,
            color: 'from-grape-500 to-grape-600',
          },
          {
            label: 'Progression',
            value: `${percent}%`,
            icon: TrendingUp,
            color: 'from-sun-500 to-amber-500',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card hover={false} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={16} className="text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progression de la collecte</span>
          <span className="text-sm font-bold text-kooki-500">{percent}%</span>
        </div>
        <Progress value={percent} size="lg" />
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>0 EUR</span>
          <span>{formatCurrency(fundraiser.maxAmount)}</span>
        </div>
      </Card>

      {/* Actions */}
      <Card hover={false}>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
          Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {fundraiser.status === 'ACTIVE' && (
            <Button variant="secondary" size="md">
              <Pause size={16} />
              Mettre en pause
            </Button>
          )}
          {fundraiser.status === 'PAUSED' && (
            <Button variant="primary" size="md">
              <Play size={16} />
              Reprendre
            </Button>
          )}
          <Link href="/withdrawals">
            <Button variant="primary" size="md">
              <Wallet size={16} />
              Demander un retrait
            </Button>
          </Link>
          <Button variant="danger" size="md">
            <X size={16} />
            Cloturer
          </Button>
        </div>
      </Card>

      {/* Donations table */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
            Historique des dons
          </h2>
          <Badge variant="default">{MOCK_DONATIONS.length} dons</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-medium">Donateur</th>
                <th className="pb-3 font-medium">Message</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium text-right">Montant</th>
                <th className="pb-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_DONATIONS.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kooki-100 to-grape-500/10 flex items-center justify-center text-xs font-bold text-kooki-600 shrink-0">
                        {donation.donorName[0]}
                      </div>
                      <span className="font-medium text-sm text-gray-900">
                        {donation.donorName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {donation.donorMessage || '-'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant="success" size="sm">Confirme</Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="font-bold text-sm text-emerald-600">
                      {formatCurrency(donation.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
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
  );
}
