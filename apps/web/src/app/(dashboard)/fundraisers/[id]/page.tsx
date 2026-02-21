'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Calendar,
  Loader2,
  AlertTriangle,
  Euro,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, progressPercent } from '@/lib/utils';

interface FundraiserData {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  planCode: string;
  currentAmount: number;
  maxAmount: number;
  donationCount: number;
  coverImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DonationData {
  id: string;
  amount: number;
  donorName: string;
  donorMessage: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  PAUSED: { label: 'En pause', variant: 'warning' },
  CLOSED: { label: 'Cloturee', variant: 'error' },
  DRAFT: { label: 'Brouillon', variant: 'default' },
  COMPLETED: { label: 'Terminee', variant: 'success' },
};

export default function FundraiserManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [fundraiser, setFundraiser] = useState<FundraiserData | null>(null);
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Dialogs
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [fundraiserRes, donationsRes] = await Promise.all([
        apiClient.get<{ data: FundraiserData }>(`/fundraisers/manage/${id}`),
        apiClient.get<{ data: DonationData[]; total: number }>(`/fundraisers/${id}/donations?pageSize=50`),
      ]);
      setFundraiser(fundraiserRes.data);
      setDonations(donationsRes.data);
      setTotalDonations(donationsRes.total);
    } catch {
      setError('Impossible de charger cette cagnotte');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyLink = () => {
    if (!fundraiser) return;
    navigator.clipboard.writeText(`${window.location.origin}/c/${fundraiser.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePause = async () => {
    setActionLoading('pause');
    try {
      await apiClient.post(`/fundraisers/${id}/pause`);
      setFundraiser((prev) => prev ? { ...prev, status: 'PAUSED' } : prev);
      toast('success', 'Cagnotte mise en pause');
    } catch {
      toast('error', 'Erreur lors de la mise en pause');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    setActionLoading('resume');
    try {
      await apiClient.post(`/fundraisers/${id}/resume`);
      setFundraiser((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
      toast('success', 'Cagnotte reprise');
    } catch {
      toast('error', 'Erreur lors de la reprise');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    setActionLoading('close');
    try {
      await apiClient.post(`/fundraisers/${id}/close`);
      setFundraiser((prev) => prev ? { ...prev, status: 'CLOSED' } : prev);
      setCloseDialogOpen(false);
      toast('success', 'Cagnotte cloturee');
    } catch {
      toast('error', 'Erreur lors de la cloture');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    const euros = parseFloat(withdrawAmount.replace(',', '.'));
    if (isNaN(euros) || euros <= 0) {
      setWithdrawError('Montant invalide');
      return;
    }
    const cents = Math.round(euros * 100);
    if (fundraiser && cents > fundraiser.currentAmount) {
      setWithdrawError(`Maximum : ${formatCurrency(fundraiser.currentAmount)}`);
      return;
    }

    setActionLoading('withdraw');
    setWithdrawError('');
    try {
      await apiClient.post('/withdrawals', { fundraiserId: id, amount: cents });
      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      toast('success', 'Demande de retrait enregistree');
      fetchData();
    } catch {
      toast('error', 'Erreur lors de la demande de retrait');
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  // Error state
  if (error || !fundraiser) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <p className="text-gray-600 mb-4">{error || 'Cagnotte introuvable'}</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            <ArrowLeft size={16} />
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  const percent = progressPercent(fundraiser.currentAmount, fundraiser.maxAmount);
  const statusInfo = STATUS_MAP[fundraiser.status] || STATUS_MAP.DRAFT;
  const canManage = fundraiser.status === 'ACTIVE' || fundraiser.status === 'PAUSED';

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
      {canManage && (
        <Card hover={false}>
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
            Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {fundraiser.status === 'ACTIVE' && (
              <Button
                variant="secondary"
                size="md"
                onClick={handlePause}
                isLoading={actionLoading === 'pause'}
                disabled={!!actionLoading}
              >
                <Pause size={16} />
                Mettre en pause
              </Button>
            )}
            {fundraiser.status === 'PAUSED' && (
              <Button
                variant="primary"
                size="md"
                onClick={handleResume}
                isLoading={actionLoading === 'resume'}
                disabled={!!actionLoading}
              >
                <Play size={16} />
                Reprendre
              </Button>
            )}
            {fundraiser.currentAmount > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setWithdrawAmount('');
                  setWithdrawError('');
                  setWithdrawDialogOpen(true);
                }}
                disabled={!!actionLoading}
              >
                <Wallet size={16} />
                Demander un retrait
              </Button>
            )}
            <Button
              variant="danger"
              size="md"
              onClick={() => setCloseDialogOpen(true)}
              disabled={!!actionLoading}
            >
              <X size={16} />
              Cloturer
            </Button>
          </div>
        </Card>
      )}

      {/* Donations table */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
            Historique des dons
          </h2>
          <Badge variant="default">{totalDonations} don{totalDonations > 1 ? 's' : ''}</Badge>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucun don pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 font-medium">Donateur</th>
                  <th className="pb-3 font-medium">Message</th>
                  <th className="pb-3 font-medium text-right">Montant</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kooki-100 to-grape-500/10 flex items-center justify-center text-xs font-bold text-kooki-600 shrink-0">
                          {(donation.donorName || 'A')[0]}
                        </div>
                        <span className="font-medium text-sm text-gray-900">
                          {donation.donorName || 'Anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="text-sm text-gray-500 line-clamp-1">
                        {donation.donorMessage || '-'}
                      </span>
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
        )}
      </Card>

      {/* Close confirmation dialog */}
      <Dialog
        isOpen={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        title="Cloturer la cagnotte"
        description="Cette action est irreversible. La cagnotte ne pourra plus recevoir de dons."
        size="sm"
      >
        <div className="flex gap-3 mt-4">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setCloseDialogOpen(false)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleClose}
            isLoading={actionLoading === 'close'}
            className="flex-1"
          >
            Cloturer
          </Button>
        </div>
      </Dialog>

      {/* Withdrawal dialog */}
      <Dialog
        isOpen={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        title="Demander un retrait"
        description={`Solde disponible : ${formatCurrency(fundraiser.currentAmount)}`}
        size="sm"
      >
        <div className="mt-4 space-y-4">
          <Input
            label="Montant (EUR)"
            type="number"
            min="1"
            step="0.01"
            placeholder="Ex: 50.00"
            value={withdrawAmount}
            onChange={(e) => {
              setWithdrawAmount(e.target.value);
              setWithdrawError('');
            }}
            error={withdrawError}
            leftIcon={<Euro size={16} />}
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setWithdrawDialogOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleWithdraw}
              isLoading={actionLoading === 'withdraw'}
              className="flex-1"
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
