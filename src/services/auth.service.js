import { supabase } from '../config/supabase';

const getErrorMessage = (message) => {
  if (!message) return 'An error occurred. Please try again.';
  const map = {
    'Invalid login credentials': 'Incorrect email or password.',
    'User already registered': 'An account already exists with this email.',
    'Password should be at least 6 characters': 'Password should be at least 6 characters.',
    'Email not confirmed': 'Please verify your email before logging in.',
  };
  for (const key of Object.keys(map)) {
    if (message.includes(key)) return map[key];
  }
  return message;
};

class AuthService {
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.message) };
    }
  }

  async register(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.message) };
    }
  }

  async forgotPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.message) };
    }
  }

  async logout() {
    await supabase.auth.signOut();
    return true;
  }

  async signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error.message) };
    }
  }
}

export const authService = new AuthService();
