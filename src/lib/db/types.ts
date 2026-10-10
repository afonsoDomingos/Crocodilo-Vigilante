export type UserRole = 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClientType = 'INDIVIDUAL' | 'COMPANY';

export interface ClientProfile {
  id: string;
  userId: string;
  clientType: ClientType;
  companyName?: string;
  nuit?: string;
  representativeName?: string;
  address?: string;
  city: string;
  province: string;
  createdAt: string;
}

export interface SecurityProfile {
  id: string;
  userId: string;
  badgeNumber: string;
  bio: string;
  yearsExperience: number;
  skills: string[];
  categories: string[];
  city: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number; // in Mozambican Meticais (MZN)
  isVerified: boolean;
  isActive: boolean;
  isArmed: false; // Mandatory platform rule: Unarmed only
  birthDate?: string;
  idDocNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'NEEDS_CORRECTION'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface Application {
  id: string;
  securityProfileId: string;
  status: ApplicationStatus;
  adminNotes?: string;
  rejectionReason?: string;
  correctionDetails?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt: string;
}

export type DocumentType =
  | 'BI_DIRE'
  | 'CRIMINAL_RECORD'
  | 'SECURITY_CERTIFICATE'
  | 'RESIDENCE_PROOF';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface VerificationDocument {
  id: string;
  applicationId: string;
  docType: DocumentType;
  fileName: string;
  fileKey: string;
  fileSize: number;
  verificationStatus: VerificationStatus;
  expiresAt?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  isActive: boolean;
  displayOrder: number;
  targetAudiences: string[];
}

export interface AvailabilitySchedule {
  id: string;
  securityProfileId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "08:00"
  endTime: string;   // "18:00"
  isBlocked: boolean;
}

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PARTIALLY_ACCEPTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface BookingRequest {
  id: string;
  clientId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  numGuards: number;
  budget?: number;
  specificSkills: string[];
  status: BookingStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingRequestId: string;
  clientId: string;
  status: BookingStatus;
  totalAmount: number;
  platformFee: number;
  startedAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export type AssignmentStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';

export interface BookingAssignment {
  id: string;
  bookingId: string;
  securityProfileId: string;
  status: AssignmentStatus;
  checkInTime?: string;
  checkOutTime?: string;
  checkInNotes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  securityProfileId: string;
  ratingPunctuality: number;
  ratingProfessionalism: number;
  ratingGeneral: number;
  comment?: string;
  isModerated: boolean;
  createdAt: string;
}

export type ComplaintStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface Complaint {
  id: string;
  bookingId: string;
  reportedByUserId: string;
  targetUserId: string;
  reason: string;
  description: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  createdAt: string;
}

export type NotificationType = 'BOOKING' | 'APPLICATION' | 'SYSTEM' | 'REVIEW' | 'PAYMENT';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export type PaymentMethod = 'MPESA' | 'EMOLA' | 'BANK_TRANSFER' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  receiptUrl?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  bookingId: string;
  invoiceNumber: string;
  clientName: string;
  clientNuit?: string;
  totalAmount: number;
  taxAmount: number;
  issuedAt: string;
  itemsJson: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PlatformSettings {
  id: string;
  platformName: string;
  slogan: string;
  commissionPercent: number;
  serviceFeeFixed: number;
  supportEmail: string;
  supportPhone: string;
  termsUrl: string;
  privacyUrl: string;
}
