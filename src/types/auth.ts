export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  email: string;
  avatar: string;
  tier: 'Standard' | 'Pro' | 'Enterprise VIP';
  company: string;
  role: string;
  preferences: {
    theme: 'dark' | 'glass';
    voiceSynthesis: boolean;
    autoOrchestrate: boolean;
    defaultAgent: string;
  };
  lastLoginTimestamp: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  name?: string;
}

export interface ConfirmationRequest {
  id: string;
  title: string;
  message: string;
  actionType: 'booking' | 'messaging' | 'purchase' | 'cancellation' | 'deletion';
  details: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
}
