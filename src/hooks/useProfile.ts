import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { parseUserProfileResponse, type UserProfile } from '../types/user';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFetch('/api/v1/users/me', {
          method: 'GET',
        }, parseUserProfileResponse);

        setProfile(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar os dados do perfil.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error
  };
};
