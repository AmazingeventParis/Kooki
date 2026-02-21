'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useAnimation, useScroll, useTransform } from 'framer-motion';
import {
  PlusCircle,
  Share2,
  Wallet,
  Check,
  Shield,
  Lock,
  ArrowRight,
  Users,
  TrendingUp,
  Sparkles,
  Star,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { PERSONAL_PLANS, ASSOCIATION_PLANS, type PlanDefinition } from '@kooki/shared';
import { formatCurrency, progressPercent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

// --- Animated Counter ---
function AnimatedCounter({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {new Intl.NumberFormat('fr-FR').format(count)}{suffix}
    </span>
  );
}

// --- Section wrapper with reveal animation ---
function RevealSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id={id} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </section>
  );
}

// --- Mock featured fundraisers ---
const MOCK_FUNDRAISERS = [
  {
    id: '1',
    title: 'Aide pour la reconstruction du refuge animal',
    slug: 'refuge-animal',
    coverImageUrl: '',
    currentAmount: 845000,
    maxAmount: 1200000,
    donationCount: 234,
    owner: { firstName: 'Marie', lastName: 'L.' },
    category: 'Animaux',
  },
  {
    id: '2',
    title: 'Financer le voyage scolaire des CM2',
    slug: 'voyage-scolaire-cm2',
    coverImageUrl: '',
    currentAmount: 312000,
    maxAmount: 500000,
    donationCount: 89,
    owner: { firstName: 'Thomas', lastName: 'D.' },
    category: 'Education',
  },
  {
    id: '3',
    title: 'Un toit pour la famille Dupont',
    slug: 'toit-famille-dupont',
    coverImageUrl: '',
    currentAmount: 2100000,
    maxAmount: 3000000,
    donationCount: 412,
    owner: { firstName: 'Sophie', lastName: 'M.' },
    category: 'Solidarite',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Animaux: 'bg-emerald-100 text-emerald-700',
  Education: 'bg-blue-100 text-blue-700',
  Solidarite: 'bg-kooki-100 text-kooki-700',
};

// --- Floating decorative shapes ---
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large blurred blobs */}
      <div className="blob blob-coral w-96 h-96 -top-20 -left-20 opacity-20" style={{ animation: 'float 8s ease-in-out infinite' }} />
      <div className="blob blob-purple w-80 h-80 top-1/3 -right-20 opacity-15" style={{ animation: 'floatSlow 10s ease-in-out infinite' }} />
      <div className="blob blob-teal w-64 h-64 bottom-20 left-1/4 opacity-15" style={{ animation: 'float 12s ease-in-out infinite' }} />
      <div className="blob blob-yellow w-48 h-48 top-1/4 left-2/3 opacity-10" style={{ animation: 'floatSlow 9s ease-in-out infinite' }} />

      {/* Small geometric shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[15%] left-[10%] w-6 h-6 rounded-md bg-kooki-400/20 rotate-45"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[60%] right-[15%] w-4 h-4 rounded-full bg-grape-500/20"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[20%] right-[30%] w-8 h-8 rounded-lg bg-ocean-500/15 rotate-12"
      />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] left-[5%] w-3 h-3 rounded-full bg-sun-500/30"
      />
    </div>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'association'>('personal');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-hero-animated opacity-[0.04]" />
        <FloatingShapes />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Badge variant="brand" size="md" className="mb-6">
              <Sparkles size={14} className="mr-1.5" />
              100% gratuit pour les donateurs
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold font-[family-name:var(--font-heading)] leading-[1.05] tracking-tight"
          >
            Collectez{' '}
            <span className="gradient-text">sans commission.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            La premiere plateforme de cagnottes{' '}
            <span className="font-semibold text-gray-800">100% gratuite</span> pour les donateurs
            et les createurs. Pas de frais caches. Jamais.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button variant="primary" size="xl" className="text-base">
                Creer ma cagnotte
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="#decouvrir">
              <Button variant="secondary" size="xl" className="text-base">
                Decouvrir
              </Button>
            </Link>
          </motion.div>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] gradient-text-static">
                <AnimatedCounter target={2847000} suffix=" EUR" />
              </p>
              <p className="text-sm text-gray-500 mt-1">collectes</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
                <AnimatedCounter target={12460} />
              </p>
              <p className="text-sm text-gray-500 mt-1">donateurs</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
                <AnimatedCounter target={1830} />
              </p>
              <p className="text-sm text-gray-500 mt-1">cagnottes creees</p>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <RevealSection
        id="comment-ca-marche"
        className="py-24 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="brand" size="md" className="mb-4">Comment ca marche</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
              Simple comme <span className="gradient-text">1, 2, 3</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Lancez votre cagnotte en quelques minutes. Aucune connaissance technique requise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: PlusCircle,
                title: 'Creez votre cagnotte',
                description:
                  'Choisissez un titre accrocheur, decrivez votre projet et definissez votre objectif. C\'est pret en 2 minutes.',
                color: 'from-kooki-500 to-kooki-600',
                number: '1',
              },
              {
                icon: Share2,
                title: 'Partagez le lien',
                description:
                  'Diffusez votre cagnotte aupres de votre entourage via les reseaux sociaux, WhatsApp ou email.',
                color: 'from-ocean-500 to-ocean-600',
                number: '2',
              },
              {
                icon: Wallet,
                title: 'Recevez vos fonds',
                description:
                  'Les dons arrivent directement sur votre compte. Retirez-les quand vous voulez, sans frais.',
                color: 'from-grape-500 to-grape-600',
                number: '3',
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="text-center relative overflow-visible" gradientBorder>
                  {/* Number badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white bg-gradient-to-r ${step.color} shadow-lg`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mt-4 mb-5 shadow-lg`}>
                    <step.icon size={28} className="text-white" />
                  </div>

                  <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ===== FEATURED FUNDRAISERS ===== */}
      <RevealSection id="decouvrir" className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="brand" size="md" className="mb-4">Decouvrir</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
              Cagnottes <span className="gradient-text">en vedette</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Decouvrez les projets qui mobilisent la communaute en ce moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_FUNDRAISERS.map((fundraiser, index) => (
              <motion.div
                key={fundraiser.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <Link href={`/c/${fundraiser.slug}`}>
                  <Card padding="none" className="overflow-hidden group" gradientBorder>
                    {/* Cover image placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart size={48} className="text-gray-300 group-hover:text-kooki-300 transition-colors duration-300" />
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[fundraiser.category] || 'bg-gray-100 text-gray-700'}`}>
                          {fundraiser.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 font-[family-name:var(--font-heading)] line-clamp-2 group-hover:text-kooki-500 transition-colors duration-200">
                        {fundraiser.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {fundraiser.owner.firstName[0]}
                        </span>
                        {fundraiser.owner.firstName} {fundraiser.owner.lastName}
                      </p>

                      <div className="mt-4">
                        <Progress
                          value={progressPercent(fundraiser.currentAmount, fundraiser.maxAmount)}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(fundraiser.currentAmount)}
                          </span>
                          <span className="text-sm text-gray-400 ml-1">
                            / {formatCurrency(fundraiser.maxAmount)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users size={14} />
                          {fundraiser.donationCount}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/#decouvrir">
              <Button variant="secondary" size="lg">
                Voir toutes les cagnottes
                <ChevronRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* ===== ZERO COMMISSION ===== */}
      <RevealSection className="py-24 lg:py-32 bg-gradient-to-b from-white via-kooki-50/30 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div>
              <Badge variant="brand" size="md" className="mb-4">Pourquoi Kooki</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
                <span className="gradient-text">0%</span> de commission
                <br />sur les dons
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Contrairement aux autres plateformes qui prelevent entre 5% et 8% sur chaque don,
                Kooki ne prend aucune commission. Les donateurs donnent, et vous recevez
                <span className="font-semibold text-gray-900"> 100% de chaque euro</span>.
              </p>

              {/* Feature list */}
              <ul className="mt-8 space-y-4">
                {[
                  'Aucune commission sur les dons',
                  'Frais Stripe seuls (1.5% + 0.25 EUR)',
                  'Retrait instantane des fonds',
                  'Contribution volontaire des donateurs',
                  'Paiement securise par Stripe',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparison cards */}
            <div className="space-y-4">
              {/* Kooki card */}
              <motion.div
                whileInView={{ scale: [0.95, 1] }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl bg-white border-2 border-kooki-200 shadow-lg shadow-kooki-500/10"
              >
                <div className="absolute -top-3 left-6">
                  <Badge variant="brand" size="md">
                    <Star size={12} className="mr-1" />
                    Recommande
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xl font-bold font-[family-name:var(--font-heading)] gradient-text-static">
                    Kooki
                  </span>
                  <span className="text-4xl font-extrabold text-emerald-500">0%</span>
                </div>
                <div className="space-y-2.5">
                  {['Commission', 'Frais d\'ouverture', 'Frais de retrait'].map((item) => (
                    <div key={item} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item}</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <Check size={14} />
                        Gratuit
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Competitors */}
              {[
                { name: 'Leetchi', commission: '4%' },
                { name: 'GoFundMe', commission: '5%' },
                { name: 'PayPal Pools', commission: '3.4% + frais' },
              ].map((comp) => (
                <div
                  key={comp.name}
                  className="p-5 rounded-2xl bg-gray-50 border border-gray-200 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-500">{comp.name}</span>
                    <span className="text-2xl font-bold text-red-400">{comp.commission}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ===== PRICING ===== */}
      <RevealSection id="tarifs" className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="brand" size="md" className="mb-4">Tarifs</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
              Un plan pour chaque <span className="gradient-text">projet</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Des formules adaptees aux particuliers comme aux associations. Toujours 0% de commission.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Particuliers
              </button>
              <button
                onClick={() => setActiveTab('association')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'association'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Associations
              </button>
            </div>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(activeTab === 'personal' ? PERSONAL_PLANS : ASSOCIATION_PLANS)
              .filter((p) => p.price !== -1)
              .map((plan, index) => (
                <PricingCard key={plan.code} plan={plan} index={index} />
              ))}
          </div>

          {/* Enterprise note for associations */}
          {activeTab === 'association' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-grape-500/10 to-kooki-500/10 border border-grape-500/20">
                <Sparkles size={20} className="text-grape-500" />
                <span className="text-sm text-gray-700">
                  Besoin d&apos;un plan <span className="font-bold">Enterprise</span> sur mesure ?{' '}
                  <a href="/contact" className="text-grape-500 font-semibold hover:underline">
                    Contactez-nous
                  </a>
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </RevealSection>

      {/* ===== TRUST / CTA ===== */}
      <RevealSection className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden gradient-hero p-12 lg:p-16 text-center text-white">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-heading)]"
              >
                Pret a lancer votre cagnotte ?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-lg text-white/80 max-w-lg mx-auto"
              >
                Rejoignez des milliers de createurs qui collectent sans commission sur Kooki.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <Link href="/register">
                  <Button
                    variant="ghost"
                    size="xl"
                    className="bg-white text-kooki-500 font-bold hover:bg-white/90 shadow-lg shadow-black/10"
                  >
                    Creer ma cagnotte gratuitement
                    <ArrowRight size={20} />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-6"
              >
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Lock size={16} />
                  <span>SSL Securise</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Shield size={16} />
                  <span>Paiement Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Check size={16} />
                  <span>Conforme RGPD</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </div>
  );
}

// --- Pricing Card ---
function PricingCard({ plan, index }: { plan: PlanDefinition; index: number }) {
  const isPopular = plan.popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="brand" size="md">
            <TrendingUp size={12} className="mr-1" />
            Populaire
          </Badge>
        </div>
      )}

      <Card
        className={`h-full flex flex-col ${
          isPopular ? 'border-kooki-300 shadow-lg shadow-kooki-500/10 ring-1 ring-kooki-200' : ''
        }`}
        hover
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
            {plan.name}
          </h3>

          <div className="mt-4 mb-6">
            {plan.price === 0 ? (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">Gratuit</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-sm text-gray-500">/ cagnotte</span>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {plan.ceiling === Infinity
                ? 'Aucune limite'
                : `Jusqu'a ${formatCurrency(plan.ceiling)}`}
            </p>
          </div>

          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                <Check
                  size={16}
                  className={`shrink-0 mt-0.5 ${isPopular ? 'text-kooki-500' : 'text-emerald-500'}`}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Link href="/register">
            <Button
              variant={isPopular ? 'primary' : 'secondary'}
              size="lg"
              className="w-full"
            >
              {plan.price === 0 ? 'Commencer' : 'Choisir ce plan'}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
