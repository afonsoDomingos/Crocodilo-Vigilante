import { getDatabase, saveDatabase } from './index';
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
  Complaint,
  Notification,
  AuditLog,
  Payment,
  ApplicationStatus,
  BookingStatus,
} from './types';
import bcrypt from 'bcryptjs';

// ================= USER & AUTH REPOSITORY =================

export async function getUserById(id: string): Promise<User | null> {
  const db = getDatabase();
  return db.users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
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
  const db = getDatabase();
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error('Já existe uma conta associada a este endereço de e-mail.');
  }

  const now = new Date().toISOString();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = await bcrypt.hash(data.passwordPlain, 10);

  const newUser: User = {
    id: userId,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    passwordHash,
    role: data.role,
    status: data.role === 'PROFESSIONAL' ? 'PENDING' : 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(newUser);

  let createdProfile: ClientProfile | SecurityProfile;

  if (data.role === 'CLIENT') {
    const cp: ClientProfile = {
      id: `cp_${Date.now()}`,
      userId,
      clientType: data.clientType || 'INDIVIDUAL',
      companyName: data.companyName,
      nuit: data.nuit,
      city: data.city || 'Maputo',
      province: 'Moçambique',
      createdAt: now,
    };
    db.clientProfiles.push(cp);
    createdProfile = cp;
  } else {
    // Professional initial draft profile
    const sp: SecurityProfile = {
      id: `sp_${Date.now()}`,
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
      isArmed: false, // Inviolable rule
      createdAt: now,
    };
    db.securityProfiles.push(sp);

    // Initial draft application
    const app: Application = {
      id: `app_${Date.now()}`,
      securityProfileId: sp.id,
      status: 'DRAFT',
      createdAt: now,
    };
    db.applications.push(app);

    createdProfile = sp;
  }

  await saveDatabase(db);
  return { user: newUser, profile: createdProfile };
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
  const db = getDatabase();

  // Strict Rule: ONLY verified, active pros with approved applications can appear!
  const approvedAppIds = new Set(
    db.applications
      .filter((app) => app.status === 'APPROVED')
      .map((app) => app.securityProfileId)
  );

  let guards = db.securityProfiles.filter(
    (sp) => sp.isVerified && sp.isActive && approvedAppIds.has(sp.id)
  );

  if (filters?.categoryId && filters.categoryId !== 'all') {
    guards = guards.filter((sp) => sp.categories.includes(filters.categoryId!));
  }

  if (filters?.city && filters.city !== 'all') {
    guards = guards.filter((sp) => sp.city.toLowerCase() === filters.city!.toLowerCase());
  }

  if (filters?.minRating) {
    guards = guards.filter((sp) => sp.rating >= filters.minRating!);
  }

  if (filters?.maxHourlyRate) {
    guards = guards.filter((sp) => sp.hourlyRate <= filters.maxHourlyRate!);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    guards = guards.filter((sp) => {
      const user = db.users.find((u) => u.id === sp.userId);
      const nameMatch = user?.name.toLowerCase().includes(q) ?? false;
      const bioMatch = sp.bio.toLowerCase().includes(q);
      const skillsMatch = sp.skills.some((s) => s.toLowerCase().includes(q));
      const neighborhoodMatch = sp.neighborhood.toLowerCase().includes(q);
      return nameMatch || bioMatch || skillsMatch || neighborhoodMatch;
    });
  }

  return guards.map((sp) => {
    const u = db.users.find((user) => user.id === sp.userId);
    return {
      ...sp,
      user: {
        name: u?.name || 'Profissional de Segurança',
        avatarUrl: u?.avatarUrl,
        phone: u?.phone || '',
      },
    };
  });
}

export async function getGuardById(id: string) {
  const db = getDatabase();
  const sp = db.securityProfiles.find((p) => p.id === id);
  if (!sp) return null;
  const user = db.users.find((u) => u.id === sp.userId);
  const application = db.applications.find((a) => a.securityProfileId === sp.id);
  const reviews = db.reviews.filter((r) => r.securityProfileId === sp.id && r.isModerated);

  return {
    ...sp,
    user: user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl, phone: user.phone, email: user.email } : null,
    application,
    reviews,
  };
}

export async function getGuardByUserId(userId: string) {
  const db = getDatabase();
  const sp = db.securityProfiles.find((p) => p.userId === userId);
  if (!sp) return null;
  const application = db.applications.find((a) => a.securityProfileId === sp.id);
  const documents = application
    ? db.verificationDocuments.filter((d) => d.applicationId === application.id)
    : [];
  return { profile: sp, application, documents };
}

// ================= APPLICATION & VERIFICATION WORKFLOW =================

export async function updateGuardProfile(
  userId: string,
  updates: Partial<Omit<SecurityProfile, 'id' | 'userId' | 'isVerified' | 'isArmed'>>
) {
  const db = getDatabase();
  const idx = db.securityProfiles.findIndex((sp) => sp.userId === userId);
  if (idx === -1) throw new Error('Perfil profissional não encontrado.');

  db.securityProfiles[idx] = {
    ...db.securityProfiles[idx],
    ...updates,
    isArmed: false, // Rule enforcement
  };

  await saveDatabase(db);
  return db.securityProfiles[idx];
}

export async function submitApplication(userId: string) {
  const db = getDatabase();
  const sp = db.securityProfiles.find((p) => p.userId === userId);
  if (!sp) throw new Error('Perfil não encontrado');

  let app = db.applications.find((a) => a.securityProfileId === sp.id);
  const now = new Date().toISOString();

  if (!app) {
    app = {
      id: `app_${Date.now()}`,
      securityProfileId: sp.id,
      status: 'PENDING',
      submittedAt: now,
      createdAt: now,
    };
    db.applications.push(app);
  } else {
    app.status = 'PENDING';
    app.submittedAt = now;
  }

  // Notify admin
  const admins = db.users.filter((u) => u.role === 'ADMIN');
  for (const admin of admins) {
    db.notifications.push({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: admin.id,
      title: 'Nova Candidatura Submetida',
      message: `O candidato associado ao perfil ${sp.badgeNumber} submeteu a sua candidatura para análise.`,
      type: 'APPLICATION',
      isRead: false,
      linkUrl: `/dashboard/admin/applications`,
      createdAt: now,
    });
  }

  await saveDatabase(db);
  return app;
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
  const db = getDatabase();
  const newDoc: VerificationDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    applicationId,
    docType: doc.docType,
    fileName: doc.fileName,
    fileKey: doc.fileKey,
    fileSize: doc.fileSize,
    verificationStatus: 'PENDING',
    expiresAt: doc.expiresAt,
    createdAt: new Date().toISOString(),
  };

  db.verificationDocuments.push(newDoc);
  await saveDatabase(db);
  return newDoc;
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
  const db = getDatabase();
  const appIndex = db.applications.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error('Candidatura não encontrada.');

  const app = db.applications[appIndex];
  const spIndex = db.securityProfiles.findIndex((sp) => sp.id === app.securityProfileId);
  if (spIndex === -1) throw new Error('Perfil de segurança não encontrado.');

  const now = new Date().toISOString();
  app.status = decision.status;
  app.adminNotes = decision.adminNotes;
  app.rejectionReason = decision.rejectionReason;
  app.correctionDetails = decision.correctionDetails;
  app.reviewedBy = decision.adminUserId;
  app.reviewedAt = now;

  const sp = db.securityProfiles[spIndex];
  const user = db.users.find((u) => u.id === sp.userId);

  if (decision.status === 'APPROVED') {
    sp.isVerified = true;
    sp.isActive = true;
    if (sp.badgeNumber === 'PENDING') {
      sp.badgeNumber = `CV-MZ-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (user) user.status = 'ACTIVE';

    // Notification to professional
    db.notifications.push({
      id: `notif_${Date.now()}`,
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
    if (user) user.status = 'SUSPENDED';

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: sp.userId,
      title: decision.status === 'SUSPENDED' ? 'Conta Suspensa' : 'Candidatura Rejeitada',
      message: decision.rejectionReason || 'Contacte o suporte da plataforma para mais informações.',
      type: 'APPLICATION',
      isRead: false,
      linkUrl: '/dashboard/pro',
      createdAt: now,
    });
  } else if (decision.status === 'NEEDS_CORRECTION') {
    db.notifications.push({
      id: `notif_${Date.now()}`,
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
  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    actorUserId: decision.adminUserId,
    action: `REVIEW_APPLICATION_${decision.status}`,
    entityType: 'Application',
    entityId: applicationId,
    details: `Decisão: ${decision.status}. Notas: ${decision.adminNotes || ''}`,
    createdAt: now,
  });

  await saveDatabase(db);
  return { application: app, securityProfile: sp };
}

// ================= BOOKINGS & CONFLICT PREVENTION =================

export async function checkScheduleConflict(
  securityProfileId: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): Promise<{ hasConflict: boolean; reason?: string }> {
  const db = getDatabase();

  // Find confirmed or in-progress bookings where this security profile is assigned
  const assignments = db.bookingAssignments.filter(
    (a) => a.securityProfileId === securityProfileId && (a.status === 'ACCEPTED' || a.status === 'PENDING')
  );

  for (const asg of assignments) {
    const booking = db.bookings.find((b) => b.id === asg.bookingId);
    if (!booking || (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS')) {
      continue;
    }

    const req = db.bookingRequests.find((r) => r.id === booking.bookingRequestId);
    if (!req) continue;

    // Check date overlap
    const datesOverlap = req.startDate <= endDate && req.endDate >= startDate;
    if (datesOverlap) {
      // Check time overlap on overlapping dates
      const timesOverlap = req.startTime < endTime && req.endTime > startTime;
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
  const db = getDatabase();

  // 1. Conflict Check
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

  const guard = db.securityProfiles.find((sp) => sp.id === params.securityProfileId);
  if (!guard || !guard.isVerified || !guard.isActive) {
    throw new Error('Profissional não elegível ou indisponível para contratação.');
  }

  const now = new Date().toISOString();
  const totalAmount = guard.hourlyRate * params.hours;
  const platformFee = Math.round(totalAmount * (db.settings.commissionPercent / 100));

  // 2. Create Booking Request
  const reqId = `req_${Date.now()}`;
  const bookingReq: BookingRequest = {
    id: reqId,
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
  };
  db.bookingRequests.push(bookingReq);

  // 3. Create Booking
  const bookingId = `bk_${Date.now()}`;
  const booking: Booking = {
    id: bookingId,
    bookingRequestId: reqId,
    clientId: params.clientId,
    status: 'CONFIRMED',
    totalAmount,
    platformFee,
    createdAt: now,
  };
  db.bookings.push(booking);

  // 4. Create Assignment
  const asgId = `asg_${Date.now()}`;
  const assignment: BookingAssignment = {
    id: asgId,
    bookingId,
    securityProfileId: params.securityProfileId,
    status: 'ACCEPTED',
    createdAt: now,
  };
  db.bookingAssignments.push(assignment);

  // 5. Create Payment record
  const payId = `pay_${Date.now()}`;
  const payment: Payment = {
    id: payId,
    bookingId,
    amount: totalAmount,
    method: params.paymentMethod,
    reference: params.paymentReference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'CONFIRMED',
    paidAt: now,
    createdAt: now,
  };
  db.payments.push(payment);

  // 6. Notifications
  const clientUser = db.clientProfiles.find((cp) => cp.id === params.clientId);
  if (clientUser) {
    db.notifications.push({
      id: `notif_${Date.now()}_cl`,
      userId: clientUser.userId,
      title: 'Contratação Confirmada!',
      message: `O serviço "${params.title}" foi confirmado com sucesso. O profissional foi alocado.`,
      type: 'BOOKING',
      isRead: false,
      linkUrl: `/dashboard/client/bookings/${bookingId}`,
      createdAt: now,
    });
  }

  db.notifications.push({
    id: `notif_${Date.now()}_pro`,
    userId: guard.userId,
    title: 'Nova Contratação Confirmada!',
    message: `Você tem um novo serviço confirmado: "${params.title}" em ${params.city} para ${params.startDate}.`,
    type: 'BOOKING',
    isRead: false,
    linkUrl: `/dashboard/pro/services/${bookingId}`,
    createdAt: now,
  });

  await saveDatabase(db);
  return { booking, bookingReq, assignment, payment };
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
  const db = getDatabase();

  // Validate that booking exists and is completed (or confirmed for demo verification)
  const booking = db.bookings.find((b) => b.id === params.bookingId);
  if (!booking) {
    throw new Error('Contratação não encontrada.');
  }

  // Prevent duplicate review
  const existing = db.reviews.find(
    (r) => r.bookingId === params.bookingId && r.clientId === params.clientId
  );
  if (existing) {
    throw new Error('Já existe uma avaliação submetida para este serviço.');
  }

  const now = new Date().toISOString();
  const review: Review = {
    id: `rev_${Date.now()}`,
    bookingId: params.bookingId,
    clientId: params.clientId,
    securityProfileId: params.securityProfileId,
    ratingPunctuality: params.ratingPunctuality,
    ratingProfessionalism: params.ratingProfessionalism,
    ratingGeneral: params.ratingGeneral,
    comment: params.comment,
    isModerated: true,
    createdAt: now,
  };

  db.reviews.push(review);

  // Recalculate guard average rating
  const guardReviews = db.reviews.filter((r) => r.securityProfileId === params.securityProfileId);
  const avg =
    guardReviews.reduce((sum, r) => sum + r.ratingGeneral, 0) / (guardReviews.length || 1);

  const sp = db.securityProfiles.find((s) => s.id === params.securityProfileId);
  if (sp) {
    sp.rating = parseFloat(avg.toFixed(1));
    sp.reviewCount = guardReviews.length;
  }

  await saveDatabase(db);
  return review;
}

// ================= NOTIFICATIONS =================

export async function getUserNotifications(userId: string) {
  const db = getDatabase();
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(notificationId: string) {
  const db = getDatabase();
  const notif = db.notifications.find((n) => n.id === notificationId);
  if (notif) {
    notif.isRead = true;
    await saveDatabase(db);
  }
}

// ================= ADMIN STATS =================

export async function getAdminMetrics() {
  const db = getDatabase();

  const totalClients = db.users.filter((u) => u.role === 'CLIENT').length;
  const totalPros = db.users.filter((u) => u.role === 'PROFESSIONAL').length;
  const approvedPros = db.securityProfiles.filter((s) => s.isVerified && s.isActive).length;
  const pendingApps = db.applications.filter(
    (a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
  ).length;
  const suspendedPros = db.securityProfiles.filter((s) => !s.isActive && s.isVerified).length;

  const totalBookings = db.bookings.length;
  const confirmedBookings = db.bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedBookings = db.bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalRevenueMZN = db.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPlatformFeesMZN = db.bookings.reduce((sum, b) => sum + b.platformFee, 0);

  return {
    totalClients,
    totalPros,
    approvedPros,
    pendingApps,
    suspendedPros,
    totalBookings,
    confirmedBookings,
    completedBookings,
    totalRevenueMZN,
    totalPlatformFeesMZN,
  };
}
