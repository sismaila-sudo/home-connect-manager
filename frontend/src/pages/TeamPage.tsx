import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, UserIcon, TrashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'co_manager' | 'member' | 'guest';
  login_code?: string;
  status: string;
  created_at: string;
}

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  role: 'co_manager' | 'member' | 'guest';
}

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'member'
  });

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const roleLabels = {
    owner: 'Propriétaire',
    co_manager: 'Co-gestionnaire',
    member: 'Membre',
    guest: 'Invité'
  };

  const roleColors = {
    owner: 'bg-purple-100 text-purple-800',
    co_manager: 'bg-blue-100 text-blue-800',
    member: 'bg-green-100 text-green-800',
    guest: 'bg-gray-100 text-gray-800'
  };

  // Récupérer les membres au chargement
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/households/${user?.household?.id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      toast.error('Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE}/households/${user?.household?.id}/members`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Membre ajouté avec succès !');
      if (response.data.member?.login_code) {
        toast.success(`Code de connexion généré: ${response.data.member.login_code}`, {
          duration: 8000
        });
      }
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'member'
      });
      fetchMembers();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout du membre';
      toast.error(errorMessage);
    }
  };

  const deleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${memberName} de l'équipe ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE}/households/${user?.household?.id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Membre supprimé avec succès');
      fetchMembers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du membre');
    }
  };

  const copyLoginCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Code copié dans le presse-papiers !');
    }).catch(() => {
      toast.error('Impossible de copier le code');
    });
  };

  const canManageMembers = user?.household?.role === 'owner' || user?.household?.role === 'co_manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Équipe - {user?.household?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les membres de votre foyer
          </p>
        </div>
        {canManageMembers && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Ajouter un membre
          </button>
        )}
      </div>

      {/* Information sur les codes de connexion */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <ClipboardDocumentIcon className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Codes de connexion</p>
            <p className="text-blue-700">
              Les membres peuvent se connecter avec leur code personnel au lieu d'un email/mot de passe.
              Les codes sont générés automatiquement lors de l'ajout d'un membre.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      {members.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun membre
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ajoutez des membres à votre équipe pour commencer à collaborer
          </p>
          {canManageMembers && (
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Ajouter le premier membre
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Membres de l'équipe ({members.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                          {roleLabels[member.role]}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        {member.email && <span>{member.email}</span>}
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                      {member.login_code && (
                        <div className="mt-2">
                          <button
                            onClick={() => copyLoginCode(member.login_code!)}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-mono transition-colors"
                            title="Cliquer pour copier"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                            Code: {member.login_code}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {member.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                    {canManageMembers && member.role !== 'owner' && (
                      <button
                        onClick={() => deleteMember(member.id, member.name)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Supprimer le membre"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ajouter un membre
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Membre</option>
                    <option value="co_manager">Co-gestionnaire</option>
                    <option value="guest">Invité</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Les co-gestionnaires peuvent gérer l'équipe et créer des tâches.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <ClipboardDocumentIcon className="w-4 h-4 inline mr-1" />
                    Un code de connexion unique sera généré automatiquement pour ce membre.
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter le membre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}