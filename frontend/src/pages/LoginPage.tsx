import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login, loginWithCode } = useAuth();
  const [loginType, setLoginType] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);

  // Email login form
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
  });

  // Code login form
  const [codeForm, setCodeForm] = useState({
    loginCode: '',
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.email || !emailForm.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(emailForm.email, emailForm.password);
      toast.success('Connexion réussie !');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codeForm.loginCode) {
      toast.error('Veuillez saisir votre code de connexion');
      return;
    }

    setLoading(true);
    try {
      await loginWithCode(codeForm.loginCode);
      toast.success('Connexion réussie !');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Home Connect Manager
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gérez votre foyer en toute simplicité
          </p>
        </div>

        {/* Login type toggle */}
        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'email'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Compte principal
          </button>
          <button
            type="button"
            onClick={() => setLoginType('code')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'code'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Code membre
          </button>
        </div>

        {/* Email Login Form */}
        {loginType === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input mt-1"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={emailForm.password}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input mt-1"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Code Login Form */}
        {loginType === 'code' && (
          <form className="mt-8 space-y-6" onSubmit={handleCodeLogin}>
            <div>
              <label htmlFor="loginCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code de connexion
              </label>
              <input
                id="loginCode"
                name="loginCode"
                type="text"
                autoComplete="off"
                required
                value={codeForm.loginCode}
                onChange={(e) => setCodeForm(prev => ({ ...prev, loginCode: e.target.value.toUpperCase() }))}
                className="form-input mt-1 text-center text-lg font-mono tracking-widest"
                placeholder="ABCDEF"
                maxLength={6}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Saisissez le code fourni par le gestionnaire du foyer
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? 'Connexion...' : 'Se connecter avec le code'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Register link */}
        {loginType === 'email' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        )}

        {/* Demo accounts */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Comptes de démonstration
          </h3>
          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <p><strong>Gestionnaire :</strong> marie.martin@email.com / password123</p>
            <p><strong>Membre :</strong> Code LUCIE01</p>
          </div>
        </div>
      </div>
    </div>
  );
}