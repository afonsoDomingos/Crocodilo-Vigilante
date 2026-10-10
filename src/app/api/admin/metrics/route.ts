import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAdminMetrics } from '@/lib/db/repository';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
    }

    const metrics = await getAdminMetrics();
    const db = getDatabase();

    // Get recent audit logs
    const recentAuditLogs = db.auditLogs
      .slice(-10)
      .reverse();

    return NextResponse.json({
      metrics,
      recentAuditLogs,
      settings: db.settings,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar métricas.' }, { status: 500 });
  }
}
