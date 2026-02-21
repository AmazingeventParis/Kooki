'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
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

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

      {/* Delete account */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card hover={false} className="border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Trash2 size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
              Supprimer le compte
            </h2>
          </div>

          {!showDeleteConfirm ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                La suppression de votre compte est definitive. Toutes vos donnees, cagnottes et historique seront supprimes.
              </p>
              <Button
                variant="ghost"
                size="md"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                Supprimer mon compte
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold mb-1">Action irreversible</p>
                  <p>Toutes vos cagnottes, donations recues et donnees personnelles seront definitivement supprimees.</p>
                </div>
              </div>

              <Input
                label="Tapez SUPPRIMER pour confirmer"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
              />

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={deleteConfirmText !== 'SUPPRIMER'}
                  isLoading={deleteLoading}
                  onClick={async () => {
                    setDeleteLoading(true);
                    try {
                      await apiClient.delete('/auth/account');
                      logout();
                      window.location.href = '/';
                    } catch {
                      toast('error', 'Erreur lors de la suppression');
                      setDeleteLoading(false);
                    }
                  }}
                >
                  <Trash2 size={16} />
                  Confirmer la suppression
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
