import { useAuth } from '../contexts/AuthContext.jsx';

export const useAuthHook = () => {
  return useAuth();
};