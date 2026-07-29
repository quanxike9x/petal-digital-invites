import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  PageViewRecord, 
  DeviceType, 
  BrowserType, 
  OSType, 
  AnalyticsPeriod, 
  InvitationAnalyticsData,
  TimeSeriesPoint 
} from '../types';
import { guestService } from './guestService';
import { rsvpWishService } from './rsvpWishService';
import { invitationService } from './invitationService';
import { mockInvitations, mockUsers, mockPayments, mockTemplates } from '../data/mockData';

const PAGE_VIEWS_KEY = 'pudwedding_page_views';

// Helper: Parse User-Agent String
export const detectUserAgentInfo = (uaString: string = navigator.userAgent): { device_type: DeviceType; browser: BrowserType; os: OSType } => {
  const ua = uaString.toLowerCase();

  // 1. Device Detection
  let device_type: DeviceType = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device_type = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(ua)) {
    device_type = 'mobile';
  }

  // 2. Browser Detection
  let browser: BrowserType = 'Other';
  if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  }

  // 3. OS Detection
  let os: OSType = 'Other';
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/mac os x|macintosh/i.test(ua)) {
    os = 'macOS';
  }

  return { device_type, browser, os };
};

// Initial Mock Page Views for rich analytics visualization
const generateMockPageViews = (invitationId: string): PageViewRecord[] => {
  const views: PageViewRecord[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const devices: DeviceType[] = ['mobile', 'mobile', 'mobile', 'desktop', 'desktop', 'tablet'];
  const browsers: BrowserType[] = ['Chrome', 'Chrome', 'Safari', 'Safari', 'Edge', 'Firefox'];
  const oses: OSType[] = ['iOS', 'Android', 'Android', 'Windows', 'macOS'];

  // Generate 85 page view events over last 30 days
  for (let i = 0; i < 85; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now - daysAgo * dayMs - Math.random() * dayMs);

    views.push({
      id: `pv-${i + 1}`,
      invitation_id: invitationId,
      device_type: devices[i % devices.length],
      browser: browsers[i % browsers.length],
      os: oses[i % oses.length],
      created_at: date.toISOString(),
    });
  }

  return views.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

const getLocalPageViews = (invitationId: string): PageViewRecord[] => {
  const stored = localStorage.getItem(`${PAGE_VIEWS_KEY}_${invitationId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return [];
};

export const analyticsService = {
  // 1. Track Page View on Public Website Access
  trackPageView: async (invitationId: string, guestId?: string): Promise<void> => {
    const { device_type, browser, os } = detectUserAgentInfo();
    const newRecord: PageViewRecord = {
      id: `pv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      guest_id: guestId,
      device_type,
      browser,
      os,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('page_views').insert([newRecord]);
        await supabase.rpc('increment_invitation_views', { inv_id: invitationId });
      } catch (e) {
        console.warn('Supabase tracking fallback to LocalStorage.');
      }
    }

    const current = getLocalPageViews(invitationId);
    current.push(newRecord);
    localStorage.setItem(`${PAGE_VIEWS_KEY}_${invitationId}`, JSON.stringify(current));

    // Update guest opened state if guestId provided
    if (guestId) {
      await guestService.recordGuestView(guestId);
    }
  },

  // 2. Query Detailed Invitation Analytics (7d, 30d, 90d, All)
  getInvitationAnalytics: async (invitationId: string, period: AnalyticsPeriod = '7d'): Promise<InvitationAnalyticsData> => {
    let pageViews: PageViewRecord[] = [];

    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('page_views').select('*').eq('invitation_id', invitationId);
      if (data && data.length > 0) pageViews = data as PageViewRecord[];
    }
    if (pageViews.length === 0) {
      pageViews = getLocalPageViews(invitationId);
    }

    const [guests, rsvps, wishes] = await Promise.all([
      guestService.getGuestsByInvitationId(invitationId),
      rsvpWishService.getRSVPStats(invitationId),
      rsvpWishService.getWishesByInvitationId(invitationId, true),
    ]);

    const now = new Date();
    const todayStr = now.toLocaleDateString('vi-VN');
    const daysLimit = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

    const startDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

    // Filter PageViews by Selected Period
    const periodViews = pageViews.filter((pv) => new Date(pv.created_at) >= startDate);

    // Compute Views Metrics
    const totalViews = pageViews.length;
    const todayViews = pageViews.filter((pv) => new Date(pv.created_at).toLocaleDateString('vi-VN') === todayStr).length;
    const weekViews = pageViews.filter((pv) => new Date(pv.created_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
    const monthViews = pageViews.filter((pv) => new Date(pv.created_at) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)).length;

    // Build Time-Series Points for Charts
    const timeSeriesMap: Record<string, number> = {};
    const rsvpSeriesMap: Record<string, number> = {};
    const wishSeriesMap: Record<string, number> = {};

    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      timeSeriesMap[key] = 0;
      rsvpSeriesMap[key] = 0;
      wishSeriesMap[key] = 0;
    }

    periodViews.forEach((pv) => {
      const d = new Date(pv.created_at);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (timeSeriesMap[key] !== undefined) timeSeriesMap[key]++;
    });

    guests.forEach((g) => {
      if (g.rsvp_time) {
        const d = new Date(g.rsvp_time);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        if (rsvpSeriesMap[key] !== undefined) rsvpSeriesMap[key]++;
      }
    });

    wishes.forEach((w) => {
      const d = new Date(w.created_at);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (wishSeriesMap[key] !== undefined) wishSeriesMap[key]++;
    });

    const viewsTimeSeries: TimeSeriesPoint[] = Object.keys(timeSeriesMap).map((date) => ({ date, value: timeSeriesMap[date] }));
    const rsvpTimeSeries: TimeSeriesPoint[] = Object.keys(rsvpSeriesMap).map((date) => ({ date, value: rsvpSeriesMap[date] }));
    const wishesTimeSeries: TimeSeriesPoint[] = Object.keys(wishSeriesMap).map((date) => ({ date, value: wishSeriesMap[date] }));

    // Device, Browser, & OS Breakdowns
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    const browsers = { chrome: 0, safari: 0, edge: 0, firefox: 0, other: 0 };
    const os = { android: 0, ios: 0, windows: 0, macos: 0, other: 0 };

    periodViews.forEach((pv) => {
      if (pv.device_type === 'desktop') devices.desktop++;
      else if (pv.device_type === 'mobile') devices.mobile++;
      else if (pv.device_type === 'tablet') devices.tablet++;

      if (pv.browser === 'Chrome') browsers.chrome++;
      else if (pv.browser === 'Safari') browsers.safari++;
      else if (pv.browser === 'Edge') browsers.edge++;
      else if (pv.browser === 'Firefox') browsers.firefox++;
      else browsers.other++;

      if (pv.os === 'Android') os.android++;
      else if (pv.os === 'iOS') os.ios++;
      else if (pv.os === 'Windows') os.windows++;
      else if (pv.os === 'macOS') os.macos++;
      else os.other++;
    });

    // Guest Analytics Metrics
    const totalGuests = guests.length;
    const openedGuests = guests.filter((g) => g.status === 'opened').length;
    const unopenedGuests = totalGuests - openedGuests;
    const rsvpedGuests = guests.filter((g) => g.rsvp_status !== 'pending').length;
    const unrsvpedGuests = totalGuests - rsvpedGuests;

    const todayWishes = wishes.filter((w) => new Date(w.created_at).toLocaleDateString('vi-VN') === todayStr).length;

    return {
      views: {
        total: totalViews,
        today: todayViews,
        week: weekViews,
        month: monthViews,
        timeSeries: viewsTimeSeries,
      },
      guests: {
        total: totalGuests,
        opened: openedGuests,
        unopened: unopenedGuests,
        rsvped: rsvpedGuests,
        unrsvped: unrsvpedGuests,
      },
      rsvp: {
        attending: rsvps.attendingCount,
        declined: rsvps.declinedCount,
        pending: rsvps.pendingCount,
        totalHeadcount: rsvps.totalHeadcount,
        timeSeries: rsvpTimeSeries,
      },
      wishes: {
        total: wishes.length,
        today: todayWishes,
        timeSeries: wishesTimeSeries,
      },
      devices,
      browsers,
      os,
    };
  },

  // 3. Query Master Admin Analytics & Top 10 Leaderboards
  getAdminAnalytics: async () => {
    let invitations = mockInvitations;
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('invitations').select('*');
      if (data && data.length > 0) invitations = data as any;
    }

    // Top 10 Leaderboards
    const topViews = [...invitations].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10);
    const topRSVPs = [...invitations].sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0)).slice(0, 10);
    const topWishes = [...invitations].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10);

    return {
      totalUsers: mockUsers.length,
      totalInvitations: invitations.length,
      trialInvitations: invitations.filter((i) => i.plan_type === 'trial' || i.payment_status === 'trial').length,
      paidInvitations: invitations.filter((i) => i.plan_type === 'paid' || i.payment_status === 'paid').length,
      expiredInvitations: invitations.filter((i) => i.is_expired || i.payment_status === 'expired').length,
      totalRevenue: mockPayments.reduce((acc, p) => acc + p.amount, 0),
      topViews,
      topRSVPs,
      topWishes,
    };
  },

  // 4. Export Analytics Report to CSV / Excel File
  exportReport: (reportType: 'rsvp' | 'guests' | 'wishes' | 'analytics', data: any[], filename: string = 'BaoCao') => {
    if (!data || data.length === 0) {
      throw new Error('Không có dữ liệu để xuất báo cáo!');
    }

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'rsvp' || reportType === 'guests') {
      csvContent += 'STT,Tên Khách,Nhóm,Số Điện Thoại,Trạng Thái Mở,Lần Mở Gần Nhất,RSVP,Số Người Đi,Lời Chúc,Link Cá Nhân\n';
      data.forEach((g: any, idx: number) => {
        csvContent += `${idx + 1},"${g.guest_name}","${g.group}","${g.phone || ''}","${g.status}","${g.viewed_at || ''}","${g.rsvp_status}",${g.rsvp_count || 1},"${g.wish || ''}","${g.personal_url}"\n`;
      });
    } else if (reportType === 'wishes') {
      csvContent += 'STT,Tên Người Gửi,Nội Dung Lời Chúc,Trạng Thái Duyệt,Thời Gian Gửi\n';
      data.forEach((w: any, idx: number) => {
        csvContent += `${idx + 1},"${w.guest_name}","${w.message}","${w.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}","${w.created_at}"\n`;
      });
    } else {
      csvContent += 'Chỉ Số,Giá Trị\n';
      Object.keys(data).forEach((key) => {
        csvContent += `"${key}","${data[key]}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
