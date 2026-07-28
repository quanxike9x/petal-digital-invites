import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { PaymentOrder, PaymentStatus } from '../types';
import { invitationService } from './invitationService';
import { generateVietQRUrl } from './vietQRService';

export interface AdminBankConfig {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const PAYMENTS_STORE_KEY = 'chungdoi_payment_orders_store';
const ADMIN_BANK_CONFIG_KEY = 'chungdoi_admin_bank_config';

export const getAdminBankConfig = (): AdminBankConfig => {
  const stored = localStorage.getItem(ADMIN_BANK_CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return {
    bankName: 'MB Bank',
    accountNumber: '1018920192',
    accountName: 'PUDWEDDING PLATFORM',
  };
};

export const saveAdminBankConfig = (config: AdminBankConfig) => {
  localStorage.setItem(ADMIN_BANK_CONFIG_KEY, JSON.stringify(config));
};

// Initial Payment Orders List (Starts clean at 0, generated from real users)
const mockOrders: PaymentOrder[] = [];

const getLocalOrders = (): PaymentOrder[] => {
  const stored = localStorage.getItem(PAYMENTS_STORE_KEY);
  if (stored) {
    try {
      const parsed: PaymentOrder[] = JSON.parse(stored);
      // Filter out legacy demo orders
      const realOrders = parsed.filter((o) => !['pay-101', 'pay-102'].includes(o.id));
      if (realOrders.length !== parsed.length) {
        localStorage.setItem(PAYMENTS_STORE_KEY, JSON.stringify(realOrders));
      }
      return realOrders;
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const saveLocalOrders = (orders: PaymentOrder[]) => {
  localStorage.setItem(PAYMENTS_STORE_KEY, JSON.stringify(orders));
};

export const paymentService = {
  // 1. Get Payment Orders (Filtered by user if non-admin)
  getOrders: async (userId?: string): Promise<PaymentOrder[]> => {
    if (isSupabaseConfigured()) {
      let query = supabase.from('payment_orders').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as PaymentOrder[];
      }
    }
    const local = getLocalOrders();
    if (userId) {
      return local.filter((o) => o.user_id === userId);
    }
    return local;
  },

  // 2. Get Order by Invitation ID
  getOrderByInvitationId: async (invitationId: string): Promise<PaymentOrder | null> => {
    const list = await paymentService.getOrders();
    return list.find((o) => o.invitation_id === invitationId) || null;
  },

  // 3. Create Per-Invitation Payment Order
  createOrder: async ({
    invitation_id,
    invitation_title,
    user_id,
    user_name,
    user_email,
    package_name = 'Pro',
  }: {
    invitation_id: string;
    invitation_title: string;
    user_id: string;
    user_name: string;
    user_email: string;
    package_name?: 'Standard' | 'Pro' | 'VIP';
  }): Promise<PaymentOrder> => {
    const orderNum = Math.floor(100000 + Math.random() * 900000);
    const order_code = `PWD-INV-${orderNum}`;

    const newOrder: PaymentOrder = {
      id: `pay-${Date.now()}`,
      order_code,
      invitation_id,
      invitation_title,
      user_id,
      user_name,
      user_email,
      package_name,
      amount: 199000,
      currency: 'VND',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('payment_orders').insert([newOrder]).select().single();
      if (!error && data) {
        // Also update invitation status to pending
        await invitationService.updateInvitation(invitation_id, { payment_status: 'pending' });
        return data as PaymentOrder;
      }
    }

    const current = getLocalOrders();
    const updated = [newOrder, ...current];
    saveLocalOrders(updated);

    // Update invitation payment_status to pending
    await invitationService.updateInvitation(invitation_id, { payment_status: 'pending' });

    return newOrder;
  },

  // 4. Admin Confirm Payment Order (Unlocks Invitation immediately)
  confirmOrder: async (orderId: string, adminEmail: string = 'admin@pudwedding.shop'): Promise<PaymentOrder> => {
    const paidAt = new Date().toISOString();
    const updates = {
      status: 'paid' as PaymentStatus,
      paid_at: paidAt,
      verified_by: adminEmail,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('payment_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        const order = data as PaymentOrder;
        // Unlock target invitation
        await invitationService.updateInvitation(order.invitation_id, {
          payment_status: 'paid',
          paid_at: paidAt,
          is_expired: false,
        });
        return order;
      }
    }

    const current = getLocalOrders();
    let targetOrder: PaymentOrder | null = null;

    const updated = current.map((ord) => {
      if (ord.id === orderId) {
        targetOrder = { ...ord, ...updates };
        return targetOrder;
      }
      return ord;
    });

    saveLocalOrders(updated);

    if (targetOrder) {
      const ord: PaymentOrder = targetOrder;
      // Unlock target invitation immediately
      await invitationService.updateInvitation(ord.invitation_id, {
        payment_status: 'paid',
        paid_at: paidAt,
        is_expired: false,
      });
      return ord;
    }

    throw new Error('Đơn hàng không tồn tại');
  },

  // 5. Admin Reject Payment Order
  rejectOrder: async (orderId: string): Promise<PaymentOrder> => {
    const updates = { status: 'cancelled' as PaymentStatus };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('payment_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        const order = data as PaymentOrder;
        await invitationService.updateInvitation(order.invitation_id, { payment_status: 'expired' });
        return order;
      }
    }

    const current = getLocalOrders();
    let targetOrder: PaymentOrder | null = null;

    const updated = current.map((ord) => {
      if (ord.id === orderId) {
        targetOrder = { ...ord, ...updates };
        return targetOrder;
      }
      return ord;
    });

    saveLocalOrders(updated);

    if (targetOrder) {
      const ord: PaymentOrder = targetOrder;
      await invitationService.updateInvitation(ord.invitation_id, { payment_status: 'expired' });
      return ord;
    }

    throw new Error('Đơn hàng không tồn tại');
  },

  // 6. Generate VietQR for Order Payment using Admin Configured Bank Info
  getVietQRForOrder: (order: PaymentOrder) => {
    const config = getAdminBankConfig();
    const memo = order.order_code;

    const qrUrl = generateVietQRUrl(config.bankName, config.accountNumber, config.accountName, memo, order.amount);

    return {
      bankName: config.bankName,
      accountNumber: config.accountNumber,
      accountName: config.accountName,
      memo,
      amount: order.amount,
      qrUrl,
    };
  },
};
