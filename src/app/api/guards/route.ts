import { NextRequest, NextResponse } from 'next/server';
import { getApprovedGuards } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const city = searchParams.get('city') || undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const search = searchParams.get('search') || undefined;
    const maxHourlyRate = searchParams.get('maxHourlyRate') ? parseFloat(searchParams.get('maxHourlyRate')!) : undefined;

    const guards = await getApprovedGuards({
      categoryId,
      city,
      minRating,
      search,
      maxHourlyRate,
    });

    return NextResponse.json({
      success: true,
      count: guards.length,
      guards,
    });
  } catch (error: any) {
    console.error('Error fetching guards:', error);
    return NextResponse.json(
      { error: 'Erro ao pesquisar profissionais de segurança.' },
      { status: 500 }
    );
  }
}
