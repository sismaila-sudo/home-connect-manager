import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, member, household } = useAuth();
  const currentUser = user || member;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour {currentUser?.name} ! 👋
        </h1>
        <p className="text-primary-100">
          Bienvenue dans votre tableau de bord de gestion de foyer
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tâches en cours</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget mensuel</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">€1,250</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Membres actifs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">4</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Signalements</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tâches récentes
          </h2>
          <div className="space-y-3">
            {[
              { title: 'Nettoyer la cuisine', status: 'En cours', assignee: 'Lucie' },
              { title: 'Passer l\'aspirateur', status: 'Terminée', assignee: 'Ahmed' },
              { title: 'Arroser les plantes', status: 'En attente', assignee: 'Pierre' },
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigné à {task.assignee}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Terminée' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  task.status === 'En cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations du foyer
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom du foyer</p>
              <p className="text-gray-900 dark:text-white">{household?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rôle</p>
              <p className="text-gray-900 dark:text-white">
                {member?.role === 'owner' ? 'Propriétaire' : 
                 member?.role === 'co_manager' ? 'Co-gestionnaire' : 
                 member?.role === 'member' ? 'Membre' : 'Invité'}
              </p>
            </div>
            {user && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Abonnement</p>
                <p className="text-gray-900 dark:text-white capitalize">{user.subscription_type}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}