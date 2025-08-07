import React, { useState, useEffect } from 'react';
import { invitationService, groupService } from '../services/api';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingInvitations, setAcceptingInvitations] = useState(new Set());

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await invitationService.getInvitations();
      console.log('Invitations response:', response.data);
      console.log('First invitation object:', response.data[0]); // Debug: see the structure
      setInvitations(response.data);
    } catch (error) {
      console.error('Davetler yüklenirken hata:', error);
      alert('Davetler yüklenirken hata oluştu: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId, groupId) => {
    console.log('Accepting invitation with ID:', invitationId, 'for group:', groupId);
    console.log('Full invitation object:', invitations.find(inv => inv.invitationId === invitationId));
    
    // Set loading state for this specific invitation
    setAcceptingInvitations(prev => new Set(prev).add(invitationId));
    
    try {
      // Try using group-based endpoint instead
      const response = await groupService.acceptInvitation(groupId);
      console.log('Accept invitation response:', response);
      alert('Davet başarıyla kabul edildi!');
      fetchInvitations(); // Davetleri yenile
    } catch (error) {
      console.error('Davet kabul edilirken hata:', error);
      console.error('Error response:', error.response);
      alert('Davet kabul edilirken hata oluştu: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    } finally {
      // Remove loading state for this invitation
      setAcceptingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Henüz davet bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div key={invitation.invitationId} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{invitation.groupName}</h4>
              <p className="text-sm text-gray-500">
                {invitation.inviterName} tarafından davet edildiniz
              </p>
              <p className="text-xs text-gray-400">
                {new Date(invitation.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleAcceptInvitation(invitation.invitationId, invitation.groupId)}
                disabled={acceptingInvitations.has(invitation.invitationId)}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acceptingInvitations.has(invitation.invitationId) ? 'Kabul Ediliyor...' : 'Kabul Et'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Invitations; 