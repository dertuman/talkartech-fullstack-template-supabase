'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Notification } from '@/models/NotificationModel';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface NotificationsContextType {
  getNotifications: () => void;
  notifications: Notification[];
  notificationsCount: number;
  getNotificationsCount: () => void;
  isLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

const POLLING_INTERVAL = 10000; // 10 seconds

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const isAuthenticated = session?.status === 'authenticated';

  const getNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await axios.get('/api/notifications/get-all');
      setNotifications(response.data);
    } catch (error) {
      console.error(JSON.stringify(error));
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  const getNotificationsCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await axios.get('/api/notifications/count');
      setNotificationsCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch notifications count:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    getNotifications();
    getNotificationsCount();

    const interval = setInterval(() => {
      getNotificationsCount();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, getNotifications, getNotificationsCount]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistically update the notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      setNotificationsCount((prevCount) => prevCount - 1);

      await axios.patch('/api/notifications/mark-as-read', { id });
      await getNotifications();
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-as-read');
      await getNotifications();
      await getNotificationsCount();
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        getNotifications,
        getNotificationsCount,
        notifications,
        isLoading,
        notificationsCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    );
  }
  return context;
};
