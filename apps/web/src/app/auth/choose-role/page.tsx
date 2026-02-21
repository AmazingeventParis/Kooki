'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface RnaAssociation {
  siren: string;
  nom_complet: string;
  identifiant_association?: string;
  siret?: string;
  code_postal?: string;
  libelle_commune?: string;
  adresse?: string;
}

export default function ChooseRolePage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'PERSONAL' | 'ORG_ADMIN' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Org search
  const [orgSearch, setOrgSearch] = useState('');
  const [orgResults, setOrgResults] = useState<RnaAssociation[]>([]);
  const [orgSearching, setOrgSearching] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<RnaAssociation | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualOrgName, setManualOrgName] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check token exists
  useEffect(() => {
    const token = localStorage.getItem('kooki_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  // RNA search
  const searchRNA = useCallback(async (query: string) => {
    if (query.length < 3) { setOrgResults([]); return; }
    setOrgSearching(true);
    try {
      const res = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&nature_juridique=9220&per_page=8&page=1`
      );
      if (res.ok) {
        const data = await res.json();
        setOrgResults((data.results || []).map((r: any) => ({
          siren: r.siren,
          nom_complet: r.nom_complet,
          identifiant_association: r.complements?.identifiant_association || null,
          siret: r.siege?.siret || null,
          code_postal: r.siege?.code_postal || null,
          libelle_commune: r.siege?.libelle_commune || null,
          adresse: r.siege?.adresse || null,
        })));
      } else {
        setOrgResults([]);
      }
    } catch {
      setOrgResults([]);
    } finally {
      setOrgSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (orgSearch.length >= 3) {
      searchTimeout.current = setTimeout(() => searchRNA(orgSearch), 400);
    } else {
      setOrgResults([]);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [orgSearch, searchRNA]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const body: Record<string, string> = { role: role || 'PERSONAL' };
      if (role === 'ORG_ADMIN') {
        if (selectedOrg) {
          body.organizationName = selectedOrg.nom_complet;
          if (selectedOrg.identifiant_association) body.organizationRna = selectedOrg.identifiant_association;
          if (selectedOrg.siret) body.organizationSiret = selectedOrg.siret;
          if (selectedOrg.adresse) body.organizationAddress = selectedOrg.adresse;
        } else if (manualOrgName) {
          body.organizationName = manualOrgName;
        }
      }
      await apiClient.post('/auth/complete-registration', body);
      window.location.href = '/dashboard';
    } catch {
      window.location.href = '/dashboard';
    }
  };

  const canProceedStep2 = selectedOrg || (manualMode && manualOrgName.length >= 2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card padding="lg" className="shadow-xl border-0">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
              Bienvenue sur Kooki !
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {step === 1 && 'Quel type de compte souhaitez-vous ?'}
              {step === 2 && 'Recherchez votre association'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role choice */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('PERSONAL')}
                    className={cn(
                      'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                      role === 'PERSONAL'
                        ? 'border-kooki-500 bg-kooki-50 text-kooki-600 shadow-lg shadow-kooki-500/10'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    <Users size={28} />
                    <span className="text-sm font-semibold">Particulier</span>
                    <span className="text-xs text-gray-400">Collecte personnelle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ORG_ADMIN')}
                    className={cn(
                      'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                      role === 'ORG_ADMIN'
                        ? 'border-grape-500 bg-grape-500/5 text-grape-500 shadow-lg shadow-grape-500/10'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    <Building2 size={28} />
                    <span className="text-sm font-semibold">Association</span>
                    <span className="text-xs text-gray-400">Collecte associative</span>
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!role}
                  isLoading={role === 'PERSONAL' && isSubmitting}
                  onClick={() => {
                    if (role === 'PERSONAL') {
                      handleSubmit();
                    } else {
                      setStep(2);
                    }
                  }}
                >
                  Continuer
                  <ArrowRight size={18} />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Org search (ORG_ADMIN only) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {!selectedOrg && !manualMode && (
                  <div className="space-y-3">
                    <Input
                      label="Nom de votre association"
                      placeholder="Tapez au moins 3 caracteres..."
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      leftIcon={orgSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    />

                    {orgResults.length > 0 && (
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {orgResults.map((org) => (
                          <button
                            key={org.siren}
                            type="button"
                            onClick={() => { setSelectedOrg(org); setOrgSearch(''); setOrgResults([]); }}
                            className="w-full text-left px-4 py-3 hover:bg-kooki-50 transition-colors cursor-pointer"
                          >
                            <p className="text-sm font-medium text-gray-900">{org.nom_complet}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {[org.libelle_commune, org.identifiant_association].filter((x): x is string => !!x).join(' - ')}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {orgSearch.length >= 3 && !orgSearching && orgResults.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">Aucun resultat</p>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualMode(true)}
                      className="w-full text-sm text-kooki-500 hover:text-kooki-600 font-medium py-2 cursor-pointer"
                    >
                      Je ne trouve pas mon association →
                    </button>
                  </div>
                )}

                {selectedOrg && (
                  <div className="p-4 rounded-xl border-2 border-kooki-500 bg-kooki-50 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedOrg.nom_complet}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {[selectedOrg.identifiant_association, selectedOrg.siret && `SIRET: ${selectedOrg.siret}`].filter((x): x is string => !!x).join(' - ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrg(null)}
                        className="p-1 rounded-lg hover:bg-kooki-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {manualMode && !selectedOrg && (
                  <div className="space-y-3">
                    <Input
                      label="Nom de l'association"
                      placeholder="Saisissez le nom complet"
                      value={manualOrgName}
                      onChange={(e) => setManualOrgName(e.target.value)}
                      leftIcon={<Building2 size={18} />}
                    />
                    <button
                      type="button"
                      onClick={() => { setManualMode(false); setManualOrgName(''); }}
                      className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      ← Retour a la recherche
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft size={18} />
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={!canProceedStep2}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Terminer
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
