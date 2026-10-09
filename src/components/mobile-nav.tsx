'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export type NavLink = { href: Route; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t('openMenu')}
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>{t('menu')}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/" onClick={() => setOpen(false)}>
              {t('home')}
            </Link>
          </Button>
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 border-t p-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
