'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  // Profile form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const hasPassword = !!(user as any)?.hasPassword;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await apiClient.patch('/auth/profile', { firstName, lastName });
      await refreshUser();
      toast('success', 'Profil mis a jour');
    } catch {
      toast('error', 'Erreur lors de la mise a jour');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast('error', 'Le mot de passe doit faire au moins 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('error', 'Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast('success', 'Mot de passe mis a jour');
    } catch {
      toast('error', 'Mot de passe actuel incorrect');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
          Parametres
        </h1>
        <p className="text-gray-500 mt-1">Gerez votre profil et votre securite</p>
      </motion.div>

      {/* Email (read-only) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card hover={false}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
              Email
            </h2>
          </div>
          <Input
            value={user?.email || ''}
            disabled
            hint={!hasPassword ? 'Connecte via Google' : undefined}
          />
        </Card>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card hover={false}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-grape-500 to-grape-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
              Profil
            </h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prenom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prenom"
              />
              <Input
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={profileLoading}
            >
              <Save size={16} />
              Enregistrer
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card hover={false}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-kooki-500 to-kooki-600 flex items-center justify-center">
              <Lock size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
              {!hasPassword ? 'Definir un mot de passe' : 'Changer le mot de passe'}
            </h2>
          </div>
          {!hasPassword && (
            <p className="text-sm text-gray-500 mb-4">
              Vous etes connecte via Google. Vous pouvez definir un mot de passe pour aussi vous connecter par email.
            </p>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            {!!hasPassword && (
              <Input
                label="Mot de passe actuel"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            )}
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 caracteres"
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={passwordLoading}
            >
              <Lock size={16} />
              {!hasPassword ? 'Definir le mot de passe' : 'Changer le mot de passe'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
