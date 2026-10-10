import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { SecurityProfileModel, ApplicationModel } from '@/lib/db/models';
import { addVerificationDocument } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'PROFESSIONAL') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    await connectToDatabase();

    const sp = await SecurityProfileModel.findOne({ userId: session.userId }).select('_id').lean();
    if (!sp) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    const app = await ApplicationModel.findOne({ securityProfileId: sp._id }).select('_id').lean();
    if (!app) {
      return NextResponse.json({ error: 'Candidatura não encontrada.' }, { status: 404 });
    }

    const body = await req.json();
    const { docType, fileName, fileSize, expiresAt } = body;

    if (!docType || !fileName) {
      return NextResponse.json({ error: 'Tipo e nome do documento são obrigatórios.' }, { status: 400 });
    }

    // Secure encrypted key reference (Never public URL)
    const fileKey = `private_vault/sp_${sp._id}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const doc = await addVerificationDocument(app._id as string, {
      docType,
      fileName,
      fileSize: Number(fileSize) || 102400,
      fileKey,
      expiresAt,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: unknown) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Erro ao registar documento.' }, { status: 500 });
  }
}
