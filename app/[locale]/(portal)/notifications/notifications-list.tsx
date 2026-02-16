'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationsContext';
import { useScopedI18n } from '@/locales/client';
import { Notification } from '@/models/NotificationModel';

import { Button } from '@/components/ui/button';
import { FancyDate } from '@/components/ui/date';
import { Loader } from '@/components/ui/loader';

export function NotificationsList() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    getNotifications,
    isLoading,
  } = useNotifications();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const t = useScopedI18n('notifications');

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setLoadingId(id);
    markAsRead(id);
    setLoadingId(null);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    markAllAsRead();
    setIsMarkingAll(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="p-4">
      {notifications.length === 0 ? (
        <div className="p-4 text-center">{t('noNotificationsFound')}</div>
      ) : (
        <>
          <Button
            className="mb-4 border"
            variant="link"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
          >
            {isMarkingAll ? <Loader /> : t('markAllAsRead')}
          </Button>

          {notifications.map((notification: Notification) => (
            <div
              key={notification._id}
              className="bg-background relative mb-4 rounded-lg border p-4 shadow"
            >
              {!notification.read && (
                <div className="absolute right-2 top-2 size-2 rounded-full bg-orange-500"></div>
              )}
              <p className="max-w-[80%]">{notification.message}</p>
              <div className="flex w-full items-end justify-between">
                <div>
                  <FancyDate
                    className="mt-2"
                    date={notification.createdAt?.toString() ?? ''}
                  />
                  {!notification.read && (
                    <>
                      {loadingId === notification._id ? (
                        <Loader />
                      ) : (
                        <p
                          className="text-primary mt-3 cursor-pointer p-0 text-sm duration-200 ease-in-out  hover:underline active:scale-110 active:underline"
                          onClick={() =>
                            notification._id &&
                            handleMarkAsRead(notification._id)
                          }
                        >
                          {t('markAsRead')}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {notification?.link && (
                  <Link href={notification.link} className="max-w-fit">
                    <Button variant="default" className="bg-turquoiseBlue">
                      {t('view')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
