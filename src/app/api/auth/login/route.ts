import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/repository';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ClientProfileModel, SecurityProfileModel } from '@/lib/db/models';
import { setSessionCookie } from '@/lib/auth/session';
import { seedDatabaseIfEmpty } from '@/lib/db/repository';
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

    await connectToDatabase();
    await seedDatabaseIfEmpty();

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

    let profileId: string | undefined;

    if (user.role === 'CLIENT') {
      const cp = await ClientProfileModel.findOne({ userId: user.id }).select('_id').lean();
      profileId = cp?._id as string | undefined;
    } else if (user.role === 'PROFESSIONAL') {
      const sp = await SecurityProfileModel.findOne({ userId: user.id }).select('_id').lean();
      profileId = sp?._id as string | undefined;
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro ao processar início de sessão.' },
      { status: 500 }
    );
  }
}
