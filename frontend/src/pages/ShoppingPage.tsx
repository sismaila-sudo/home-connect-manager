import React from 'react';

export default function ShoppingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Listes de Courses
        </h1>
        <button className="btn btn-primary">
          Nouvelle liste
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Module Courses
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Créez et gérez vos listes de courses collaboratives.
        </p>
      </div>
    </div>
  );
}