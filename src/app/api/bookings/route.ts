import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import {
  ClientProfileModel,
  SecurityProfileModel,
  BookingModel,
  BookingRequestModel,
  BookingAssignmentModel,
  PaymentModel,
  ServiceCategoryModel,
  UserModel,
} from '@/lib/db/models';
import { createBookingRequestWithGuard } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    await connectToDatabase();

    if (session.role === 'CLIENT') {
      const clientProfile = await ClientProfileModel.findOne({ userId: session.userId }).lean();
      if (!clientProfile) return NextResponse.json({ bookings: [] });

      const bookings = await BookingModel.find({ clientId: clientProfile._id }).lean();
      const enriched = await Promise.all(
        bookings.map(async (b) => {
          const bookingReq = await BookingRequestModel.findById(b.bookingRequestId).lean();
          const assignment = await BookingAssignmentModel.findOne({ bookingId: b._id }).lean();
          const guardProfile = assignment
            ? await SecurityProfileModel.findById(assignment.securityProfileId).lean()
            : null;
          const guardUser = guardProfile
            ? await UserModel.findById(guardProfile.userId).select('name phone avatarUrl').lean()
            : null;
          const payment = await PaymentModel.findOne({ bookingId: b._id }).lean();
          const category = bookingReq
            ? await ServiceCategoryModel.findById(bookingReq.categoryId).select('name').lean()
            : null;

          return {
            ...b,
            id: b._id,
            request: bookingReq ? { ...bookingReq, id: bookingReq._id } : null,
            guard: guardProfile
              ? {
                  id: guardProfile._id,
                  name: guardUser?.name,
                  badgeNumber: guardProfile.badgeNumber,
                  phone: guardUser?.phone,
                  avatarUrl: guardUser?.avatarUrl,
                  rating: guardProfile.rating,
                }
              : null,
            payment: payment ? { ...payment, id: payment._id } : null,
            categoryName: category?.name,
          };
        })
      );

      return NextResponse.json({ bookings: enriched });
    }

    if (session.role === 'PROFESSIONAL') {
      const sp = await SecurityProfileModel.findOne({ userId: session.userId }).lean();
      if (!sp) return NextResponse.json({ bookings: [] });

      const assignments = await BookingAssignmentModel.find({ securityProfileId: sp._id }).lean();
      const proBookings = await Promise.all(
        assignments.map(async (asg) => {
          const booking = await BookingModel.findById(asg.bookingId).lean();
          const bookingReq = booking
            ? await BookingRequestModel.findById(booking.bookingRequestId).lean()
            : null;
          const clientProfile = booking
            ? await ClientProfileModel.findById(booking.clientId).lean()
            : null;
          const clientUser = clientProfile
            ? await UserModel.findById(clientProfile.userId).select('name phone').lean()
            : null;
          const category = bookingReq
            ? await ServiceCategoryModel.findById(bookingReq.categoryId).select('name').lean()
            : null;

          return {
            assignmentId: asg._id,
            assignmentStatus: asg.status,
            booking: booking ? { ...booking, id: booking._id } : null,
            request: bookingReq ? { ...bookingReq, id: bookingReq._id } : null,
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
        })
      );

      return NextResponse.json({ bookings: proBookings });
    }

    if (session.role === 'ADMIN') {
      const allBookings = await BookingModel.find().lean();
      const enriched = await Promise.all(
        allBookings.map(async (b) => {
          const bookingReq = await BookingRequestModel.findById(b.bookingRequestId).lean();
          const clientProfile = await ClientProfileModel.findById(b.clientId).lean();
          const clientUser = clientProfile
            ? await UserModel.findById(clientProfile.userId).select('name').lean()
            : null;
          const assignment = await BookingAssignmentModel.findOne({ bookingId: b._id }).lean();
          const guardProfile = assignment
            ? await SecurityProfileModel.findById(assignment.securityProfileId).lean()
            : null;
          const guardUser = guardProfile
            ? await UserModel.findById(guardProfile.userId).select('name').lean()
            : null;

          return {
            ...b,
            id: b._id,
            request: bookingReq ? { ...bookingReq, id: bookingReq._id } : null,
            clientName: clientUser?.name,
            guardName: guardUser?.name,
          };
        })
      );

      return NextResponse.json({ bookings: enriched });
    }

    return NextResponse.json({ bookings: [] });
  } catch (error: unknown) {
    console.error('Bookings GET error:', error);
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

    await connectToDatabase();
    const clientProfile = await ClientProfileModel.findOne({ userId: session.userId }).lean();
    if (!clientProfile) {
      return NextResponse.json({ error: 'Perfil de cliente não configurado.' }, { status: 400 });
    }

    const body = await req.json();
    const {
      securityProfileId, categoryId, title, description, city,
      neighborhood, startDate, endDate, startTime, endTime,
      hours, paymentMethod, paymentReference,
    } = body;

    if (!securityProfileId || !categoryId || !title || !city || !startDate || !endDate || !startTime || !endTime || !hours) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios da contratação devem ser preenchidos.' },
        { status: 400 }
      );
    }

    const result = await createBookingRequestWithGuard({
      clientId: clientProfile._id as string,
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Booking creation error:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao processar contratação.' },
      { status: 400 }
    );
  }
}
