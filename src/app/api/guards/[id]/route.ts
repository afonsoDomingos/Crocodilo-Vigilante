import { NextRequest, NextResponse } from 'next/server';
import { getGuardById } from '@/lib/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guard = await getGuardById(id);

    if (!guard) {
      return NextResponse.json(
        { error: 'Profissional não encontrado.' },
        { status: 404 }
      );
    }

    // Mask sensitive personal information for public viewing
    const publicProfile = {
      id: guard.id,
      badgeNumber: guard.badgeNumber,
      bio: guard.bio,
      yearsExperience: guard.yearsExperience,
      skills: guard.skills,
      categories: guard.categories,
      city: guard.city,
      neighborhood: guard.neighborhood,
      rating: guard.rating,
      reviewCount: guard.reviewCount,
      hourlyRate: guard.hourlyRate,
      isVerified: guard.isVerified,
      isActive: guard.isActive,
      isArmed: false,
      user: {
        name: guard.user?.name || 'Profissional',
        avatarUrl: guard.user?.avatarUrl,
      },
      reviews: guard.reviews || [],
    };

    return NextResponse.json({ success: true, guard: publicProfile });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao carregar perfil do profissional.' },
      { status: 500 }
    );
  }
}
