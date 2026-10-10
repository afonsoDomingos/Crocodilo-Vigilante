import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db';
import { addVerificationDocument } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'PROFESSIONAL') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const db = getDatabase();
    const sp = db.securityProfiles.find((p) => p.userId === session.userId);
    if (!sp) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    const app = db.applications.find((a) => a.securityProfileId === sp.id);
    if (!app) {
      return NextResponse.json({ error: 'Candidatura não encontrada.' }, { status: 404 });
    }

    const body = await req.json();
    const { docType, fileName, fileSize, expiresAt } = body;

    if (!docType || !fileName) {
      return NextResponse.json({ error: 'Tipo e nome do documento são obrigatórios.' }, { status: 400 });
    }

    // Secure encrypted key reference (Never public URL)
    const fileKey = `private_vault/sp_${sp.id}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const doc = await addVerificationDocument(app.id, {
      docType,
      fileName,
      fileSize: Number(fileSize) || 102400,
      fileKey,
      expiresAt,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao registar documento.' }, { status: 500 });
  }
}
