'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScopedI18n } from '@/locales/client';
import { FaLinkedin } from 'react-icons/fa';

import { cn } from '@/lib/utils';

export function SiteFooter() {
  const t = useScopedI18n('footer');
  const tCommon = useScopedI18n('common');

  return (
    <footer className={cn('text-foreground bg-card border-t py-12')}>
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Company Info */}
        <div className="flex flex-col items-center space-y-4 lg:items-start">
          <Link
            href="/"
            className="flex items-center space-x-3 transition-all duration-200 md:hover:translate-x-1"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={40}
              height={40}
              className="brightness-[0.85]"
            />
            <span className="font-odor text-xl font-bold tracking-wider">
              {tCommon('siteName')}
            </span>
          </Link>
          <p className="text-muted-foreground text-center text-sm lg:text-left">
            {t('companyDescription')}
          </p>
          <Link
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            {tCommon('siteName')}
          </Link>
          <p className="text-muted-foreground text-center text-sm lg:text-left">
            {t('allRightsReserved', { year: new Date().getFullYear() })}
          </p>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="font-odor text-xl font-semibold tracking-wider">
            {t('contactUs')}
          </h3>
          <p className="text-sm">
            <strong>{t('email')}</strong>{' '}
            <Link
              href="mailto:support@project.com"
              className="underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              support@project.com
            </Link>
          </p>
          <p className="text-sm">
            <strong>{t('whatsapp')}</strong>{' '}
            <Link
              href="https://wa.me/441234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              +44 1234 567890
            </Link>
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="font-odor text-xl font-semibold tracking-wider">
            {t('followUs')}
          </h3>
          <div className="flex space-x-4">
            <Link
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
