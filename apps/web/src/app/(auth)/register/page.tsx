'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'PERSONAL' as 'PERSONAL' | 'ORG_ADMIN',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card padding="lg" className="shadow-xl border-0">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold font-[family-name:var(--font-heading)] text-gray-900">
            Creer un compte
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Inscrivez-vous pour commencer a collecter
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'PERSONAL' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
              formData.role === 'PERSONAL'
                ? 'border-kooki-500 bg-kooki-50 text-kooki-600'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            <Users size={24} />
            <span className="text-sm font-semibold">Particulier</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'ORG_ADMIN' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
              formData.role === 'ORG_ADMIN'
                ? 'border-grape-500 bg-grape-500/5 text-grape-500'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            <Building2 size={24} />
            <span className="text-sm font-semibold">Association</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prenom"
              placeholder="Jean"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              leftIcon={<User size={18} />}
            />
            <Input
              label="Nom"
              placeholder="Dupont"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail size={18} />}
            required
          />

          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 8 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            hint="Minimum 8 caracteres"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Creer mon compte
            <ArrowRight size={18} />
          </Button>
        </form>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-4">
          En creant un compte, vous acceptez nos{' '}
          <a href="/cgu" className="text-kooki-500 hover:underline">
            CGU
          </a>{' '}
          et notre{' '}
          <a href="/privacy" className="text-kooki-500 hover:underline">
            Politique de confidentialite
          </a>
          .
        </p>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Deja un compte ?{' '}
          <Link href="/login" className="text-kooki-500 hover:text-kooki-600 font-semibold">
            Se connecter
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
