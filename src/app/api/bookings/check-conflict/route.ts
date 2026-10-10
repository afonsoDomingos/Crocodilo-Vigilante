import { NextRequest, NextResponse } from 'next/server';
import { checkScheduleConflict } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const securityProfileId = searchParams.get('securityProfileId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!securityProfileId || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Parâmetros de data e horário incompletos.' },
        { status: 400 }
      );
    }

    const result = await checkScheduleConflict(
      securityProfileId,
      startDate,
      endDate,
      startTime,
      endTime
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao verificar disponibilidade.' },
      { status: 500 }
    );
  }
}
