import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAdminMetrics } from '@/lib/db/repository';
import { connectToDatabase } from '@/lib/db/mongoose';
import { AuditLogModel, PlatformSettingsModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    }

    await connectToDatabase();
    const metrics = await getAdminMetrics();

    const recentAuditLogs = await AuditLogModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const settings = await PlatformSettingsModel.findById('settings_default').lean();

    return NextResponse.json({
      metrics,
      recentAuditLogs: recentAuditLogs.map((l) => ({ ...l, id: l._id })),
      settings,
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Erro ao carregar métricas.' }, { status: 500 });
  }
}
