import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db/repository';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role, clientType, companyName, nuit, city } = body;

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A palavra-passe deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    if (role !== 'CLIENT' && role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Tipo de utilizador inválido.' },
        { status: 400 }
      );
    }

    const { user, profile } = await createUser({
      name,
      email,
      phone,
      passwordPlain: password,
      role,
      clientType,
      companyName,
      nuit,
      city,
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileId: profile.id,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileId: profile.id,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar conta.' },
      { status: 400 }
    );
  }
}
