
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('statusPulseUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
        localStorage.removeItem('statusPulseUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, just check if it's admin@example.com/admin
      if (email === 'admin@example.com' && password === 'admin') {
        const user = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin' as const
        };
        setUser(user);
        localStorage.setItem('statusPulseUser', JSON.stringify(user));
        toast({
          title: 'Login successful',
          description: 'Welcome back to StatusPulse!',
        });
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulating first time setup
      const user = {
        id: '1',
        username,
        email,
        role: 'admin' as const
      };
      setUser(user);
      localStorage.setItem('statusPulseUser', JSON.stringify(user));
      toast({
        title: 'Setup complete',
        description: 'Your admin account has been created!',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('statusPulseUser');
    toast({
      title: 'Logout successful',
      description: 'You have been logged out',
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
