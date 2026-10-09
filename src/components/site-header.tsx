import Image from 'next/image';
import Link from 'next/link';
import { Show, UserButton } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

import { LocaleSwitcher } from '@/components/locale-switcher';
import { MobileNav, type NavLink } from '@/components/mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';
import type { Profile } from '@/lib/supabase/types';

export async function SiteHeader({
  configured,
  profile,
}: {
  configured: boolean;
  profile: Profile | null;
}) {
  const t = await getTranslations('nav');

  const links: NavLink[] = profile
    ? [
        { href: '/settings', label: t('settings') },
        ...(profile.role === 'admin'
          ? [{ href: '/admin' as const, label: t('admin') }]
          : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo.png" alt="" width={28} height={28} priority />
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          {configured ? (
            <>
              <Show when="signed-out">
                <Button size="sm" asChild>
                  <Link href={routes.signIn}>{t('signIn')}</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/setup">{t('completeSetup')}</Link>
            </Button>
          )}

          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
