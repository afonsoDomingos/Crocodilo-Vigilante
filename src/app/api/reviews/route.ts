import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ClientProfileModel } from '@/lib/db/models';
import { addReview } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Apenas clientes podem avaliar serviços.' }, { status: 403 });
    }

    await connectToDatabase();
    const cp = await ClientProfileModel.findOne({ userId: session.userId }).select('_id').lean();
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
      clientId: cp._id as string,
      securityProfileId,
      ratingPunctuality: Number(ratingPunctuality) || 5,
      ratingProfessionalism: Number(ratingProfessionalism) || 5,
      ratingGeneral: Number(ratingGeneral) || 5,
      comment,
    });

    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err?.message || 'Erro ao submeter avaliação.' }, { status: 400 });
  }
}
