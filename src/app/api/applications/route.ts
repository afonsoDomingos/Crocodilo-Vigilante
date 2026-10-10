import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db';
import { submitApplication, updateGuardProfile } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito à administração.' }, { status: 403 });
    }

    const db = getDatabase();
    const enrichedApplications = db.applications.map((app) => {
      const sp = db.securityProfiles.find((p) => p.id === app.securityProfileId);
      const user = sp ? db.users.find((u) => u.id === sp.userId) : null;
      const docs = db.verificationDocuments.filter((d) => d.applicationId === app.id);

      return {
        ...app,
        securityProfile: sp,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              status: user.status,
            }
          : null,
        documents: docs,
      };
    });

    return NextResponse.json({ applications: enrichedApplications });
  } catch (error: any) {
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
    const { bio, yearsExperience, skills, categories, city, neighborhood, hourlyRate, birthDate, idDocNumber, emergencyContactName, emergencyContactPhone } = body;

    // Update profile draft
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

    // Mark application as PENDING for review
    const application = await submitApplication(session.userId);

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Falha ao submeter candidatura.' },
      { status: 400 }
    );
  }
}
