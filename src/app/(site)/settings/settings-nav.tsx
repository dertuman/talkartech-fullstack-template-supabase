'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';

export function SettingsNav({
  items,
}: {
  items: { href: Route; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="-mx-2 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col"
    >
      {items.map((item) => {
        const active =
          item.href === '/settings'
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn('justify-start', active && 'bg-muted')}
          >
            <Link href={item.href} aria-current={active ? 'page' : undefined}>
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
