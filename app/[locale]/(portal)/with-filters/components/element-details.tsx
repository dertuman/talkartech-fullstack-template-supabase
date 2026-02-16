'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '@/models/UserModel';
import { Star, X } from 'lucide-react';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

export function ElementDetails({
  element,
  isOpen,
  setOpen,
  onClose,
}: {
  element: User;
  isOpen: boolean;
  setOpen: (_open: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Drawer open={isOpen} onOpenChange={setOpen} onClose={onClose}>
      <DrawerContent className="mx-auto h-dvh">
        <div className="custom-scrollbar flex flex-1 flex-col items-center overflow-y-auto p-4">
          <DrawerHeader className="w-full text-center">
            <div
              className="ring-offset-background data-[state=open]:bg-secondary bg-background absolute right-4 top-4 z-10 cursor-pointer rounded-full border opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
              onClick={onClose}
            >
              <X className="size-7" />
              <span className="sr-only">Close</span>
            </div>
            <DrawerTitle className="text-center text-3xl font-bold">
              {element.name}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex w-full max-w-md flex-col items-center space-y-4">
            <div className="overflow-hidden rounded-md">
              <Image
                src={element.profilePicture || 'http://placekitten.com/250/250'}
                alt={element.name}
                width={400}
                height={400}
                className="bg-activityCard aspect-[3/4] w-full object-cover transition-all hover:scale-105"
              />
            </div>
            <div className="flex w-full items-center justify-around space-x-2">
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
            <p className="text-muted-foreground text-sm">
              Joined{' '}
              {element.createdAt
                ? new Date(element.createdAt).toLocaleDateString()
                : 'Unknown'}
            </p>
            <p className="text-muted-foreground text-sm">{'London, UK'}</p>
            <p className="text-muted-foreground text-md text-center">
              {element.bio && element.bio.length > 200
                ? `${element.bio.substring(0, 200)}...`
                : element.bio}
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
