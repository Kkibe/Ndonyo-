import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { supabase } from '../config/supabase';
import { userService } from '../services/marketplace.service';
import { sendLoginAlertEmail } from '../services/email.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState(null);
  const loginAlertSentRef = useRef(false);
  const pendingAuthErrorRef = useRef(null);

  const fetchUserData = useCallback(async (user) => {
    if (!user) {
      setUserData(null);
      return;
    }
    const data = await userService.getUser(user.id);
    setUserData(data);
    setIsAdmin(data?.is_admin === true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Detect OAuth error params from the redirect URL (e.g. ?error=server_error&error_description=...)
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const oauthErrorDesc = urlParams.get('error_description');
    if (oauthError) {
      console.error('OAuth redirect error:', oauthError, oauthErrorDesc);
      const msg = oauthErrorDesc || 'Sign-in failed. Please try again.';
      pendingAuthErrorRef.current = msg;
      setAuthError(msg);
      // Clean the URL so the error doesn't persist on refresh
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          (async () => {
            await fetchUserData(user);

            // Send login alert on SIGNED_IN events (not token refreshes)
            if (event === 'SIGNED_IN' && !loginAlertSentRef.current) {
              loginAlertSentRef.current = true;
              try {
                const profile = await userService.getUser(user.id);
                if (profile) {
                  sendLoginAlertEmail(profile);
                }
              } catch (e) {
                console.error('Login alert failed:', e);
              }
            }
            setLoading(false);
          })();
        } else {
          loginAlertSentRef.current = false;
          setUserData(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);

  const refreshUserData = useCallback(async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  }, [currentUser, fetchUserData]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserData(null);
    setIsAdmin(false);
    loginAlertSentRef.current = false;
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    pendingAuthErrorRef.current = null;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    authError,
    clearAuthError,
    refreshUserData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
