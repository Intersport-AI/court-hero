import { supabase } from './supabase';

export interface Organizer {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'facility';
  eventsCreated: number;
}

/**
 * Sign up a new organizer
 */
export async function signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: 'User creation failed' };

    // Create organizer record
    const { error: dbError } = await supabase.from('organizers').insert({
      id: authData.user.id,
      email,
      password_hash: '', // Don't store password; Supabase handles it
      plan: 'free',
      events_created: 0,
    });

    if (dbError) return { success: false, error: dbError.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign in an organizer (stores session in Supabase)
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string; organizer?: Organizer }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: 'Sign in failed' };

    // Get organizer record
    const { data: orgData, error: dbError } = await supabase
      .from('organizers')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (dbError || !orgData) return { success: false, error: 'Organizer record not found' };

    const organizer: Organizer = {
      id: orgData.id,
      email: orgData.email,
      plan: orgData.plan || 'free',
      eventsCreated: orgData.events_created || 0,
    };

    return { success: true, organizer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign out (clears Supabase session)
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Get current session & organizer
 */
export async function getCurrentOrganizer(): Promise<Organizer | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) return null;

    const { data: orgData } = await supabase
      .from('organizers')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    if (!orgData) return null;

    return {
      id: orgData.id,
      email: orgData.email,
      plan: orgData.plan || 'free',
      eventsCreated: orgData.events_created || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (organizer: Organizer | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const organizer = await getCurrentOrganizer();
      callback(organizer);
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });

  return data?.subscription?.unsubscribe;
}
