'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScopedI18n } from '@/locales/client';

import { cn } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

/**
 * Clerk-free version of SiteHeader used when the user has skipped setup.
 * Shows the logo, public nav, theme toggle, and a "Complete Setup" CTA.
 * Does NOT import anything from @clerk/nextjs or UserDataContext.
 */
export function PreviewSiteHeader() {
  const t = useScopedI18n('siteHeader');
  const tCommon = useScopedI18n('common');
  const [isMobileMenuSheetOpen, setMobileMenuSheetOpen] = useState(false);
  const closeSheet = () => setMobileMenuSheetOpen(false);

  const navItems = [
    { title: t('about'), href: '/about' },
  ];

  return (
    <header className="bg-card sticky top-0 z-40 w-full border-b shadow-lg">
      <div className="container flex h-16 items-center pe-2 ps-4 sm:justify-between sm:space-x-0 md:pe-4">
        {/* Logo + public nav */}
        <div className="flex gap-6 md:gap-10">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-all duration-200 md:hover:translate-x-1"
          >
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <span className="text-lg font-bold">{tCommon('siteName')}</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground active:translate-y-0.5'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: theme toggle + complete setup */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Desktop: "Complete Setup" CTA */}
            <Button variant="ghost" asChild className="hidden px-9 md:inline-flex">
              <Link href="/setup">
                {t('completeSetup')}
              </Link>
            </Button>

            {/* Mobile hamburger */}
            <Sheet
              open={isMobileMenuSheetOpen}
              onOpenChange={setMobileMenuSheetOpen}
            >
              <SheetTrigger asChild className="md:hidden">
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icons.menu className="size-7 fill-current" />
                  <span className="sr-only">Toggle menu</span>
                </button>
              </SheetTrigger>
              <SheetContent className="bg-card">
                <DialogTitle className="sr-only">Mobile menu</DialogTitle>
                <DialogDescription className="sr-only">
                  Mobile menu
                </DialogDescription>
                <nav className="mt-2 flex flex-col items-center gap-2">
                  <div className="mt-2 flex justify-between">
                    <h2 className="font-montserrat p-3 pl-2 text-lg font-black tracking-wide">
                      {tCommon('siteName')}
                    </h2>
                  </div>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSheet}
                      className="border-primary active:bg-muted w-full rounded-md border p-3 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.title}
                    </Link>
                  ))}
                  <Link
                    href="/setup"
                    onClick={closeSheet}
                    className="border-primary active:bg-muted w-full rounded-md border p-3 text-center transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
                  >
                    {t('completeSetup')}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
