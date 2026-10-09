import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAdmin(options = {}) {
  const { redirectOnFail = false } = options;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check', { cache: 'no-store' });

      if (res.ok) {
        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to check admin status', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (redirectOnFail && !loading && !isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, loading, redirectOnFail, router]);

  const checkAuth = useCallback(() => {
    if (!loading && !isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, loading, router]);

  return { isAdmin, loading, checkAuth, refreshAuth };
}
