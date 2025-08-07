import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupService, expenseService, paymentService } from '../services/api';

const GroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  
  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form states
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    memberUserCodes: []
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    receiverUserCode: ''
  });
  const [inviteForm, setInviteForm] = useState({
    userCode: ''
  });

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [expensesRes, paymentsRes, balancesRes, membersRes] = await Promise.all([
        expenseService.getExpenses(groupId),
        paymentService.getPayments(groupId),
        expenseService.getBalances(groupId),
        groupService.getGroupMembers(groupId)
      ]);

      console.log('Group balances response:', balancesRes.data);
      console.log('Group members response:', membersRes.data);

      setExpenses(expensesRes.data);
      setPayments(paymentsRes.data);
      setBalances(balancesRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Grup verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || expenseForm.memberUserCodes.length === 0) return;

    try {
      await expenseService.createExpense(groupId, {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      });
      setExpenseForm({ title: '', amount: '', memberUserCodes: [] });
      setShowExpenseModal(false);
      fetchGroupData();
    } catch (error) {
      console.error('Harcama oluşturulurken hata:', error);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentForm.receiverUserCode) return;

    try {
      await paymentService.createPayment(groupId, {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount)
      });
      setPaymentForm({ amount: '', receiverUserCode: '' });
      setShowPaymentModal(false);
      fetchGroupData();
    } catch (error) {
      console.error('Ödeme oluşturulurken hata:', error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.userCode) return;

    try {
      await groupService.inviteMember(groupId, inviteForm.userCode);
      setInviteForm({ userCode: '' });
      setShowInviteModal(false);
      alert('Davet gönderildi!');
    } catch (error) {
      console.error('Davet gönderilirken hata:', error);
      alert('Davet gönderilemedi: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMemberName = (userCode) => {
    const member = members.find(m => m.userCode === userCode);
    return member ? `${member.firstName} ${member.lastName}` : userCode;
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
             <div className="flex items-center space-x-4">
               <Link to="/dashboard" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                 Splitr
               </Link>
               <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
                 ← Geri
               </Link>
               <h1 className="text-2xl font-bold text-gray-900">Grup Detayları</h1>
             </div>
             <div className="flex space-x-2">
               <Link
                 to="/profile"
                 className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
               >
                 Profil
               </Link>
               <button
                 onClick={() => setShowInviteModal(true)}
                 className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
               >
                 Üye Davet Et
               </button>
             </div>
           </div>
         </div>
       </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Harcamalar
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ödemeler
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balances'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bakiyeler
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Üyeler
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Harcamalar</h2>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Harcama Ekle
                </button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <li key={expense.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{expense.title}</h3>
                          <p className="text-sm text-gray-500">
                            {getMemberName(expense.createdByUserCode)} tarafından {formatDate(expense.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">₺{expense.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ödemeler</h2>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Ödeme Ekle
                </button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <li key={payment.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {getMemberName(payment.payerUserCode)} → {getMemberName(payment.receiverUserCode)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.paymentDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">₺{payment.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Grup Bakiyeleri</h2>
              
              {/* Özet Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Ödemem Gereken</p>
                      <p className="text-2xl font-bold text-red-900">
                        ₺{balances.filter(b => b.fromUserCode === user?.userCode).reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Alacağım</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₺{balances.filter(b => b.toUserCode === user?.userCode).reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Üye Bazında Borç/Alacak Tablosu */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Üye Bazında Durum</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Her üyenin grup içindeki borç/alacak durumu</p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    {members.map((member) => {
                      // Bu üyenin başkalarına olan borçları (fromUserCode = member)
                      const debts = balances.filter(b => b.fromUserCode === member.userCode);
                      const totalDebt = debts.reduce((sum, b) => sum + b.amount, 0);
                      
                      // Bu üyenin başkalarından olan alacakları (toUserCode = member)
                      const credits = balances.filter(b => b.toUserCode === member.userCode);
                      const totalCredit = credits.reduce((sum, b) => sum + b.amount, 0);
                      
                      // Net bakiye: alacaklar - borçlar
                      const netBalance = totalCredit - totalDebt;
                      
                      return (
                        <div key={member.userCode} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            {member.firstName} {member.lastName}
                            {member.userCode === user?.userCode && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Sen
                              </span>
                            )}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-4">
                                <span className={`text-sm ${totalDebt > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                  Borç: ₺{totalDebt.toFixed(2)}
                                </span>
                                <span className={`text-sm ${totalCredit > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                  Alacak: ₺{totalCredit.toFixed(2)}
                                </span>
                              </div>
                              <span className={`text-lg font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {netBalance >= 0 ? '+' : ''}₺{netBalance.toFixed(2)}
                              </span>
                            </div>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              </div>

              {/* Detaylı Borç Listesi */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Detaylı Borç Listesi</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Kim kime ne kadar borçlu</p>
                </div>
                                 <ul className="divide-y divide-gray-200">
                   {balances.map((balance, index) => (
                     <li key={index} className="px-6 py-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <h3 className="text-lg font-medium text-gray-900">
                             {getMemberName(balance.fromUserCode)} → {getMemberName(balance.toUserCode)}
                           </h3>
                           <p className="text-sm text-gray-500">
                             {balance.fromUserCode === user?.userCode ? 'Sen borçlusun' : 
                              balance.toUserCode === user?.userCode ? 'Sen alacaklısın' : 
                              'Diğer üyeler arası'}
                           </p>
                         </div>
                         <div className="flex items-center space-x-4">
                           <div className="text-right">
                             <p className="text-lg font-semibold text-red-600">
                               ₺{balance.amount.toFixed(2)}
                             </p>
                           </div>
                           {balance.fromUserCode === user?.userCode && (
                             <button
                               onClick={() => {
                                 setPaymentForm({
                                   amount: balance.amount.toString(),
                                   receiverUserCode: balance.toUserCode
                                 });
                                 setShowPaymentModal(true);
                               }}
                               className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                             >
                               Ödeme Yap
                             </button>
                           )}
                         </div>
                       </div>
                     </li>
                   ))}
                  {balances.length === 0 && (
                    <li className="px-6 py-4 text-center text-gray-500">
                      Henüz borç bulunmuyor. Tüm hesaplar eşit.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Grup Üyeleri</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <li key={member.userCode} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <p className="text-xs text-gray-400">Kod: {member.userCode}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Harcama Ekle</h3>
            <form onSubmit={handleCreateExpense}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlık</label>
                  <input
                    type="text"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tutar (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dahil Olan Üyeler</label>
                  <div className="mt-2 space-y-2">
                    {members.map((member) => (
                      <label key={member.userCode} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={expenseForm.memberUserCodes.includes(member.userCode)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExpenseForm({
                                ...expenseForm,
                                memberUserCodes: [...expenseForm.memberUserCodes, member.userCode]
                              });
                            } else {
                              setExpenseForm({
                                ...expenseForm,
                                memberUserCodes: expenseForm.memberUserCodes.filter(code => code !== member.userCode)
                              });
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {member.firstName} {member.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Ödeme Ekle</h3>
            <form onSubmit={handleCreatePayment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tutar (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alıcı</label>
                  <select
                    value={paymentForm.receiverUserCode}
                    onChange={(e) => setPaymentForm({...paymentForm, receiverUserCode: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Alıcı seçin</option>
                    {members.filter(m => m.userCode !== user?.userCode).map((member) => (
                      <option key={member.userCode} value={member.userCode}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Üye Davet Et</h3>
            <form onSubmit={handleInviteMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Kodu</label>
                <input
                  type="text"
                  value={inviteForm.userCode}
                  onChange={(e) => setInviteForm({...inviteForm, userCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="5 karakterlik kullanıcı kodunu girin"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Davet Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail; 