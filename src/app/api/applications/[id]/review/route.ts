import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { reviewApplication } from '@/lib/db/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem avaliar candidaturas.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes, rejectionReason, correctionDetails } = body;

    if (!['APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Estado de decisão inválido.' }, { status: 400 });
    }

    const result = await reviewApplication(id, {
      status,
      adminNotes,
      rejectionReason,
      correctionDetails,
      adminUserId: session.userId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar análise da candidatura.' },
      { status: 400 }
    );
  }
}
