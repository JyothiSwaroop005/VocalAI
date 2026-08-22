import type { UserProfile, AuthCredentials } from '../types/auth';

const STORAGE_KEY = 'vocallabs_active_user_session';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr-jyothi',
    name: 'Jyothi Sharma',
    firstName: 'Jyothi',
    email: 'jyothi.sharma@nexus-tech.io',
    avatar: '👩‍💼',
    tier: 'Enterprise VIP',
    company: 'Nexus Tech International',
    role: 'VP of Product Engineering',
    preferences: {
      theme: 'dark',
      voiceSynthesis: true,
      autoOrchestrate: true,
      defaultAgent: 'Nova'
    },
    lastLoginTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'usr-alex',
    name: 'Alex Chen',
    firstName: 'Alex',
    email: 'alex.chen@cyber-systems.org',
    avatar: '👨‍💻',
    tier: 'Pro',
    company: 'Cyber Systems Corp',
    role: 'Senior Solutions Architect',
    preferences: {
      theme: 'dark',
      voiceSynthesis: true,
      autoOrchestrate: false,
      defaultAgent: 'Atlas'
    },
    lastLoginTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'usr-sarah',
    name: 'Sarah Jenkins',
    firstName: 'Sarah',
    email: 'sarah.j@apex-health.com',
    avatar: '👩‍🔬',
    tier: 'Enterprise VIP',
    company: 'Apex Healthcare System',
    role: 'Chief Medical Information Officer',
    preferences: {
      theme: 'glass',
      voiceSynthesis: true,
      autoOrchestrate: true,
      defaultAgent: 'Maya'
    },
    lastLoginTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

class AuthService {
  public getStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return DEMO_PROFILES[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse user session:', e);
    }
    // Default to Jyothi Sharma for initial seamless demo launch
    return DEMO_PROFILES[0];
  }

  public loginWithEmail(credentials: AuthCredentials): UserProfile {
    const firstName = credentials.name 
      ? credentials.name.split(' ')[0] 
      : credentials.email.split('@')[0];

    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: credentials.name || firstName,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      email: credentials.email,
      avatar: '👤',
      tier: 'Pro',
      company: 'VocalLabs Partner Network',
      role: 'Intelligence OS Specialist',
      preferences: {
        theme: 'dark',
        voiceSynthesis: true,
        autoOrchestrate: true,
        defaultAgent: 'Nova'
      },
      lastLoginTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.saveUserSession(profile);
    return profile;
  }

  public loginWithGoogle(): UserProfile {
    const profile: UserProfile = {
      id: `usr-google-${Date.now()}`,
      name: 'Jyothi Sharma',
      firstName: 'Jyothi',
      email: 'jyothi.sharma@gmail.com',
      avatar: '🌐',
      tier: 'Enterprise VIP',
      company: 'Google Cloud Ecosystem',
      role: 'Principal AI Architect (Google Verified)',
      preferences: {
        theme: 'dark',
        voiceSynthesis: true,
        autoOrchestrate: true,
        defaultAgent: 'Nova'
      },
      lastLoginTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.saveUserSession(profile);
    return profile;
  }

  public loginWithDemoProfile(profileId: string): UserProfile {
    const found = DEMO_PROFILES.find(p => p.id === profileId) || DEMO_PROFILES[0];
    const updated = {
      ...found,
      lastLoginTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.saveUserSession(updated);
    return updated;
  }

  public saveUserSession(profile: UserProfile) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to save user session:', e);
      }
    }
  }

  public logout() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear user session:', e);
      }
    }
  }
}

export const authService = new AuthService();
