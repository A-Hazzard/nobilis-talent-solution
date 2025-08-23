import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/LeadsService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { AnalyticsResponse } from '@/shared/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'week' | 'month' | 'year' || 'month';

    // Get real data from services
    const leadsService = new LeadsService();
    const resourcesService = new ResourcesService();

    // Get leads data
    const { leads: allLeads, total: totalLeads } = await leadsService.getAll({ page: 1, limit: 1000 });
    
    // Get resources data
    const { resources: allResources } = await resourcesService.getAll({ limit: 1000 });

    // Calculate analytics from real data
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const leadsThisMonth = allLeads.filter(lead => 
      new Date(lead.createdAt) >= thisMonth
    ).length;

    const topResources = allResources
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5)
      .map(resource => ({
        id: resource.id,
        title: resource.title,
        downloads: resource.downloadCount
      }));

    // Revenue and bonus calculations from completed payments and invoices
    let totalRevenue = 0;
    let revenueThisMonth = 0;
    let totalBonuses = 0;
    let bonusesThisMonth = 0;
    let totalInvoices = 0;

    // Pending payments (completed) - includes base amounts and bonuses
    try {
      const completedPaymentsQ = query(
        collection(db, 'pendingPayments'),
        where('status', '==', 'completed')
      );
      const completedSnap = await getDocs(completedPaymentsQ);
      completedSnap.forEach((doc) => {
        const data: any = doc.data();
        const baseAmount = Number(data.baseAmount || 0);
        const bonusAmount = Number(data.bonusAmount || 0);
        
        totalRevenue += baseAmount;
        totalBonuses += bonusAmount;
        
        const created = data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(0);
        if (created >= thisMonth) {
          revenueThisMonth += baseAmount;
          bonusesThisMonth += bonusAmount;
        }
      });
    } catch {
      // ignore errors; default to 0
    }

    // Invoices (paid) - count all invoices and add to revenue
    try {
      const paidInvoicesQ = query(
        collection(db, 'invoices'),
        where('status', '==', 'paid')
      );
      const paidSnap = await getDocs(paidInvoicesQ);
      paidSnap.forEach((doc) => {
        const data: any = doc.data();
        const amount = Number(data.total || 0);
        totalRevenue += amount;
        totalInvoices += 1;
        
        const paidAt = data.paidAt?.toDate?.() || data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(0);
        if (paidAt >= thisMonth) revenueThisMonth += amount;
      });
    } catch {
      // ignore errors; default to 0
    }

    // Count paid invoices and completed pending payments
    try {
      // Count paid invoices
      const paidInvoicesQ = query(
        collection(db, 'invoices'),
        where('status', '==', 'paid')
      );
      const paidInvoicesSnap = await getDocs(paidInvoicesQ);
      let paidCount = paidInvoicesSnap.size;

      // Count completed pending payments
      const completedPaymentsQ = query(
        collection(db, 'pendingPayments'),
        where('status', '==', 'completed')
      );
      const completedPaymentsSnap = await getDocs(completedPaymentsQ);
      paidCount += completedPaymentsSnap.size;
      
      totalInvoices = paidCount;
    } catch {
      // ignore errors; default to 0
    }

    const analytics = {
      totalLeads,
      leadsThisMonth,
      totalRevenue,
      revenueThisMonth,
      totalBonuses,
      bonusesThisMonth,
      totalInvoices,
      activeUsers: totalLeads,
      resourceDownloads: allResources.reduce((sum, resource) => sum + resource.downloadCount, 0),
      topResources,
      leadSources: [],
    };

    const response: AnalyticsResponse = {
      analytics,
      period,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 