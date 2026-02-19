'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

// TODO: Replace with API data
const MOCK_BALANCE = {
  available: 795000,
  pending: 50000,
};

const MOCK_FUNDRAISERS = [
  { id: 'f1', title: 'Refuge animal de Nantes', available: 645000 },
  { id: 'f2', title: 'Voyage scolaire CM2', available: 150000 },
];

const MOCK_WITHDRAWALS = [
  { id: 'w1', fundraiserTitle: 'Refuge animal de Nantes', amount: 300000, status: 'COMPLETED', createdAt: '2025-12-10T10:00:00Z' },
  { id: 'w2', fundraiserTitle: 'Refuge animal de Nantes', amount: 150000, status: 'PROCESSING', createdAt: '2025-12-18T14:30:00Z' },
  { id: 'w3', fundraiserTitle: 'Voyage scolaire CM2', amount: 50000, status: 'PENDING', createdAt: '2025-12-20T09:00:00Z' },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default'; color: string }> = {
  PENDING: { icon: Clock, label: 'En attente', variant: 'warning', color: 'text-amber-500' },
  PROCESSING: { icon: AlertCircle, label: 'En cours', variant: 'info', color: 'text-blue-500' },
  COMPLETED: { icon: CheckCircle2, label: 'Termine', variant: 'success', color: 'text-emerald-500' },
  FAILED: { icon: XCircle, label: 'Echoue', variant: 'error', color: 'text-red-500' },
};

export default function WithdrawalsPage() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedFundraiser, setSelectedFundraiser] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const handleRequestWithdrawal = () => {
    // TODO: Call API
    console.log('Request withdrawal', { fundraiserId: selectedFundraiser, amount: parseInt(withdrawalAmount) * 100 });
    setShowRequestDialog(false);
    setSelectedFundraiser('');
    setWithdrawalAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
            Retraits
          </h1>
          <p className="text-gray-500 mt-1">Gerez vos retraits et transferts bancaires</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowRequestDialog(true)}>
          <Wallet size={18} />
          Demander un retrait
        </Button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card hover={false} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-kooki-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                <TrendingUp size={16} />
                Solde disponible
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {formatCurrency(MOCK_BALANCE.available)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Retrait immediat possible</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <Card hover={false} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sun-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                <Clock size={16} />
                En cours de traitement
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {formatCurrency(MOCK_BALANCE.pending)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Transfert en cours</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Withdrawal history */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
            Historique des retraits
          </h2>
          <Badge variant="default">{MOCK_WITHDRAWALS.length} retraits</Badge>
        </div>

        {MOCK_WITHDRAWALS.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Aucun retrait pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 font-medium">Cagnotte</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Montant</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_WITHDRAWALS.map((w) => {
                  const config = STATUS_CONFIG[w.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2 size={16} className="text-gray-500" />
                          </div>
                          <span className="font-medium text-sm text-gray-900">
                            {w.fundraiserTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <Badge variant={config.variant} size="sm">
                          <config.icon size={12} className="mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="font-bold text-sm text-gray-900">
                          {formatCurrency(w.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-sm text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Request Withdrawal Dialog */}
      <Dialog
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        title="Demander un retrait"
        description="Les fonds seront transferes sur votre compte bancaire via Stripe."
        size="md"
      >
        <div className="space-y-5 mt-4">
          {/* Fundraiser selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cagnotte source
            </label>
            <div className="space-y-2">
              {MOCK_FUNDRAISERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFundraiser(f.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    selectedFundraiser === f.id
                      ? 'border-kooki-500 bg-kooki-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{f.title}</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(f.available)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <Input
            label="Montant a retirer (EUR)"
            type="number"
            min="1"
            placeholder="Ex: 500"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            rightIcon={<span className="text-sm text-gray-400">EUR</span>}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={() => setShowRequestDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleRequestWithdrawal}
              disabled={!selectedFundraiser || !withdrawalAmount}
            >
              Confirmer le retrait
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
