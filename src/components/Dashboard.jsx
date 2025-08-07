import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupService, userService } from '../services/api';
import Invitations from './Invitations';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [userBalances, setUserBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');
  
  // Group update states
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Önce grupları yükle
      const groupsResponse = await groupService.getGroups();
      console.log('Groups response:', groupsResponse.data);
      setGroups(groupsResponse.data);
      
      // Sonra balance'ları yüklemeye çalış (eğer endpoint varsa)
      try {
        const balancesResponse = await userService.getUserBalances();
        console.log('Balances response:', balancesResponse.data);
        
        // Backend'den gelen formatı frontend formatına çevir
        const backendBalances = balancesResponse.data;
        const frontendBalances = {
          totalDebt: backendBalances.totalOwedToOthers || 0,
          totalCredit: backendBalances.totalOwedByOthers || 0,
          netBalance: (backendBalances.totalOwedByOthers || 0) - (backendBalances.totalOwedToOthers || 0),
          groupBalances: [] // Şimdilik boş, backend'de grup bazlı balance yoksa
        };
        
        setUserBalances(frontendBalances);
      } catch (balanceError) {
        console.log('Balance endpoint henüz mevcut değil:', balanceError.message);
        // Balance yüklenemezse varsayılan değerler kullan
        setUserBalances({
          totalDebt: 0,
          totalCredit: 0,
          netBalance: 0,
          groupBalances: []
        });
      }
    } catch (error) {
      console.error('Gruplar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreating(true);
    try {
      await groupService.createGroup({ name: newGroupName });
      setNewGroupName('');
      setShowCreateModal(false);
      fetchData(); // Verileri yenile
    } catch (error) {
      console.error('Grup oluşturulurken hata:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteGroup = async (groupId, groupName, e) => {
    e.preventDefault(); // Link'e tıklamayı engelle
    e.stopPropagation(); // Event bubbling'i engelle
    
    const confirmed = window.confirm(`"${groupName}" grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    
    if (confirmed) {
      try {
        await groupService.deleteGroup(groupId);
        alert('Grup başarıyla silindi!');
        fetchData(); // Grupları yenile
      } catch (error) {
        console.error('Grup silinirken hata:', error);
        alert('Grup silinirken hata oluştu: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroupName.trim()) return;

    setUpdating(true);
    try {
      await groupService.updateGroup(editingGroupId, { name: editingGroupName });
      alert('Grup adı başarıyla güncellendi!');
      setEditingGroupId(null);
      setEditingGroupName('');
      fetchData(); // Verileri yenile
    } catch (error) {
      console.error('Grup güncellenirken hata:', error);
      alert('Grup güncellenirken hata oluştu: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
             {/* Header */}
       <nav className="bg-white shadow-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16">
             <div className="flex items-center">
               <Link to="/dashboard" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                 Splitr
               </Link>
             </div>
             <div className="flex items-center space-x-4">
               <span className="text-gray-900 font-medium">
                 Merhaba, {user?.firstName} {user?.lastName}
               </span>
               <Link
                 to="/profile"
                 className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
               >
                 Profil
               </Link>
               <button
                 onClick={handleLogout}
                 className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
               >
                 Çıkış Yap
               </button>
             </div>
           </div>
         </div>
       </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Summary */}
        {userBalances && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel Borç/Alacak Özeti</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600">Toplam Borcunuz</p>
                    <p className="text-2xl font-bold text-red-900">₺{userBalances.totalDebt || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Toplam Alacağınız</p>
                    <p className="text-2xl font-bold text-green-900">₺{userBalances.totalCredit || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Net Durum</p>
                    <p className={`text-2xl font-bold ${(userBalances.netBalance || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      ₺{userBalances.netBalance || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('groups')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'groups'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gruplarım
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invitations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Davetler
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'groups' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Gruplarım</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Yeni Grup Oluştur
              </button>
            </div>
          </>
        )}

        {activeTab === 'invitations' && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Gelen Davetler</h2>
            <Invitations />
          </div>
        )}

        {activeTab === 'groups' && (
          <>
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz grup yok</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Harcamalarınızı paylaşmak için bir grup oluşturun.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      İlk Grubunuzu Oluşturun
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => {
                  const groupBalance = userBalances?.groupBalances?.find(b => b.groupId === group.id);
                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 hover:border-indigo-300 relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        {editingGroupId === group.id ? (
                          <form onSubmit={handleUpdateGroup} className="flex-1">
                            <input
                              type="text"
                              value={editingGroupName}
                              onChange={(e) => setEditingGroupName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold"
                              placeholder="Grup adını girin"
                              required
                            />
                            <div className="flex space-x-2 mt-2">
                              <button
                                type="submit"
                                disabled={updating}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {updating ? 'Kaydediliyor...' : 'Kaydet'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                              >
                                İptal
                              </button>
                            </div>
                          </form>
                        ) : (
                          <Link to={`/group/${group.id}`} className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                          </Link>
                        )}
                        <div className="flex items-center space-x-2">
                          {group.ownerUserCode === user?.userCode && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Sahip
                            </span>
                          )}
                          {group.ownerUserCode === user?.userCode && editingGroupId !== group.id && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditGroup(group);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              title="Grup Adını Düzenle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Grubu Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Group Balance */}
                      {groupBalance && (
                        <div className="mb-4 p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Grup Durumu:</span>
                            <span className={`text-lg font-bold ${groupBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {groupBalance.balance >= 0 ? '+' : ''}₺{groupBalance.balance}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {groupBalance.balance >= 0 ? 'Alacağınız var' : 'Borçlusunuz'}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Grup üyesi
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {group.id}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Grup Oluştur</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                    Grup Adı
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Grup adını girin"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 