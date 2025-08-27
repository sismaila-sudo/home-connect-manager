import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { User, Member, Household, AuthContextType, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  member: Member | null;
  household: Household | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user?: User; member?: Member; household?: Household } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' };

const initialState: AuthState = {
  user: null,
  member: null,
  household: null,
  loading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload.user || null,
        member: action.payload.member || null,
        household: action.payload.household || null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        member: null,
        household: null,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.login(email, password);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          household: response.household,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const loginWithCode = async (code: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.loginWithCode(code);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          member: response.member,
          household: response.household,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.register(data);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          household: response.household,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      dispatch({ type: 'AUTH_START' });
      const response = await apiService.getCurrentUser();
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          member: response.member,
          household: response.household,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user: state.user,
    member: state.member,
    household: state.household,
    login,
    loginWithCode,
    register,
    logout,
    loading: state.loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}