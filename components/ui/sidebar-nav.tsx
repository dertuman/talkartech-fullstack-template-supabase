'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { buttonVariants } from './button';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex space-x-2 overflow-auto pb-2 lg:m-0 lg:flex-col lg:space-x-0 lg:space-y-1 lg:pb-0',
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted font-semibold hover:bg-muted/80'
              : 'hover:bg-accent hover:underline',
            'justify-start transition-colors'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
