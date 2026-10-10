import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db';
import { addReview } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Apenas clientes podem avaliar serviços.' }, { status: 403 });
    }

    const db = getDatabase();
    const cp = db.clientProfiles.find((c) => c.userId === session.userId);
    if (!cp) {
      return NextResponse.json({ error: 'Perfil de cliente não encontrado.' }, { status: 404 });
    }

    const body = await req.json();
    const { bookingId, securityProfileId, ratingPunctuality, ratingProfessionalism, ratingGeneral, comment } = body;

    if (!bookingId || !securityProfileId || !ratingGeneral) {
      return NextResponse.json({ error: 'Campos obrigatórios de avaliação não preenchidos.' }, { status: 400 });
    }

    const review = await addReview({
      bookingId,
      clientId: cp.id,
      securityProfileId,
      ratingPunctuality: Number(ratingPunctuality) || 5,
      ratingProfessionalism: Number(ratingProfessionalism) || 5,
      ratingGeneral: Number(ratingGeneral) || 5,
      comment,
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao submeter avaliação.' }, { status: 400 });
  }
}
