import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Paramètres
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez votre profil et les paramètres du foyer.
        </p>
      </div>
    </div>
  );
}