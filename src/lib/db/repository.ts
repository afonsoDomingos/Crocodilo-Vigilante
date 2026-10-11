/**
 * Repository — camada de acesso a dados para MongoDB (Mongoose).
 * Interface pública 100% compatível com o repository anterior (JSON file).
 * Todas as APIs existentes continuam a funcionar sem alterações.
 */
import { connectToDatabase } from './mongoose';
import {
  UserModel,
  ClientProfileModel,
  SecurityProfileModel,
  ApplicationModel,
  VerificationDocumentModel,
  ServiceCategoryModel,
  BookingRequestModel,
  BookingModel,
  BookingAssignmentModel,
  ReviewModel,
  NotificationModel,
  PaymentModel,
  AuditLogModel,
  PlatformSettingsModel,
} from './models';
import {
  User,
  SecurityProfile,
  ClientProfile,
  Application,
  VerificationDocument,
  BookingRequest,
  Booking,
  BookingAssignment,
  Review,
  Notification,
  Payment,
  ApplicationStatus,
} from './types';
import bcrypt from 'bcryptjs';

// ================= HELPERS =================

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/** Convert a Mongoose document to a plain object with `id` as string. */
function toPlain<T>(doc: unknown): T {
  if (!doc) return doc as T;
  const obj = (doc as { toObject?: () => Record<string, unknown> }).toObject
    ? (doc as { toObject: () => Record<string, unknown> }).toObject()
    : (doc as Record<string, unknown>);
  // Map _id → id for interface compatibility
  if (obj._id !== undefined) {
    obj.id = obj._id;
  }
  return obj as T;
}

function toPlainArray<T>(docs: unknown[]): T[] {
  return docs.map((d) => toPlain<T>(d));
}

async function getSettings() {
  await connectToDatabase();
  let settings = await PlatformSettingsModel.findById('settings_default').lean();
  if (!settings) {
    settings = await PlatformSettingsModel.create({
      _id: 'settings_default',
      platformName: 'CROCODILO VIGILANTE',
      slogan: 'A segurança certa, à sua confiança.',
      commissionPercent: 10,
      serviceFeeFixed: 150,
      supportEmail: 'apoio@crocodilovigilante.co.mz',
      supportPhone: '+258 86 697 9225',
      termsUrl: '/termos',
      privacyUrl: '/privacidade',
    });
  }
  return settings;
}

// ================= USER & AUTH REPOSITORY =================

export async function getUserById(id: string): Promise<User | null> {
  await connectToDatabase();
  const doc = await UserModel.findById(id).lean();
  return doc ? { ...doc, id: doc._id } as unknown as User : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();
  return doc ? { ...doc, id: doc._id } as unknown as User : null;
}

export async function createUser(data: {
  name: string;
  email: string;
  phone: string;
  passwordPlain: string;
  role: 'CLIENT' | 'PROFESSIONAL';
  clientType?: 'INDIVIDUAL' | 'COMPANY';
  companyName?: string;
  nuit?: string;
  city?: string;
}): Promise<{ user: User; profile: ClientProfile | SecurityProfile }> {
  await connectToDatabase();

  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error('Já existe uma conta associada a este endereço de e-mail.');
  }

  const now = new Date().toISOString();
  const userId = uid('usr');
  const passwordHash = await bcrypt.hash(data.passwordPlain, 10);

  const newUser = await UserModel.create({
    _id: userId,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    passwordHash,
    role: data.role,
    status: data.role === 'PROFESSIONAL' ? 'PENDING' : 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  });

  let createdProfile: ClientProfile | SecurityProfile;

  if (data.role === 'CLIENT') {
    const cpId = uid('cp');
    const cp = await ClientProfileModel.create({
      _id: cpId,
      userId,
      clientType: data.clientType || 'INDIVIDUAL',
      companyName: data.companyName,
      nuit: data.nuit,
      city: data.city || 'Maputo',
      province: 'Moçambique',
      createdAt: now,
    });
    createdProfile = { ...cp.toObject(), id: cpId } as unknown as ClientProfile;
  } else {
    const spId = uid('sp');
    const sp = await SecurityProfileModel.create({
      _id: spId,
      userId,
      badgeNumber: 'PENDING',
      bio: '',
      yearsExperience: 0,
      skills: [],
      categories: [],
      city: data.city || 'Maputo',
      neighborhood: '',
      rating: 0,
      reviewCount: 0,
      hourlyRate: 300,
      isVerified: false,
      isActive: false,
      isArmed: false,
      createdAt: now,
    });

    const appId = uid('app');
    await ApplicationModel.create({
      _id: appId,
      securityProfileId: spId,
      status: 'DRAFT',
      createdAt: now,
    });

    createdProfile = { ...sp.toObject(), id: spId } as unknown as SecurityProfile;
  }

  return {
    user: { ...newUser.toObject(), id: userId } as unknown as User,
    profile: createdProfile,
  };
}

// ================= MARKETPLACE & SECURITY GUARDS =================

export async function getApprovedGuards(filters?: {
  categoryId?: string;
  city?: string;
  neighborhood?: string;
  minRating?: number;
  search?: string;
  maxHourlyRate?: number;
}): Promise<(SecurityProfile & { user: { name: string; avatarUrl?: string; phone: string } })[]> {
  await connectToDatabase();

  // Get approved application securityProfileIds
  const approvedApps = await ApplicationModel.find({ status: 'APPROVED' }).select('securityProfileId').lean();
  const approvedIds = approvedApps.map((a) => a.securityProfileId);

  // Build query
  const query: Record<string, unknown> = {
    isVerified: true,
    isActive: true,
    _id: { $in: approvedIds },
  };

  if (filters?.categoryId && filters.categoryId !== 'all') {
    query.categories = filters.categoryId;
  }
  if (filters?.city && filters.city !== 'all') {
    query.city = { $regex: new RegExp(`^${filters.city}$`, 'i') };
  }
  if (filters?.minRating) {
    query.rating = { $gte: filters.minRating };
  }
  if (filters?.maxHourlyRate) {
    query.hourlyRate = { $lte: filters.maxHourlyRate };
  }
  if (filters?.search) {
    query.$or = [
      { bio: { $regex: filters.search, $options: 'i' } },
      { skills: { $regex: filters.search, $options: 'i' } },
      { neighborhood: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const profiles = await SecurityProfileModel.find(query).lean();

  const userIds = profiles.map((p) => p._id ? p.userId : '');
  const users = await UserModel.find({ _id: { $in: profiles.map((p) => p.userId) } })
    .select('_id name avatarUrl phone')
    .lean();
  const userMap = new Map(users.map((u) => [u._id, u]));

  // If search includes name, filter additionally
  let result = profiles.map((sp) => {
    const u = userMap.get(sp.userId);
    return {
      ...sp,
      id: sp._id,
      user: {
        name: u?.name || 'Profissional de Segurança',
        avatarUrl: u?.avatarUrl,
        phone: u?.phone || '',
      },
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (item) =>
        item.user.name.toLowerCase().includes(q) ||
        item.bio.toLowerCase().includes(q) ||
        item.skills.some((s: string) => s.toLowerCase().includes(q)) ||
        item.neighborhood.toLowerCase().includes(q)
    );
  }

  return result as unknown as (SecurityProfile & { user: { name: string; avatarUrl?: string; phone: string } })[];
}

export async function getGuardById(id: string) {
  await connectToDatabase();
  const sp = await SecurityProfileModel.findById(id).lean();
  if (!sp) return null;
  const user = await UserModel.findById(sp.userId).select('_id name avatarUrl phone email').lean();
  const application = await ApplicationModel.findOne({ securityProfileId: id }).lean();
  const reviews = await ReviewModel.find({ securityProfileId: id, isModerated: true }).lean();

  return {
    ...sp,
    id: sp._id,
    user: user
      ? { id: user._id, name: user.name, avatarUrl: user.avatarUrl, phone: user.phone, email: user.email }
      : null,
    application: application ? { ...application, id: application._id } : null,
    reviews: reviews.map((r) => ({ ...r, id: r._id })),
  };
}

export async function getGuardByUserId(userId: string) {
  await connectToDatabase();
  const sp = await SecurityProfileModel.findOne({ userId }).lean();
  if (!sp) return null;
  const application = await ApplicationModel.findOne({ securityProfileId: sp._id }).lean();
  const documents = application
    ? await VerificationDocumentModel.find({ applicationId: application._id }).lean()
    : [];

  return {
    profile: { ...sp, id: sp._id },
    application: application ? { ...application, id: application._id } : null,
    documents: documents.map((d) => ({ ...d, id: d._id })),
  };
}

// ================= APPLICATION & VERIFICATION WORKFLOW =================

export async function updateGuardProfile(
  userId: string,
  updates: Partial<Omit<SecurityProfile, 'id' | 'userId' | 'isVerified' | 'isArmed'>>
) {
  await connectToDatabase();
  const sp = await SecurityProfileModel.findOneAndUpdate(
    { userId },
    { ...updates, isArmed: false }, // Rule enforcement
    { new: true }
  ).lean();
  if (!sp) throw new Error('Perfil profissional não encontrado.');
  return { ...sp, id: sp._id };
}

export async function submitApplication(userId: string) {
  await connectToDatabase();
  const sp = await SecurityProfileModel.findOne({ userId }).lean();
  if (!sp) throw new Error('Perfil não encontrado');

  const now = new Date();
  const app = await ApplicationModel.findOneAndUpdate(
    { securityProfileId: sp._id },
    { status: 'PENDING', submittedAt: now },
    { new: true, upsert: true }
  ).lean();

  // Notify admins
  const admins = await UserModel.find({ role: 'ADMIN' }).select('_id').lean();
  for (const admin of admins) {
    await NotificationModel.create({
      _id: uid('notif'),
      userId: admin._id,
      title: 'Nova Candidatura Submetida',
      message: `O candidato associado ao perfil ${sp.badgeNumber} submeteu a sua candidatura para análise.`,
      type: 'APPLICATION',
      isRead: false,
      linkUrl: `/dashboard/admin/applications`,
      createdAt: now,
    });
  }

  return { ...app, id: app!._id };
}

export async function addVerificationDocument(
  applicationId: string,
  doc: {
    docType: 'BI_DIRE' | 'CRIMINAL_RECORD' | 'SECURITY_CERTIFICATE' | 'RESIDENCE_PROOF';
    fileName: string;
    fileSize: number;
    fileKey: string;
    expiresAt?: string;
  }
) {
  await connectToDatabase();
  const docId = uid('doc');
  const newDoc = await VerificationDocumentModel.create({
    _id: docId,
    applicationId,
    docType: doc.docType,
    fileName: doc.fileName,
    fileKey: doc.fileKey,
    fileSize: doc.fileSize,
    verificationStatus: 'PENDING',
    expiresAt: doc.expiresAt,
    createdAt: new Date(),
  });
  return { ...newDoc.toObject(), id: docId };
}

export async function reviewApplication(
  applicationId: string,
  decision: {
    status: ApplicationStatus;
    adminNotes?: string;
    rejectionReason?: string;
    correctionDetails?: string;
    adminUserId: string;
  }
) {
  await connectToDatabase();

  const app = await ApplicationModel.findByIdAndUpdate(
    applicationId,
    {
      status: decision.status,
      adminNotes: decision.adminNotes,
      rejectionReason: decision.rejectionReason,
      correctionDetails: decision.correctionDetails,
      reviewedBy: decision.adminUserId,
      reviewedAt: new Date(),
    },
    { new: true }
  ).lean();

  if (!app) throw new Error('Candidatura não encontrada.');

  const sp = await SecurityProfileModel.findById(app.securityProfileId);
  if (!sp) throw new Error('Perfil de segurança não encontrado.');

  const now = new Date();

  if (decision.status === 'APPROVED') {
    if (sp.badgeNumber === 'PENDING') {
      sp.badgeNumber = `CV-MZ-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    sp.isVerified = true;
    sp.isActive = true;
    await sp.save();
    await UserModel.findByIdAndUpdate(sp.userId, { status: 'ACTIVE' });

    await NotificationModel.create({
      _id: uid('notif'),
      userId: sp.userId,
      title: 'Parabéns! Candidatura Aprovada',
      message: `A sua candidatura foi aprovada. O seu crachá profissional é ${sp.badgeNumber}. O seu perfil já está visível no marketplace.`,
      type: 'APPLICATION',
      isRead: false,
      linkUrl: '/dashboard/pro',
      createdAt: now,
    });
  } else if (decision.status === 'SUSPENDED' || decision.status === 'REJECTED') {
    sp.isVerified = false;
    sp.isActive = false;
    await sp.save();
    await UserModel.findByIdAndUpdate(sp.userId, { status: 'SUSPENDED' });

    await NotificationModel.create({
      _id: uid('notif'),
      userId: sp.userId,
      title: decision.status === 'SUSPENDED' ? 'Conta Suspensa' : 'Candidatura Rejeitada',
      message: decision.rejectionReason || 'Contacte o suporte da plataforma para mais informações.',
      type: 'APPLICATION',
      isRead: false,
      linkUrl: '/dashboard/pro',
      createdAt: now,
    });
  } else if (decision.status === 'NEEDS_CORRECTION') {
    await NotificationModel.create({
      _id: uid('notif'),
      userId: sp.userId,
      title: 'Correção de Documentos Solicitada',
      message: decision.correctionDetails || 'Por favor regularize a documentação pendente.',
      type: 'APPLICATION',
      isRead: false,
      linkUrl: '/dashboard/pro/application',
      createdAt: now,
    });
  }

  // Audit Log
  await AuditLogModel.create({
    _id: uid('aud'),
    actorUserId: decision.adminUserId,
    action: `REVIEW_APPLICATION_${decision.status}`,
    entityType: 'Application',
    entityId: applicationId,
    details: `Decisão: ${decision.status}. Notas: ${decision.adminNotes || ''}`,
    createdAt: now,
  });

  return {
    application: { ...app, id: app._id },
    securityProfile: { ...sp.toObject(), id: sp._id },
  };
}

// ================= BOOKINGS & CONFLICT PREVENTION =================

export async function checkScheduleConflict(
  securityProfileId: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): Promise<{ hasConflict: boolean; reason?: string }> {
  await connectToDatabase();

  const assignments = await BookingAssignmentModel.find({
    securityProfileId,
    status: { $in: ['ACCEPTED', 'PENDING'] },
  }).lean();

  for (const asg of assignments) {
    const booking = await BookingModel.findById(asg.bookingId).lean();
    if (!booking || (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS')) continue;

    const req = await BookingRequestModel.findById(booking.bookingRequestId).lean();
    if (!req) continue;

    const datesOverlap = req.startDate! <= endDate && req.endDate! >= startDate;
    if (datesOverlap) {
      const timesOverlap = req.startTime! < endTime && req.endTime! > startTime;
      if (timesOverlap) {
        return {
          hasConflict: true,
          reason: `O profissional já possui uma contratação confirmada no período de ${req.startDate} (${req.startTime} às ${req.endTime}).`,
        };
      }
    }
  }

  return { hasConflict: false };
}

export async function createBookingRequestWithGuard(params: {
  clientId: string;
  securityProfileId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  paymentMethod: 'MPESA' | 'EMOLA' | 'BANK_TRANSFER' | 'MANUAL';
  paymentReference?: string;
}) {
  await connectToDatabase();

  const conflict = await checkScheduleConflict(
    params.securityProfileId,
    params.startDate,
    params.endDate,
    params.startTime,
    params.endTime
  );
  if (conflict.hasConflict) {
    throw new Error(conflict.reason || 'Conflito de horário detectado para este profissional.');
  }

  const guard = await SecurityProfileModel.findById(params.securityProfileId).lean();
  if (!guard || !guard.isVerified || !guard.isActive) {
    throw new Error('Profissional não elegível ou indisponível para contratação.');
  }

  const settings = await getSettings();
  const now = new Date();
  const totalAmount = guard.hourlyRate * params.hours;
  const platformFee = Math.round(totalAmount * ((settings.commissionPercent ?? 10) / 100));

  const reqId = uid('req');
  const bookingReq = await BookingRequestModel.create({
    _id: reqId,
    clientId: params.clientId,
    categoryId: params.categoryId,
    title: params.title,
    description: params.description,
    city: params.city,
    neighborhood: params.neighborhood,
    startDate: params.startDate,
    endDate: params.endDate,
    startTime: params.startTime,
    endTime: params.endTime,
    numGuards: 1,
    budget: totalAmount,
    specificSkills: [],
    status: 'CONFIRMED',
    createdAt: now,
  });

  const bookingId = uid('bk');
  const booking = await BookingModel.create({
    _id: bookingId,
    bookingRequestId: reqId,
    clientId: params.clientId,
    status: 'CONFIRMED',
    totalAmount,
    platformFee,
    createdAt: now,
  });

  const asgId = uid('asg');
  const assignment = await BookingAssignmentModel.create({
    _id: asgId,
    bookingId,
    securityProfileId: params.securityProfileId,
    status: 'ACCEPTED',
    createdAt: now,
  });

  const payId = uid('pay');
  const payment = await PaymentModel.create({
    _id: payId,
    bookingId,
    amount: totalAmount,
    method: params.paymentMethod,
    reference: params.paymentReference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'CONFIRMED',
    paidAt: now,
    createdAt: now,
  });

  // Notifications
  const clientProfile = await ClientProfileModel.findById(params.clientId).lean();
  if (clientProfile) {
    await NotificationModel.create({
      _id: uid('notif'),
      userId: clientProfile.userId,
      title: 'Contratação Confirmada!',
      message: `O serviço "${params.title}" foi confirmado com sucesso. O profissional foi alocado.`,
      type: 'BOOKING',
      isRead: false,
      linkUrl: `/dashboard/client/bookings/${bookingId}`,
      createdAt: now,
    });
  }

  await NotificationModel.create({
    _id: uid('notif'),
    userId: guard.userId,
    title: 'Nova Contratação Confirmada!',
    message: `Você tem um novo serviço confirmado: "${params.title}" em ${params.city} para ${params.startDate}.`,
    type: 'BOOKING',
    isRead: false,
    linkUrl: `/dashboard/pro/services/${bookingId}`,
    createdAt: now,
  });

  return {
    booking: { ...booking.toObject(), id: bookingId },
    bookingReq: { ...bookingReq.toObject(), id: reqId },
    assignment: { ...assignment.toObject(), id: asgId },
    payment: { ...payment.toObject(), id: payId },
  };
}

// ================= REVIEWS & RATINGS =================

export async function addReview(params: {
  bookingId: string;
  clientId: string;
  securityProfileId: string;
  ratingPunctuality: number;
  ratingProfessionalism: number;
  ratingGeneral: number;
  comment?: string;
}) {
  await connectToDatabase();

  const booking = await BookingModel.findById(params.bookingId).lean();
  if (!booking) throw new Error('Contratação não encontrada.');

  const existing = await ReviewModel.findOne({
    bookingId: params.bookingId,
    clientId: params.clientId,
  }).lean();
  if (existing) throw new Error('Já existe uma avaliação submetida para este serviço.');

  const revId = uid('rev');
  const review = await ReviewModel.create({
    _id: revId,
    bookingId: params.bookingId,
    clientId: params.clientId,
    securityProfileId: params.securityProfileId,
    ratingPunctuality: params.ratingPunctuality,
    ratingProfessionalism: params.ratingProfessionalism,
    ratingGeneral: params.ratingGeneral,
    comment: params.comment,
    isModerated: true,
    createdAt: new Date(),
  });

  // Recalculate guard average rating
  const allReviews = await ReviewModel.find({ securityProfileId: params.securityProfileId }).lean();
  const avg = allReviews.reduce((sum, r) => sum + r.ratingGeneral, 0) / (allReviews.length || 1);
  await SecurityProfileModel.findByIdAndUpdate(params.securityProfileId, {
    rating: parseFloat(avg.toFixed(1)),
    reviewCount: allReviews.length,
  });

  return { ...review.toObject(), id: revId };
}

// ================= NOTIFICATIONS =================

export async function getUserNotifications(userId: string) {
  await connectToDatabase();
  const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({ ...d, id: d._id })) as unknown as Notification[];
}

export async function markNotificationAsRead(notificationId: string) {
  await connectToDatabase();
  await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
}

// ================= ADMIN STATS =================

export async function getAdminMetrics() {
  await connectToDatabase();

  const [
    totalClients,
    totalPros,
    approvedPros,
    pendingApps,
    suspendedPros,
    totalBookings,
    confirmedBookings,
    completedBookings,
    revenueAgg,
    feeAgg,
  ] = await Promise.all([
    UserModel.countDocuments({ role: 'CLIENT' }),
    UserModel.countDocuments({ role: 'PROFESSIONAL' }),
    SecurityProfileModel.countDocuments({ isVerified: true, isActive: true }),
    ApplicationModel.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
    SecurityProfileModel.countDocuments({ isVerified: false, isActive: false }),
    BookingModel.countDocuments(),
    BookingModel.countDocuments({ status: 'CONFIRMED' }),
    BookingModel.countDocuments({ status: 'COMPLETED' }),
    BookingModel.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    BookingModel.aggregate([{ $group: { _id: null, total: { $sum: '$platformFee' } } }]),
  ]);

  return {
    totalClients,
    totalPros,
    approvedPros,
    pendingApps,
    suspendedPros,
    totalBookings,
    confirmedBookings,
    completedBookings,
    totalRevenueMZN: revenueAgg[0]?.total ?? 0,
    totalPlatformFeesMZN: feeAgg[0]?.total ?? 0,
  };
}

// ================= SEED (for initial data) =================

export async function seedDatabaseIfEmpty() {
  await connectToDatabase();

  const userCount = await UserModel.countDocuments();
  if (userCount > 0) return; // Already seeded

  const { getInitialSeedData } = await import('./seed');
  const seed = getInitialSeedData();

  // Insert all collections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await UserModel.insertMany(seed.users.map((u: any) => ({ ...u, _id: u.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ClientProfileModel.insertMany(seed.clientProfiles.map((c: any) => ({ ...c, _id: c.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await SecurityProfileModel.insertMany(seed.securityProfiles.map((s: any) => ({ ...s, _id: s.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ApplicationModel.insertMany(seed.applications.map((a: any) => ({ ...a, _id: a.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await VerificationDocumentModel.insertMany(seed.verificationDocuments.map((d: any) => ({ ...d, _id: d.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ServiceCategoryModel.insertMany(seed.serviceCategories.map((c: any) => ({ ...c, _id: c.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await BookingRequestModel.insertMany(seed.bookingRequests.map((r: any) => ({ ...r, _id: r.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await BookingModel.insertMany(seed.bookings.map((b: any) => ({ ...b, _id: b.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await BookingAssignmentModel.insertMany(seed.bookingAssignments.map((a: any) => ({ ...a, _id: a.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ReviewModel.insertMany(seed.reviews.map((r: any) => ({ ...r, _id: r.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await NotificationModel.insertMany(seed.notifications.map((n: any) => ({ ...n, _id: n.id })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await PaymentModel.insertMany(seed.payments.map((p: any) => ({ ...p, _id: p.id })));
  await PlatformSettingsModel.create({ ...seed.settings, _id: seed.settings.id });

  console.log('✅ Base de dados semeada com dados iniciais.');
}
