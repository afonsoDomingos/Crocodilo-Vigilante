import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/repository';
import { getDatabase } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e palavra-passe são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e palavra-passe.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e palavra-passe.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'A sua conta encontra-se suspensa pela administração. Contacte o suporte.' },
        { status: 403 }
      );
    }

    const db = getDatabase();
    let profileId: string | undefined;

    if (user.role === 'CLIENT') {
      const cp = db.clientProfiles.find((p) => p.userId === user.id);
      profileId = cp?.id;
    } else if (user.role === 'PROFESSIONAL') {
      const sp = db.securityProfiles.find((p) => p.userId === user.id);
      profileId = sp?.id;
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileId,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar início de sessão.' },
      { status: 500 }
    );
  }
}
