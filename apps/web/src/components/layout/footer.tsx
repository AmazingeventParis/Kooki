'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

const footerLinks = {
  produit: [
    { label: 'Comment ca marche', href: '/#comment-ca-marche' },
    { label: 'Tarifs', href: '/#tarifs' },
    { label: 'Decouvrir', href: '/#decouvrir' },
    { label: 'Creer une cagnotte', href: '/fundraisers/new' },
  ],
  legal: [
    { label: 'Mentions legales', href: '/legal' },
    { label: 'CGU', href: '/cgu' },
    { label: 'Politique de confidentialite', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
  ],
  support: [
    { label: 'Centre d\'aide', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-extrabold font-[family-name:var(--font-heading)] gradient-text">
                Kooki
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La premiere plateforme de cagnottes 0% commission. Collectez et recevez 100% de vos dons.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {/* Social icons - simplified SVG circles */}
              {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-kooki-500 transition-colors duration-200"
                  aria-label={social}
                >
                  <span className="text-xs font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Produit
            </h3>
            <ul className="space-y-3">
              {footerLinks.produit.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Kooki. Tous droits reserves.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            Fait avec <Heart size={14} className="text-kooki-500 fill-kooki-500" /> en France
          </p>
        </div>
      </div>
    </footer>
  );
}
