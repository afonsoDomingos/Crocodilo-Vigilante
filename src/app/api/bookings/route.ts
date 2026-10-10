import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db';
import { createBookingRequestWithGuard } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const db = getDatabase();

    if (session.role === 'CLIENT') {
      const clientProfile = db.clientProfiles.find((cp) => cp.userId === session.userId);
      if (!clientProfile) {
        return NextResponse.json({ bookings: [] });
      }

      const clientBookings = db.bookings
        .filter((b) => b.clientId === clientProfile.id)
        .map((b) => {
          const req = db.bookingRequests.find((r) => r.id === b.bookingRequestId);
          const assignment = db.bookingAssignments.find((a) => a.bookingId === b.id);
          const guardProfile = assignment
            ? db.securityProfiles.find((sp) => sp.id === assignment.securityProfileId)
            : null;
          const guardUser = guardProfile
            ? db.users.find((u) => u.id === guardProfile.userId)
            : null;
          const payment = db.payments.find((p) => p.bookingId === b.id);
          const category = req
            ? db.serviceCategories.find((c) => c.id === req.categoryId)
            : null;

          return {
            ...b,
            request: req,
            guard: guardProfile
              ? {
                  id: guardProfile.id,
                  name: guardUser?.name,
                  badgeNumber: guardProfile.badgeNumber,
                  phone: guardUser?.phone,
                  avatarUrl: guardUser?.avatarUrl,
                  rating: guardProfile.rating,
                }
              : null,
            payment,
            categoryName: category?.name,
          };
        });

      return NextResponse.json({ bookings: clientBookings });
    }

    if (session.role === 'PROFESSIONAL') {
      const sp = db.securityProfiles.find((p) => p.userId === session.userId);
      if (!sp) {
        return NextResponse.json({ bookings: [] });
      }

      const assignments = db.bookingAssignments.filter((a) => a.securityProfileId === sp.id);
      const proBookings = assignments.map((asg) => {
        const booking = db.bookings.find((b) => b.id === asg.bookingId);
        const req = booking
          ? db.bookingRequests.find((r) => r.id === booking.bookingRequestId)
          : null;
        const clientProfile = booking
          ? db.clientProfiles.find((cp) => cp.id === booking.clientId)
          : null;
        const clientUser = clientProfile
          ? db.users.find((u) => u.id === clientProfile.userId)
          : null;
        const category = req
          ? db.serviceCategories.find((c) => c.id === req.categoryId)
          : null;

        return {
          assignmentId: asg.id,
          assignmentStatus: asg.status,
          booking,
          request: req,
          client: clientUser
            ? {
                name: clientUser.name,
                phone: clientUser.phone,
                city: clientProfile?.city,
                address: clientProfile?.address,
              }
            : null,
          categoryName: category?.name,
        };
      });

      return NextResponse.json({ bookings: proBookings });
    }

    if (session.role === 'ADMIN') {
      const allBookings = db.bookings.map((b) => {
        const req = db.bookingRequests.find((r) => r.id === b.bookingRequestId);
        const clientProfile = db.clientProfiles.find((cp) => cp.id === b.clientId);
        const clientUser = clientProfile
          ? db.users.find((u) => u.id === clientProfile.userId)
          : null;
        const assignment = db.bookingAssignments.find((a) => a.bookingId === b.id);
        const guardProfile = assignment
          ? db.securityProfiles.find((sp) => sp.id === assignment.securityProfileId)
          : null;
        const guardUser = guardProfile
          ? db.users.find((u) => u.id === guardProfile.userId)
          : null;

        return {
          ...b,
          request: req,
          clientName: clientUser?.name,
          guardName: guardUser?.name,
        };
      });

      return NextResponse.json({ bookings: allBookings });
    }

    return NextResponse.json({ bookings: [] });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao carregar contratações.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Apenas clientes autenticados podem solicitar serviços de segurança.' },
        { status: 403 }
      );
    }

    const db = getDatabase();
    const clientProfile = db.clientProfiles.find((cp) => cp.userId === session.userId);
    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Perfil de cliente não configurado.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      securityProfileId,
      categoryId,
      title,
      description,
      city,
      neighborhood,
      startDate,
      endDate,
      startTime,
      endTime,
      hours,
      paymentMethod,
      paymentReference,
    } = body;

    if (
      !securityProfileId ||
      !categoryId ||
      !title ||
      !city ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !hours
    ) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios da contratação devem ser preenchidos.' },
        { status: 400 }
      );
    }

    const result = await createBookingRequestWithGuard({
      clientId: clientProfile.id,
      securityProfileId,
      categoryId,
      title,
      description: description || 'Serviço preventivo desarmado.',
      city,
      neighborhood: neighborhood || 'Centro',
      startDate,
      endDate,
      startTime,
      endTime,
      hours: Number(hours),
      paymentMethod: paymentMethod || 'MPESA',
      paymentReference,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar contratação.' },
      { status: 400 }
    );
  }
}
