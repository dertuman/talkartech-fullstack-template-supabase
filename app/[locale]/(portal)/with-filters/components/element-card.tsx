import React from 'react';
import Image from 'next/image';
import { User } from '@/models/UserModel';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ElementCardProps extends React.HTMLAttributes<HTMLDivElement> {
  element: User;
  aspectRatio?: 'portrait' | 'square';
}

export function ElementCard({
  aspectRatio = 'portrait',
  element,
  className,
  ...props
}: ElementCardProps) {
  return (
    <div className={cn('mb-4 space-y-3 lg:mb-5', className)} {...props}>
      <div className="overflow-hidden rounded-md">
        <Image
          src={element.profilePicture || 'http://placekitten.com/250/250'}
          alt={element.name}
          width={100}
          height={100}
          className={cn(
            'bg-activityCard 3xl:size-[500px] size-auto object-cover transition-all hover:scale-105 xl:size-[300px]',
            aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
          )}
        />
      </div>
      <div className="space-y-1 text-sm lg:space-y-2">
        <div className="flex items-center justify-between space-x-2">
          <h3 className="font-medium leading-none">{element.name}</h3>
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`size-4 ${
                  index < 4
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Joined{' '}
          {element.createdAt
            ? new Date(element.createdAt).toLocaleDateString()
            : 'Unknown'}
        </p>
        <p className="text-muted-foreground text-sm">{'London, UK'}</p>
        <p className="text-muted-foreground text-md">
          {element.bio && element.bio.length > 200
            ? `${element.bio.substring(0, 100)}...`
            : element.bio}
        </p>
      </div>
    </div>
  );
}
