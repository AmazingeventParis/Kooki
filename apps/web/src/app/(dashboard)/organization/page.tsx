'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  MapPin,
  Hash,
  FileText,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function OrganizationPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const org = (user as any)?.organizations?.[0];

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    legalName: org?.legalName || '',
    email: org?.email || '',
    siret: org?.siret || '',
    rnaNumber: org?.rnaNumber || '',
    address: org?.address || '',
  });

  if (!user || user.role !== 'ORG_ADMIN') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Aucune organisation</h1>
        <p className="text-gray-500">Cette page est reservee aux comptes association.</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Organisation non trouvee</h1>
        <p className="text-gray-500">
          Aucune organisation liee a votre compte. Contactez le support.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(`/organizations/${org.id}`, formData);
      await refreshUser();
      setIsEditing(false);
      toast('success', 'Organisation mise a jour');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise a jour';
      toast('error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const infoItems = [
    { icon: Building2, label: 'Nom legal', value: org.legalName },
    { icon: Mail, label: 'Email', value: org.email },
    { icon: Hash, label: 'SIRET', value: org.siret || 'Non renseigne' },
    { icon: FileText, label: 'Numero RNA', value: org.rnaNumber || 'Non renseigne' },
    { icon: MapPin, label: 'Adresse', value: org.address || 'Non renseignee' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
            Mon association
          </h1>
          <p className="text-gray-500 mt-1">Informations et statut de votre organisation</p>
        </div>
        {!isEditing && (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant={org.isOnboarded ? 'success' : 'warning'} size="sm">
          {org.isOnboarded ? (
            <><CheckCircle2 size={12} className="mr-1" /> Stripe connecte</>
          ) : (
            <><XCircle size={12} className="mr-1" /> Stripe non connecte</>
          )}
        </Badge>
        <Badge variant={org.isTaxEligible ? 'success' : 'default'} size="sm">
          <Shield size={12} className="mr-1" />
          {org.isTaxEligible ? 'Recus fiscaux actifs' : 'Recus fiscaux inactifs'}
        </Badge>
      </div>

      {/* Info card */}
      <Card padding="lg">
        {!isEditing ? (
          <div className="space-y-5">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Nom legal"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              leftIcon={<Building2 size={18} />}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail size={18} />}
            />
            <Input
              label="SIRET"
              value={formData.siret}
              onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
              leftIcon={<Hash size={18} />}
              placeholder="14 chiffres"
            />
            <Input
              label="Numero RNA"
              value={formData.rnaNumber}
              onChange={(e) => setFormData({ ...formData, rnaNumber: e.target.value })}
              leftIcon={<FileText size={18} />}
              placeholder="W123456789"
            />
            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              leftIcon={<MapPin size={18} />}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    legalName: org.legalName,
                    email: org.email,
                    siret: org.siret || '',
                    rnaNumber: org.rnaNumber || '',
                    address: org.address || '',
                  });
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleSave}
                isLoading={isSaving}
              >
                <Save size={18} />
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
