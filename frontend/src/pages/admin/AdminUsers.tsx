import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminUserService } from '../../api/adminUserService';
import type { Role, User } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { Users, Search, RefreshCw, Ban, CheckCircle, Mail } from 'lucide-react';

export const AdminUsers: React.FC = () => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [filterTrigger, setFilterTrigger] = useState(0);

    // Status action modal
    const [statusTargetUser, setStatusTargetUser] = useState<User | null>(null);
    const [isActionPending, setIsActionPending] = useState(false);
    const [isRoleUpdatingUserId, setIsRoleUpdatingUserId] = useState<string | null>(null);

    const fetchUsers = async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getAllUsers({
                page,
                size: 8,
                searchName: searchName || undefined,
                searchEmail: searchEmail || undefined,
            });
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (error) {
            console.error('Error fetching admin users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(0);
    }, [filterTrigger]);

    const handlePageChange = (page: number) => {
        fetchUsers(page);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFilterTrigger((prev) => prev + 1);
    };

    const handleRoleChange = async (user: User, newRole: Role) => {
        if (user.role === newRole) return;
        setIsRoleUpdatingUserId(user.id);
        try {
            await adminUserService.updateUserRole(user.id, newRole);
            fetchUsers(currentPage);
            showToast('success', `${user.firstName} ${user.lastName} rolü başarıyla güncellendi`);
        } catch (error: any) {
            console.error('Error updating user role:', error);
            showToast('error', error.response?.data?.message || 'Rol güncellenirken hata oluştu.');
        } finally {
            setIsRoleUpdatingUserId(null);
        }
    };

    const handleStatusConfirm = async () => {
        if (!statusTargetUser) return;
        setIsActionPending(true);
        const shouldSuspend = statusTargetUser.active;
        try {
            await adminUserService.updateUserStatus(statusTargetUser.id, !shouldSuspend);
            setStatusTargetUser(null);
            fetchUsers(currentPage);
            if (shouldSuspend) {
                showToast('warning', `${statusTargetUser.firstName} ${statusTargetUser.lastName} hesabı askıya alındı`);
            } else {
                showToast('success', `${statusTargetUser.firstName} ${statusTargetUser.lastName} hesabı yeniden aktifleştirildi`);
            }
        } catch (error: any) {
            console.error('Error updating user status:', error);
            showToast('error', error.response?.data?.message || 'Hesap durumu güncellenirken hata oluştu.');
        } finally {
            setIsActionPending(false);
        }
    };

    const isSelf = (user: User) => user.id === currentUser?.id;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-black tracking-tight">Kullanıcı Yönetimi</h1>
                    <p className="text-slate-400 text-sm mt-1">Sisteme kayıtlı kullanıcıları listeleyin, rollerini değiştirin ve hesapları yönetin.</p>
                </div>
            </div>

            {/* Filter and Search Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            placeholder="İsim ara..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="w-full bg-slate-950 text-black border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            placeholder="E-posta ara..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full bg-slate-950 text-black border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
                        />
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                    <button
                        type="submit"
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                        Ara
                    </button>
                </form>
            </div>

            {/* User List Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-855">
                    <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-400 text-sm font-semibold mt-4">Kullanıcılar Yükleniyor...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-medium">Aradığınız kriterlere uygun kullanıcı bulunamadı.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                                        <th className="py-4 px-6">Kullanıcı</th>
                                        <th className="py-4 px-6">Rol</th>
                                        <th className="py-4 px-6 text-center">Durum</th>
                                        <th className="py-4 px-6">Kayıt Tarihi</th>
                                        <th className="py-4 px-6 text-center">Rol Değiştir</th>
                                        <th className="py-4 px-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-sm">
                                    {users.map((user) => (
                                        <tr key={user.id} className="border border-slate-800 hover:bg-slate-850/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-black">
                                                    {user.firstName} {user.lastName}</p>
                                                <p className="text-slate-500 text-xs mt-0.5 font-mono">{user.email}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.role === 'ROLE_ADMIN' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                                        Kullanıcı
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {user.active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
                                                        Askıda
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-slate-400 text-xs">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '—'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <select
                                                    value={user.role}
                                                    disabled={isSelf(user) || isRoleUpdatingUserId === user.id}
                                                    onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                                                    className="w-full bg-slate-955 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <option value="ROLE_USER">Kullanıcı</option>
                                                    <option value="ROLE_ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center space-x-2.5">
                                                    <button
                                                        onClick={() => setStatusTargetUser(user)}
                                                        disabled={isSelf(user)}
                                                        className={`p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${user.active
                                                            ? 'text-red-500 hover:text-red-450'
                                                            : 'text-emerald-500 hover:text-emerald-400'
                                                            }`}
                                                        title={user.active ? 'Hesabı Askıya Al' : 'Hesabı Aktifleştir'}
                                                    >
                                                        {user.active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Status Change Confirmation Modal */}
            {statusTargetUser && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStatusTargetUser(null)} />
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative z-10 animate-fade-in">
                        <div className="flex justify-center">
                            <div className={`p-3 rounded-full ${statusTargetUser.active
                                ? 'bg-red-500/10 border border-red-500/35 text-red-400'
                                : 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400'
                                }`}>
                                {statusTargetUser.active ? (
                                    <Ban className="w-12 h-12" />
                                ) : (
                                    <CheckCircle className="w-12 h-12" />
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-black">
                                {statusTargetUser.active ? 'Hesabı Askıya Al' : 'Hesabı Aktifleştir'}
                            </h3>
                            <p className="text-slate-405 text-xs leading-relaxed">
                                {statusTargetUser.active
                                    ? `${statusTargetUser.firstName} ${statusTargetUser.lastName} hesabı askıya alınacak. Kullanıcı giriş yapamayacak ve mevcut oturumu anında kapatılacak.`
                                    : `${statusTargetUser.firstName} ${statusTargetUser.lastName} hesabı yeniden aktifleştirilecek. Kullanıcı giriş yapabilecek.`}
                            </p>
                        </div>
                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => setStatusTargetUser(null)}
                                className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] cursor-pointer text-sm"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleStatusConfirm}
                                disabled={isActionPending}
                                className={`flex-1 font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm ${statusTargetUser.active
                                    ? 'bg-red-650 hover:bg-red-50 disabled:bg-red-800 text-red-600 border border-red-700'
                                    : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white'
                                    }`}
                            >
                                {isActionPending ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <span>{statusTargetUser.active ? 'Askıya Al' : 'Aktifleştir'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};