import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import {
  ApplicationModel,
  SecurityProfileModel,
  UserModel,
  VerificationDocumentModel,
} from '@/lib/db/models';
import { submitApplication, updateGuardProfile } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito à administração.' }, { status: 403 });
    }

    await connectToDatabase();

    const applications = await ApplicationModel.find().lean();
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const sp = await SecurityProfileModel.findById(app.securityProfileId).lean();
        const user = sp ? await UserModel.findById(sp.userId).select('_id name email phone status').lean() : null;
        const docs = await VerificationDocumentModel.find({ applicationId: app._id }).lean();

        return {
          ...app,
          id: app._id,
          securityProfile: sp ? { ...sp, id: sp._id } : null,
          user: user
            ? { id: user._id, name: user.name, email: user.email, phone: user.phone, status: user.status }
            : null,
          documents: docs.map((d) => ({ ...d, id: d._id })),
        };
      })
    );

    return NextResponse.json({ applications: enriched });
  } catch (error: unknown) {
    console.error('Applications GET error:', error);
    return NextResponse.json({ error: 'Erro ao listar candidaturas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Apenas profissionais podem submeter candidatura.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      bio, yearsExperience, skills, categories, city, neighborhood,
      hourlyRate, birthDate, idDocNumber, emergencyContactName, emergencyContactPhone,
    } = body;

    await updateGuardProfile(session.userId, {
      bio: bio || '',
      yearsExperience: Number(yearsExperience) || 0,
      skills: Array.isArray(skills) ? skills : [],
      categories: Array.isArray(categories) ? categories : [],
      city: city || 'Maputo',
      neighborhood: neighborhood || '',
      hourlyRate: Number(hourlyRate) || 300,
      birthDate,
      idDocNumber,
      emergencyContactName,
      emergencyContactPhone,
    });

    const application = await submitApplication(session.userId);

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err?.message || 'Falha ao submeter candidatura.' },
      { status: 400 }
    );
  }
}
