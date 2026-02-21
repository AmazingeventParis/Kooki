'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  TrendingUp,
  Eye,
  Image,
  Sparkles,
} from 'lucide-react';
import { PERSONAL_PLANS, ASSOCIATION_PLANS } from '@kooki/shared';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

const STEPS = [
  { number: 1, label: 'Type' },
  { number: 2, label: 'Details' },
  { number: 3, label: 'Plan' },
  { number: 4, label: 'Apercu' },
];

export default function NewFundraiserPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Auto-detect type from user role: ORG_ADMIN → ASSOCIATION, else PERSONAL
  const autoType = user?.role === 'ORG_ADMIN' ? 'ASSOCIATION' : 'PERSONAL';
  const skipTypeStep = !!user;

  const [step, setStep] = useState(skipTypeStep ? 2 : 1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: autoType as 'PERSONAL' | 'ASSOCIATION' | '',
    title: '',
    description: '',
    coverImageUrl: '',
    planCode: '',
  });

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.type !== '';
      case 2:
        return formData.title.length >= 5 && formData.description.length >= 20;
      case 3:
        return formData.planCode !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError('');
    try {
      const response = await apiClient.post<{ data: { slug: string } }>('/fundraisers', {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        planCode: formData.planCode,
        coverImageUrl: formData.coverImageUrl || undefined,
      });
      router.push(`/c/${response.data.slug}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la creation';
      setError(message);
      setIsPublishing(false);
    }
  };

  const plans = formData.type === 'ASSOCIATION' ? ASSOCIATION_PLANS : PERSONAL_PLANS;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
          Creer une cagnotte
        </h1>
        <p className="text-gray-500 mt-1">
          Lancez votre cagnotte en quelques minutes
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
          <motion.div
            className="absolute top-5 left-0 h-0.5 gradient-cta"
            animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {STEPS.map((s) => (
            <div key={s.number} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  scale: step === s.number ? 1.1 : 1,
                }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300',
                  step > s.number
                    ? 'gradient-cta text-white'
                    : step === s.number
                    ? 'gradient-cta text-white shadow-lg shadow-kooki-500/30'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                )}
              >
                {step > s.number ? <Check size={18} /> : s.number}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium',
                  step >= s.number ? 'text-gray-700' : 'text-gray-400'
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900">
                Quel type de cagnotte ?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, type: 'PERSONAL', planCode: '' })}
                  className={cn(
                    'p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer group',
                    formData.type === 'PERSONAL'
                      ? 'border-kooki-500 bg-kooki-50 shadow-lg shadow-kooki-500/10'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  )}
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors',
                      formData.type === 'PERSONAL'
                        ? 'bg-gradient-to-br from-kooki-500 to-kooki-600'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    )}
                  >
                    <Users
                      size={28}
                      className={formData.type === 'PERSONAL' ? 'text-white' : 'text-gray-500'}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Particulier</h3>
                  <p className="text-sm text-gray-500">
                    Cadeau commun, evenement, projet personnel, coup dur...
                  </p>
                  {formData.type === 'PERSONAL' && (
                    <div className="mt-3">
                      <Badge variant="brand" size="sm">Selectionne</Badge>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setFormData({ ...formData, type: 'ASSOCIATION', planCode: '' })}
                  className={cn(
                    'p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer group',
                    formData.type === 'ASSOCIATION'
                      ? 'border-grape-500 bg-grape-500/5 shadow-lg shadow-grape-500/10'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  )}
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors',
                      formData.type === 'ASSOCIATION'
                        ? 'bg-gradient-to-br from-grape-500 to-grape-600'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    )}
                  >
                    <Building2
                      size={28}
                      className={formData.type === 'ASSOCIATION' ? 'text-white' : 'text-gray-500'}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Association</h3>
                  <p className="text-sm text-gray-500">
                    Collecte de dons, campagne de financement, CERFA automatique...
                  </p>
                  {formData.type === 'ASSOCIATION' && (
                    <div className="mt-3">
                      <Badge variant="info" size="sm">Selectionne</Badge>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900">
                Decrivez votre cagnotte
              </h2>

              <Card hover={false}>
                <div className="space-y-5">
                  <Input
                    label="Titre de la cagnotte"
                    placeholder="Ex: Aide pour la reconstruction du refuge..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    hint={`${formData.title.length}/120 caracteres`}
                    error={formData.title.length > 0 && formData.title.length < 5 ? 'Minimum 5 caracteres' : undefined}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Expliquez votre projet en detail : pourquoi vous collectez, comment les fonds seront utilises..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={8}
                    hint={`${formData.description.length}/5000 caracteres`}
                    error={formData.description.length > 0 && formData.description.length < 20 ? 'Minimum 20 caracteres' : undefined}
                  />

                  {/* Image upload area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Image de couverture (optionnel)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-kooki-300 hover:bg-kooki-50/30 transition-all duration-200 cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Image size={24} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Cliquez ou glissez une image ici
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG jusqu&apos;a 5 Mo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Plan */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900">
                Choisissez votre plan
              </h2>
              <p className="text-gray-500 text-sm">
                Tous les plans beneficient de 0% de commission sur les dons.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(plans)
                  .filter((p) => p.price !== -1)
                  .map((plan) => (
                    <button
                      key={plan.code}
                      onClick={() => setFormData({ ...formData, planCode: plan.code })}
                      className={cn(
                        'p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer relative',
                        formData.planCode === plan.code
                          ? 'border-kooki-500 bg-kooki-50 shadow-lg shadow-kooki-500/10'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2.5 right-4">
                          <Badge variant="brand" size="sm">
                            <TrendingUp size={10} className="mr-0.5" />
                            Populaire
                          </Badge>
                        </div>
                      )}

                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-2 mb-3">
                        {plan.price === 0 ? (
                          <span className="text-2xl font-extrabold text-gray-900">Gratuit</span>
                        ) : (
                          <span className="text-2xl font-extrabold text-gray-900">
                            {formatCurrency(plan.price)}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-1.5">
                        {plan.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                            <Check
                              size={14}
                              className={cn(
                                'shrink-0 mt-0.5',
                                formData.planCode === plan.code ? 'text-kooki-500' : 'text-emerald-500'
                              )}
                            />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {formData.planCode === plan.code && (
                        <div className="absolute top-3 left-3">
                          <div className="w-5 h-5 rounded-full gradient-cta flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900 flex items-center gap-2">
                <Eye size={22} />
                Apercu de votre cagnotte
              </h2>

              <Card padding="none" className="overflow-hidden shadow-lg">
                {/* Cover preview */}
                <div className="h-48 bg-gradient-to-br from-kooki-400 via-grape-500 to-ocean-500 flex items-center justify-center">
                  <Sparkles size={40} className="text-white/40" />
                </div>

                <div className="p-6 space-y-4">
                  <Badge variant={formData.type === 'ASSOCIATION' ? 'info' : 'brand'} size="sm">
                    {formData.type === 'ASSOCIATION' ? 'Association' : 'Particulier'}
                  </Badge>

                  <h3 className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
                    {formData.title || 'Titre de votre cagnotte'}
                  </h3>

                  <Progress value={0} size="md" />

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">0 EUR collectes</span>
                    <span>0 dons</span>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
                      {formData.description || 'Description de votre cagnotte...'}
                    </p>
                  </div>

                  {formData.planCode && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Plan :{' '}
                        <span className="font-semibold text-gray-600">
                          {Object.values(plans).find((p) => p.code === formData.planCode)?.name}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-700 flex items-start gap-2">
                  <Check size={18} className="shrink-0 mt-0.5" />
                  <span>
                    Votre cagnotte sera publiee immediatement. Vous pourrez la modifier ou la mettre
                    en pause a tout moment depuis votre tableau de bord.
                  </span>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleBack}
          disabled={step === 1 || (skipTypeStep && step === 2)}
        >
          <ArrowLeft size={18} />
          Retour
        </Button>

        {step < 4 ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Suivant
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handlePublish}
            isLoading={isPublishing}
          >
            <Sparkles size={18} />
            Publier ma cagnotte
          </Button>
        )}
      </div>
    </div>
  );
}
