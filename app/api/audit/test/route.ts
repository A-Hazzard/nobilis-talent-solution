import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/AuditService';

export async function POST(_request: NextRequest) {
  try {
    const auditService = AuditService.getInstance();
    
    // Create sample audit logs
    const sampleLogs = [
      {
        userId: 'test-user-1',
        userEmail: 'admin@example.com',
        action: 'create' as const,
        entity: 'lead' as const,
        entityId: 'lead-001',
        details: { title: 'New Lead: John Doe', ipAddress: '192.168.1.1' },
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      },
      {
        userId: 'test-user-1',
        userEmail: 'admin@example.com',
        action: 'update' as const,
        entity: 'resource' as const,
        entityId: 'resource-001',
        details: { title: 'Updated Resource: Marketing Guide', ipAddress: '192.168.1.1' },
        timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      },
      {
        userId: 'test-user-1',
        userEmail: 'admin@example.com',
        action: 'delete' as const,
        entity: 'testimonial' as const,
        entityId: 'testimonial-001',
        details: { title: 'Deleted Testimonial: Jane Smith', ipAddress: '192.168.1.1' },
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      },
      {
        userId: 'test-user-1',
        userEmail: 'admin@example.com',
        action: 'login' as const,
        entity: 'auth' as const,
        entityId: 'auth-001',
        details: { title: 'Admin Login', ipAddress: '192.168.1.1' },
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      },
      {
        userId: 'test-user-1',
        userEmail: 'admin@example.com',
        action: 'create' as const,
        entity: 'blog' as const,
        entityId: 'blog-001',
        details: { title: 'New Blog Post: Industry Trends', ipAddress: '192.168.1.1' },
        timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
      },
    ];

    // Add all sample logs
    for (const log of sampleLogs) {
      await auditService.logAction(log);
    }

    return NextResponse.json({
      success: true,
      message: 'Sample audit logs created successfully',
      count: sampleLogs.length,
    });
  } catch (error) {
    console.error('Error creating sample audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sample audit logs' },
      { status: 500 }
    );
  }
} 