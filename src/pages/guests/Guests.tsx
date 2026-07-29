import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { invitationService } from '../../services/invitationService';
import { guestService } from '../../services/guestService';
import { rsvpWishService } from '../../services/rsvpWishService';
import { ExpiredTrialPaymentModal } from '../../components/payments/ExpiredTrialPaymentModal';
import type { Invitation, Guest, WishRecord } from '../../types';
import { fixVietnamese } from '../../utils/vietnameseUtils';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Copy, 
  Share2, 
  QrCode, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  MessageCircle,
  Sparkles,
  Heart,
  ChevronDown,
  ShieldCheck,
  Check,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [allWishes, setAllWishes] = useState<WishRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters, Search & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRSVP, setSelectedRSVP] = useState<string>('all');
  const [wishFilter, setWishFilter] = useState<'all' | 'has_wish' | 'no_wish'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'opened_count' | 'viewed_at' | 'rsvp'>('name');

  // Modals & Moderation State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'wishes'>('list');

  // Form State for Single Add
  const [guestName, setGuestName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('Bạn bè');
  const [customGroup, setCustomGroup] = useState('');
  const [note, setNote] = useState('');

  // Form State for Bulk Add
  const [bulkNames, setBulkNames] = useState('');
  const [bulkGroup, setBulkGroup] = useState('Bạn bè');

  // Load User's Invitations on Mount
  useEffect(() => {
    if (user?.id) {
      invitationService.getInvitations(user.id).then((invList) => {
        setInvitations(invList);
        if (invList.length > 0) {
          setSelectedInvitationId(invList[0].id);
        }
      });
    }
  }, [user]);

  // Fetch Guests and Wishes when active Invitation changes
  const refreshData = async () => {
    if (selectedInvitationId) {
      setLoading(true);
      const [gData, wData] = await Promise.all([
        guestService.getGuestsByInvitationId(selectedInvitationId),
        rsvpWishService.getWishesByInvitationId(selectedInvitationId, true),
      ]);
      setGuests(gData);
      setAllWishes(wData);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedInvitationId]);

  const activeInvitation = invitations.find((i) => i.id === selectedInvitationId) || invitations[0];

  // Action: Approve Wish
  const handleApproveWish = async (wishId: string) => {
    try {
      await rsvpWishService.approveWish(wishId);
      toast.success('Đã duyệt lời chúc! Lời chúc hiện đã hiển thị công khai trên thiệp.');
      refreshData();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi duyệt lời chúc.');
    }
  };

  // Action: Delete Wish
  const handleDeleteWish = async (wishId: string) => {
    if (confirm('Xóa lời chúc này khỏi thiệp cưới?')) {
      try {
        await rsvpWishService.deleteWish(wishId);
        toast.info('Đã xóa lời chúc.');
        refreshData();
      } catch (e: any) {
        toast.error(e.message || 'Lỗi khi xóa lời chúc.');
      }
    }
  };

  // Action: Toggle Auto Approve Wishes Setting
  const handleToggleAutoApproveWishes = async () => {
    if (!activeInvitation) return;
    const nextVal = activeInvitation.auto_approve_wishes === false ? true : false;
    try {
      await invitationService.updateInvitation(activeInvitation.id, { auto_approve_wishes: nextVal });
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === activeInvitation.id ? { ...inv, auto_approve_wishes: nextVal } : inv))
      );
      toast.success(
        nextVal
          ? 'Đã bật Tự động duyệt lời chúc! Lời chúc mới sẽ hiển thị ngay.'
          : 'Đã bật Chế độ Kiểm duyệt! Lời chúc mới sẽ chờ bạn duyệt trước khi xuất hiện.'
      );
    } catch (e: any) {
      toast.error('Lỗi khi thay đổi cài đặt kiểm duyệt.');
    }
  };

  // Single Guest Add Submit
  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Vui lòng nhập tên khách mời!');
      return;
    }
    const finalGroup = group === 'Khác' && customGroup.trim() ? customGroup.trim() : group;

    try {
      const created = await guestService.addGuest(
        selectedInvitationId,
        {
          guest_name: guestName,
          gender,
          phone,
          group: finalGroup,
          note,
        },
        activeInvitation?.slug || 'wedding'
      );
      setGuests([created, ...guests]);
      toast.success(`Đã thêm khách mời "${created.guest_name}" thành công!`);
      setIsAddModalOpen(false);
      setGuestName('');
      setPhone('');
      setNote('');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thêm khách mời!');
    }
  };

  // Bulk Add Submit
  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNames.trim()) {
      toast.error('Vui lòng nhập danh sách tên khách mời!');
      return;
    }

    const count = await guestService.bulkAddGuests(
      selectedInvitationId,
      bulkNames,
      bulkGroup,
      activeInvitation?.slug || 'wedding'
    );

    const refreshed = await guestService.getGuestsByInvitationId(selectedInvitationId);
    setGuests(refreshed);
    toast.success(`Đã thêm thành công ${count} khách mời!`);
    setIsBulkModalOpen(false);
    setBulkNames('');
  };

  // Export CSV/Excel
  const handleExportCSV = () => {
    if (guests.length === 0) {
      toast.error('Không có dữ liệu khách mời để xuất file!');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,STT,Tên Khách,Nhóm,Số Điện Thoại,Trạng Thái Mở,RSVP,Số Người Đi,Lời Chúc,Link Cá Nhân\n';
    guests.forEach((g, idx) => {
      csvContent += `${idx + 1},"${g.guest_name}","${g.group}","${g.phone || ''}","${g.status}","${g.rsvp_status}",${g.rsvp_count || 1},"${g.wish || ''}","${g.personal_url}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DanhSachKhachMoi_${activeInvitation?.slug || 'wedding'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file báo cáo danh sách khách mời!');
  };

  // Import CSV/Excel Simulation
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').slice(1); // skip header
      let added = 0;
      for (const line of lines) {
        const parts = line.split(',').map((p) => p.replace(/"/g, '').trim());
        if (parts[0]) {
          try {
            await guestService.addGuest(
              selectedInvitationId,
              { guest_name: parts[0], phone: parts[2] || '', group: parts[1] || 'Khác' },
              activeInvitation?.slug || 'wedding'
            );
            added++;
          } catch (err) {}
        }
      }
      const refreshed = await guestService.getGuestsByInvitationId(selectedInvitationId);
      setGuests(refreshed);
      toast.success(`Đã import thành công ${added} khách mới từ file Excel!`);
    };
    reader.readAsText(file);
  };

  // Action Helpers
  const handleCopyLink = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`Đã sao chép link mời cá nhân cho "${name}"!`);
  };

  const handleDownloadQR = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đã tải QR Code cho "${name}"!`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Xóa khách mời "${name}" khỏi thiệp cưới này?`)) {
      await guestService.deleteGuest(id);
      setGuests(guests.filter((g) => g.id !== id));
      toast.success(`Đã xóa khách mời "${name}".`);
    }
  };

  // Filtered & Sorted Guests
  const filteredGuests = guests
    .filter((g) => {
      const matchesSearch =
        g.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.phone && g.phone.includes(searchTerm));
      const matchesGroup = selectedGroup === 'all' || g.group === selectedGroup;
      const matchesRSVP = selectedRSVP === 'all' || g.rsvp_status === selectedRSVP;
      const matchesWish =
        wishFilter === 'all'
          ? true
          : wishFilter === 'has_wish'
          ? Boolean(g.wish && g.wish.trim())
          : !Boolean(g.wish && g.wish.trim());
      return matchesSearch && matchesGroup && matchesRSVP && matchesWish;
    })
    .sort((a, b) => {
      if (sortBy === 'opened_count') return (b.opened_count || 0) - (a.opened_count || 0);
      if (sortBy === 'viewed_at') return new Date(b.viewed_at || 0).getTime() - new Date(a.viewed_at || 0).getTime();
      if (sortBy === 'rsvp') return a.rsvp_status.localeCompare(b.rsvp_status);
      return a.guest_name.localeCompare(b.guest_name, 'vi');
    });

  // Calculate Metrics
  const totalCount = guests.length;
  const openedCount = guests.filter((g) => g.status === 'opened').length;
  const unopenedCount = totalCount - openedCount;
  const attendingGuests = guests.filter((g) => g.rsvp_status === 'attending');
  const attendingCount = attendingGuests.length;
  const totalHeadcount = attendingGuests.reduce((sum, g) => sum + (g.rsvp_count || 1), 0);
  const declinedCount = guests.filter((g) => g.rsvp_status === 'declined').length;
  const pendingCount = totalCount - attendingCount - declinedCount;

  const unapprovedWishes = allWishes.filter((w) => !w.is_approved);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Top Header Banner & Invitation Selection Selector */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Quản Lý Khách Mời Cá Nhân Hoá</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Danh Sách Khách Mời
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Tạo Link mời cá nhân hóa cho từng người, mã QR riêng, theo dõi phản hồi RSVP và lời chúc mừng.
          </p>
        </div>

        {/* Invitation Switcher Dropdown */}
        {invitations.length > 0 && (
          <div className="relative z-10 bg-slate-900/90 border border-slate-700 rounded-2xl p-2.5 flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold pl-2">Thiệp cưới:</span>
            <select
              value={selectedInvitationId}
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-rose-400 focus:outline-none"
            >
              {invitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title} ({inv.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* STATISTICS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Tổng Khách</span>
          <p className="text-xl font-extrabold text-white">{totalCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase">Đã Xem Thiệp</span>
          <p className="text-xl font-extrabold text-emerald-400">{openedCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-amber-400 font-semibold uppercase">Chưa Mở</span>
          <p className="text-xl font-extrabold text-amber-400">{unopenedCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-rose-400 font-semibold uppercase">Sẽ Tham Dự</span>
          <p className="text-xl font-extrabold text-rose-400">{attendingCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Không Tham Dự</span>
          <p className="text-xl font-extrabold text-slate-400">{declinedCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-indigo-400 font-semibold uppercase">Chưa Phản Hồi</span>
          <p className="text-xl font-extrabold text-indigo-400">{pendingCount}</p>
        </div>
      </div>

      {/* TAB SWITCHER & ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'list' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh Sách Khách ({filteredGuests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'wishes' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-amber-400" />
            <span>Lời Chúc Mừng ({allWishes.length})</span>
            {unapprovedWishes.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center border-2 border-slate-900 animate-bounce">
                {unapprovedWishes.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm 1 Khách</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>+ Thêm Nhanh Nhiều Khách</span>
          </button>

          <label className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
            <input type="file" accept=".csv, .xlsx" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GUEST DATA TABLE */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Group Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-semibold focus:outline-none"
              >
                <option value="all">Tất cả Nhóm Khách</option>
                <option value="Nhà trai">Nhà trai</option>
                <option value="Nhà gái">Nhà gái</option>
                <option value="Bạn bè">Bạn bè</option>
                <option value="Đồng nghiệp">Đồng nghiệp</option>
                <option value="Họ hàng">Họ hàng</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* RSVP Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1">
              <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedRSVP}
                onChange={(e) => setSelectedRSVP(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-semibold focus:outline-none"
              >
                <option value="all">Tất cả Trạng Thái RSVP</option>
                <option value="attending">Sẽ Tham Dự</option>
                <option value="declined">Không Tham Dự</option>
                <option value="pending">Chưa Phản Hồi</option>
              </select>
            </div>

            {/* Wish Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1">
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={wishFilter}
                onChange={(e) => setWishFilter(e.target.value as any)}
                className="w-full bg-transparent text-xs text-white font-semibold focus:outline-none"
              >
                <option value="all">Tất cả Lời Chúc</option>
                <option value="has_wish">Đã gửi lời chúc</option>
                <option value="no_wish">Chưa gửi lời chúc</option>
              </select>
            </div>

            {/* Analytics Sort Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1">
              <Clock className="w-4 h-4 text-rose-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-transparent text-xs text-rose-400 font-bold focus:outline-none"
              >
                <option value="name">Sắp xếp: Tên A-Z</option>
                <option value="opened_count">Sắp xếp: Xem nhiều nhất</option>
                <option value="viewed_at">Sắp xếp: Mới xem gần nhất</option>
                <option value="rsvp">Sắp xếp: Trạng thái RSVP</option>
              </select>
            </div>
          </div>

          {/* TABLE DATA DISPLAY */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-4 text-center">STT</th>
                    <th className="py-4 px-4">Tên Khách Mời</th>
                    <th className="py-4 px-4">Nhóm</th>
                    <th className="py-4 px-4">Số Điện Thoại</th>
                    <th className="py-4 px-4 text-center">Link Cá Nhân</th>
                    <th className="py-4 px-4 text-center">RSVP</th>
                    <th className="py-4 px-4 text-center">Lời Chúc</th>
                    <th className="py-4 px-4 text-center">Trạng Thái</th>
                    <th className="py-4 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        Đang tải danh sách khách mời...
                      </td>
                    </tr>
                  ) : filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        Chưa có khách mời nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest, idx) => (
                      <tr key={guest.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-white text-sm">{guest.guest_name}</p>
                          {guest.note && <p className="text-[11px] text-slate-400 italic mt-0.5">{guest.note}</p>}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                            {guest.group}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-300">{guest.phone || '-'}</td>
                        <td className="py-4 px-4 text-center font-mono">
                          <span className="text-[11px] text-rose-400 truncate max-w-[140px] inline-block">
                            /{guest.guest_slug}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              guest.rsvp_status === 'attending'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : guest.rsvp_status === 'declined'
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {guest.rsvp_status === 'attending'
                              ? `Tham dự (${guest.rsvp_count || 1})`
                              : guest.rsvp_status === 'declined'
                              ? 'Vắng mặt'
                              : 'Chưa trả lời'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {guest.wish ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              ✔ Đã gửi
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px] italic">Chưa gửi</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                            {guest.status === 'opened' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{guest.status === 'opened' ? `Đã xem (${guest.opened_count})` : 'Chưa xem'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleCopyLink(guest.personal_url, guest.guest_name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Sao chép Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadQR(guest.qr_url, guest.guest_name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                              title="Tải QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`https://zalo.me/share?url=${encodeURIComponent(guest.personal_url)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
                              title="Chia sẻ Zalo"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDelete(guest.id, guest.guest_name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                              title="Xóa khách"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LỜI CHÚC MỪNG & DÒNG THỜI GIAN KIỂM DUYỆT */}
      {activeTab === 'wishes' && (
        <div className="space-y-6">
          {/* MODERATION TOGGLE SETTINGS BAR */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                <span className="font-bold text-white text-sm">Cấu Hình Kiểm Duyệt Lời Chúc Mừng</span>
              </div>
              <p className="text-xs text-slate-400">
                {activeInvitation?.auto_approve_wishes !== false
                  ? 'Chế độ hiện tại: Lời chúc từ khách sẽ hiển thị NGAY LẬP TỨC lên thiệp.'
                  : 'Chế độ hiện tại: Lời chúc từ khách sẽ CHỜ BẠN DUYỆT trước khi hiển thị công khai.'}
              </p>
            </div>

            <button
              onClick={handleToggleAutoApproveWishes}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
                activeInvitation?.auto_approve_wishes !== false
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {activeInvitation?.auto_approve_wishes !== false ? 'Duyệt Tự Động (BẬT)' : 'Bật Kiểm Duyệt Trước'}
              </span>
            </button>
          </div>

          {/* WISHES LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allWishes.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
                Chưa có lời chúc mừng nào từ khách mời.
              </div>
            ) : (
              allWishes.map((w) => (
                <div
                  key={w.id}
                  className={`p-6 rounded-3xl bg-slate-900 border transition-all space-y-4 ${
                    !w.is_approved ? 'border-amber-500/50 bg-amber-950/10 shadow-lg' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center border border-rose-500/30">
                        {w.guest_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">{w.guest_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(w.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {!w.is_approved ? (
                      <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-amber-500/40 animate-pulse">
                        Chờ Duyệt
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/40">
                        Đã Hiển Thị
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 italic bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 leading-relaxed">
                    "{w.message}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    {!w.is_approved && (
                      <button
                        onClick={() => handleApproveWish(w.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt Hiển Thị</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteWish(w.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 font-semibold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: THÊM 1 KHÁCH MỜI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-rose-500" />
              <span>Thêm Khách Mới</span>
            </h3>

            <form onSubmit={handleSingleAdd} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Tên khách mời *</label>
                <input
                  type="text"
                  placeholder="VD: Anh Hoàng, Chị Lan..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Nhóm khách</label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Nhà trai">Nhà trai</option>
                    <option value="Nhà gái">Nhà gái</option>
                    <option value="Bạn bè">Bạn bè</option>
                    <option value="Đồng nghiệp">Đồng nghiệp</option>
                    <option value="Họ hàng">Họ hàng</option>
                    <option value="Khác">Khác (Tự nhập)</option>
                  </select>
                </div>
              </div>

              {group === 'Khác' && (
                <div>
                  <label className="text-slate-300 block mb-1">Nhập tên nhóm mới</label>
                  <input
                    type="text"
                    placeholder="VD: CLB Bóng Đá"
                    value={customGroup}
                    onChange={(e) => setCustomGroup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-lg shadow-rose-500/25"
              >
                Lưu Khách Mời
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM NHANH NHIỀU KHÁCH MỜI */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <button onClick={() => setIsBulkModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Thêm Nhanh Nhiều Khách Mời</span>
            </h3>

            <p className="text-xs text-slate-400">Dán danh sách tên khách mời, mỗi người trên 1 dòng:</p>

            <form onSubmit={handleBulkAdd} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Gán vào nhóm</label>
                <select
                  value={bulkGroup}
                  onChange={(e) => setBulkGroup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="Bạn bè">Bạn bè</option>
                  <option value="Đồng nghiệp">Đồng nghiệp</option>
                  <option value="Nhà trai">Nhà trai</option>
                  <option value="Nhà gái">Nhà gái</option>
                  <option value="Họ hàng">Họ hàng</option>
                </select>
              </div>

              <div>
                <textarea
                  rows={6}
                  placeholder={`Anh Hoàng\nChị Lan\nAnh Minh\nGia đình bác Sơn`}
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg"
              >
                Tự Động Sinh Link Cho Tất Cả Khách
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MANDATORY FULLSCREEN EXPIRED TRIAL & PAYMENT MODAL FOR GUESTS */}
      {activeInvitation && (activeInvitation.payment_status === 'expired' || activeInvitation.is_expired) && (
        <ExpiredTrialPaymentModal
          invitation={activeInvitation}
          onPaymentSubmitted={() => {
            if (user?.id) {
              invitationService.getInvitations(user.id).then(setInvitations);
            }
          }}
        />
      )}
    </div>
  );
};
