import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfigFront';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaArrowLeft, FaEdit, FaTrash, FaCrown, FaCoins, FaUser, FaStar, FaGem } from 'react-icons/fa';

export default function UsersAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    creditos: 0,
    isAdmin: false,
    isPremium: false,
    plano: 'free'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'usuarios'));
      const usersData = [];
      
      usersSnap.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar por data de criação (mais recentes primeiro)
      usersData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate() - a.createdAt.toDate();
        }
        return 0;
      });
      
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      nome: user.nome || '',
      email: user.email || '',
      creditos: user.creditos || 0,
      isAdmin: user.isAdmin || false,
      isPremium: user.isPremium || false,
      plano: user.plano || 'free'
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const userRef = doc(db, 'usuarios', editingUser.id);
      await updateDoc(userRef, {
        nome: editForm.nome,
        creditos: parseInt(editForm.creditos),
        isAdmin: editForm.isAdmin,
        isPremium: editForm.isPremium,
        plano: editForm.plano,
        // Atualizar subscription para compatibilidade
        subscription: editForm.isPremium ? { active: true, updatedAt: new Date() } : { active: false, updatedAt: new Date() }
      });
      
      // Atualizar lista local
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editForm, creditos: parseInt(editForm.creditos) }
          : user
      ));
      
      setEditingUser(null);
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteDoc(doc(db, 'usuarios', userId));
        setUsers(users.filter(user => user.id !== userId));
        alert('Usuário deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('Erro ao deletar usuário.');
      }
    }
  };

  const togglePremium = async (user) => {
    const currentPremiumStatus = user.isPremium || user.plano === 'premium' || user.subscription?.active;
    const newPremiumStatus = !currentPremiumStatus;
    
    try {
      const userRef = doc(db, 'usuarios', user.id);
      await updateDoc(userRef, {
        isPremium: newPremiumStatus,
        plano: newPremiumStatus ? 'premium' : 'free',
        subscription: { active: newPremiumStatus, updatedAt: new Date() }
      });
      
      // Atualizar lista local
      setUsers(users.map(u => 
        u.id === user.id 
          ? { 
              ...u, 
              isPremium: newPremiumStatus,
              plano: newPremiumStatus ? 'premium' : 'free',
              subscription: { active: newPremiumStatus, updatedAt: new Date() }
            }
          : u
      ));
      
      alert(`Usuário ${newPremiumStatus ? 'promovido para Premium' : 'rebaixado para Gratuito'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status premium:', error);
      alert('Erro ao alterar status premium.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas de usuários
  const premiumUsers = users.filter(user => 
    user.isPremium || user.plano === 'premium' || user.subscription?.active
  ).length;
  const adminUsers = users.filter(user => user.isAdmin).length;
  const totalCredits = users.reduce((sum, user) => sum + (user.creditos || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <FaArrowLeft />
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                👥 Gerenciar Usuários
              </h1>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-1 text-gray-600">
                  <FaUser className="text-gray-500" />
                  <span>Total: {users.length}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600">
                  <FaGem className="text-orange-500" />
                  <span>Premium: {premiumUsers}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600">
                  <FaCrown className="text-purple-500" />
                  <span>Admins: {adminUsers}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <FaCoins className="text-yellow-500" />
                  <span>Créditos: {totalCredits.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Busca */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créditos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.foto ? (
                            <img className="h-10 w-10 rounded-full" src={user.foto} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUser className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nome || 'Sem nome'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FaCoins className="text-yellow-500" />
                        <span className="text-sm font-medium">{user.creditos || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePremium(user)}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        {user.isPremium || user.plano === 'premium' || user.subscription?.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200 hover:from-yellow-200 hover:to-orange-200 cursor-pointer">
                            <FaGem className="text-orange-600" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer">
                            <FaStar className="text-gray-500" />
                            Gratuito
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FaCrown />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Usuário
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.nome || user.email)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Editar Usuário
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (somente leitura)
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Créditos
                </label>
                <input
                  type="number"
                  value={editForm.creditos}
                  onChange={(e) => setEditForm({ ...editForm, creditos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Seção Premium */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaGem className="text-orange-600" />
                  Configurações Premium
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.isPremium}
                        onChange={(e) => {
                          const isPremium = e.target.checked;
                          setEditForm({ 
                            ...editForm, 
                            isPremium,
                            plano: isPremium ? 'premium' : 'free'
                          });
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Usuário Premium
                      </span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Plano
                    </label>
                    <select
                      value={editForm.plano}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        plano: e.target.value,
                        isPremium: e.target.value === 'premium'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="free">Gratuito</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isAdmin}
                    onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Administrador
                  </span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 