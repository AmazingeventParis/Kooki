'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Users,
  Clock,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Shield,
  Lock,
  Loader2,
} from 'lucide-react';
import { tipSuggestion, formatCurrency, progressPercent } from '@kooki/shared';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface Fundraiser {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  currentAmount: number;
  maxAmount: number;
  donationCount: number;
  status: string;
  type: string;
  createdAt: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  organization?: {
    id: string;
    legalName: string;
    isTaxEligible: boolean;
  } | null;
}

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  donorMessage: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

export default function FundraiserPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [includeTip, setIncludeTip] = useState(true);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMobileDonate, setShowMobileDonate] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.get<{ data: Fundraiser }>(`/fundraisers/${slug}`);
        setFundraiser(res.data);

        // Fetch donations
        try {
          const donRes = await apiClient.get<{ data: Donation[] }>(`/fundraisers/${res.data.id}/donations`);
          setDonations(donRes.data);
        } catch {
          // No donations yet
        }
      } catch {
        setError('Cagnotte non trouvee');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const activeAmount = isCustom ? (parseInt(customAmount) || 0) * 100 : selectedAmount;
  const tipAmount = useMemo(() => (includeTip ? tipSuggestion(activeAmount) : 0), [activeAmount, includeTip]);
  const totalAmount = activeAmount + tipAmount;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundraiser || activeAmount < 100) return;

    setIsDonating(true);
    setDonationError('');

    try {
      const res = await apiClient.post<{ data: { url: string } }>('/donations/checkout', {
        fundraiserId: fundraiser.id,
        amount: activeAmount,
        tipAmount: includeTip ? tipAmount : 0,
        donorName,
        donorEmail,
        donorMessage: donorMessage || undefined,
        isAnonymous: false,
        wantsReceipt: false,
      });

      // Redirect to Stripe Checkout
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la creation du paiement';
      setDonationError(message);
      setIsDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96 mt-20">
          <Loader2 size={40} className="animate-spin text-kooki-500" />
        </div>
      </div>
    );
  }

  if (error || !fundraiser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 mt-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cagnotte non trouvee</h1>
          <p className="text-gray-500">Cette cagnotte n&apos;existe pas ou a ete supprimee.</p>
        </div>
      </div>
    );
  }

  const percent = progressPercent(fundraiser.currentAmount, fundraiser.maxAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-kooki-400 via-grape-500 to-ocean-500 mt-16 lg:mt-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart size={80} className="text-white/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <Card padding="lg" className="shadow-lg border-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="success" size="md" className="mb-3">
                    {fundraiser.status === 'ACTIVE' ? 'Cagnotte active' : fundraiser.status}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900 leading-tight">
                    {fundraiser.title}
                  </h1>
                </div>
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {fundraiser.owner.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {fundraiser.owner.firstName} {fundraiser.owner.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Organisateur</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <Progress value={percent} size="lg" />
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900">
                      {formatCurrency(fundraiser.currentAmount)}
                    </span>
                    <span className="text-base text-gray-400 ml-2">
                      sur {formatCurrency(fundraiser.maxAmount)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-kooki-500">{percent}%</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Users size={16} />
                    {fundraiser.donationCount} donateurs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    Creee le {new Date(fundraiser.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card padding="lg" className="shadow-sm">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose prose-gray prose-sm max-w-none">
                {fundraiser.description.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-2 my-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-kooki-400 mt-2 shrink-0" />
                        <span
                          className="text-gray-600"
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace('- ', '')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                          }}
                        />
                      </div>
                    );
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return (
                    <p key={i} className="text-gray-600 leading-relaxed my-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </Card>

            {/* Share buttons */}
            <Card padding="md" className="shadow-sm">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
                Partager cette cagnotte
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? 'Copie !' : 'Copier le lien'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] text-sm font-medium hover:bg-[#1877F2]/20 transition-colors cursor-pointer">
                  <Facebook size={16} />
                  Facebook
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2]/10 text-[#1DA1F2] text-sm font-medium hover:bg-[#1DA1F2]/20 transition-colors cursor-pointer">
                  <Twitter size={16} />
                  Twitter
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-colors cursor-pointer">
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
              </div>
            </Card>

            {/* Recent donations */}
            <Card padding="md" className="shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
                  Derniers dons
                </h2>
                <Badge variant="default">{fundraiser.donationCount} dons</Badge>
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-8">
                  <Heart size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Soyez le premier a donner !</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {(showAllDonations ? donations : donations.slice(0, 3)).map(
                    (donation) => (
                      <div
                        key={donation.id}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kooki-100 to-grape-500/10 flex items-center justify-center text-sm font-bold text-kooki-600 shrink-0">
                          {donation.isAnonymous ? '?' : donation.donorName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-gray-900">
                              {donation.donorName}
                            </span>
                            <span className="font-bold text-sm text-kooki-500">
                              {formatCurrency(donation.amount)}
                            </span>
                          </div>
                          {donation.donorMessage && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                              {donation.donorMessage}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {donations.length > 3 && (
                <button
                  onClick={() => setShowAllDonations(!showAllDonations)}
                  className="w-full mt-3 py-2 text-sm font-medium text-kooki-500 hover:text-kooki-600 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {showAllDonations ? (
                    <>
                      Voir moins <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Voir tous les dons <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </Card>
          </div>

          {/* Donation form - Right column (sticky on desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DonationForm
                activeAmount={activeAmount}
                selectedAmount={selectedAmount}
                setSelectedAmount={(v) => {
                  setSelectedAmount(v);
                  setIsCustom(false);
                }}
                customAmount={customAmount}
                setCustomAmount={(v) => {
                  setCustomAmount(v);
                  setIsCustom(true);
                }}
                isCustom={isCustom}
                setIsCustom={setIsCustom}
                includeTip={includeTip}
                setIncludeTip={setIncludeTip}
                tipAmount={tipAmount}
                totalAmount={totalAmount}
                donorName={donorName}
                setDonorName={setDonorName}
                donorEmail={donorEmail}
                setDonorEmail={setDonorEmail}
                donorMessage={donorMessage}
                setDonorMessage={setDonorMessage}
                onSubmit={handleDonate}
                isDonating={isDonating}
                donationError={donationError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-2xl">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => setShowMobileDonate(true)}
        >
          <Heart size={18} />
          Faire un don
        </Button>
      </div>

      {/* Mobile donation sheet */}
      <AnimatePresence>
        {showMobileDonate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setShowMobileDonate(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
                <DonationForm
                  activeAmount={activeAmount}
                  selectedAmount={selectedAmount}
                  setSelectedAmount={(v) => {
                    setSelectedAmount(v);
                    setIsCustom(false);
                  }}
                  customAmount={customAmount}
                  setCustomAmount={(v) => {
                    setCustomAmount(v);
                    setIsCustom(true);
                  }}
                  isCustom={isCustom}
                  setIsCustom={setIsCustom}
                  includeTip={includeTip}
                  setIncludeTip={setIncludeTip}
                  tipAmount={tipAmount}
                  totalAmount={totalAmount}
                  donorName={donorName}
                  setDonorName={setDonorName}
                  donorEmail={donorEmail}
                  setDonorEmail={setDonorEmail}
                  donorMessage={donorMessage}
                  setDonorMessage={setDonorMessage}
                  onSubmit={handleDonate}
                  isDonating={isDonating}
                  donationError={donationError}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:block hidden">
        <Footer />
      </div>
    </div>
  );
}

// --- Donation Form Component ---
interface DonationFormProps {
  activeAmount: number;
  selectedAmount: number;
  setSelectedAmount: (v: number) => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  isCustom: boolean;
  setIsCustom: (v: boolean) => void;
  includeTip: boolean;
  setIncludeTip: (v: boolean) => void;
  tipAmount: number;
  totalAmount: number;
  donorName: string;
  setDonorName: (v: string) => void;
  donorEmail: string;
  setDonorEmail: (v: string) => void;
  donorMessage: string;
  setDonorMessage: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDonating: boolean;
  donationError: string;
}

function DonationForm({
  activeAmount,
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
  isCustom,
  setIsCustom,
  includeTip,
  setIncludeTip,
  tipAmount,
  totalAmount,
  donorName,
  setDonorName,
  donorEmail,
  setDonorEmail,
  donorMessage,
  setDonorMessage,
  onSubmit,
  isDonating,
  donationError,
}: DonationFormProps) {
  return (
    <Card padding="lg" className="shadow-lg border-0">
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-5">
        Faire un don
      </h2>

      <form onSubmit={onSubmit} className="space-y-5">
        {donationError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {donationError}
          </div>
        )}

        {/* Preset amounts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choisissez un montant
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount);
                  setIsCustom(false);
                }}
                className={cn(
                  'py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border-2',
                  !isCustom && selectedAmount === amount
                    ? 'border-kooki-500 bg-kooki-50 text-kooki-600 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <Input
            label="Ou saisissez un montant"
            type="number"
            min="1"
            placeholder="Montant en EUR"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onFocus={() => setIsCustom(true)}
            rightIcon={<span className="text-sm font-medium text-gray-400">EUR</span>}
          />
        </div>

        {/* Tip section */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-kooki-50 to-grape-500/5 border border-kooki-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTip}
              onChange={(e) => setIncludeTip(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-kooki-500 focus:ring-kooki-500"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Heart size={14} className="text-kooki-500" />
                Soutenir Kooki
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Une contribution volontaire de{' '}
                <span className="font-bold text-kooki-600">
                  {formatCurrency(tipSuggestion(activeAmount))}
                </span>{' '}
                pour garder Kooki 100% gratuit.
              </p>
            </div>
          </label>
        </div>

        {/* Donor info */}
        <Input
          label="Votre nom"
          placeholder="Jean Dupont"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
        />

        <Input
          label="Votre email"
          type="email"
          placeholder="votre@email.com"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          required
        />

        <Textarea
          label="Message (optionnel)"
          placeholder="Un petit mot d'encouragement..."
          value={donorMessage}
          onChange={(e) => setDonorMessage(e.target.value)}
          rows={3}
        />

        {/* Total */}
        {activeAmount > 0 && (
          <div className="p-3 rounded-xl bg-gray-50 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Don</span>
              <span>{formatCurrency(activeAmount)}</span>
            </div>
            {includeTip && tipAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Contribution Kooki</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          disabled={activeAmount < 100 || isDonating}
          isLoading={isDonating}
        >
          Donner {activeAmount >= 100 ? formatCurrency(totalAmount) : ''}
          {!isDonating && <ArrowRight size={20} />}
        </Button>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Lock size={12} />
            Paiement securise
          </span>
          <span className="flex items-center gap-1">
            <Shield size={12} />
            Stripe
          </span>
        </div>
      </form>
    </Card>
  );
}
