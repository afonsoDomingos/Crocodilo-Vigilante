import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserNotifications, markNotificationAsRead } from '@/lib/db/repository';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ notifications: [] });
    }

    const notifs = await getUserNotifications(session.userId);
    return NextResponse.json({ notifications: notifs });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao obter notificações.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await req.json();
    if (id) {
      await markNotificationAsRead(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar notificação.' }, { status: 500 });
  }
}
