/**
 * Mongoose Models — espelho dos tipos em types.ts
 * Todos os schemas são definidos aqui para serem importados pelas APIs.
 * Usa Schema<T, Model<T>> sem extends Document para evitar conflito de _id: string vs ObjectId
 */
import { Schema, model, models } from 'mongoose';

// ============================================================
// USER
// ============================================================
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['CLIENT', 'PROFESSIONAL', 'ADMIN'], required: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'PENDING' },
    avatarUrl: String,
  },
  { timestamps: true, _id: false }
);

export const UserModel = models.User || model<IUser>('User', UserSchema);

// ============================================================
// CLIENT PROFILE
// ============================================================
export interface IClientProfile {
  _id: string;
  userId: string;
  clientType: 'INDIVIDUAL' | 'COMPANY';
  companyName?: string;
  nuit?: string;
  representativeName?: string;
  address?: string;
  city: string;
  province: string;
  createdAt?: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    clientType: { type: String, enum: ['INDIVIDUAL', 'COMPANY'], required: true },
    companyName: String,
    nuit: String,
    representativeName: String,
    address: String,
    city: { type: String, required: true, default: 'Maputo' },
    province: { type: String, required: true, default: 'Moçambique' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const ClientProfileModel =
  models.ClientProfile || model<IClientProfile>('ClientProfile', ClientProfileSchema);

// ============================================================
// SECURITY PROFILE
// ============================================================
export interface ISecurityProfile {
  _id: string;
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
  hourlyRate: number;
  isVerified: boolean;
  isActive: boolean;
  isArmed: boolean;
  birthDate?: string;
  idDocNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: Date;
}

const SecurityProfileSchema = new Schema<ISecurityProfile>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    badgeNumber: { type: String, default: 'PENDING' },
    bio: { type: String, default: '' },
    yearsExperience: { type: Number, default: 0 },
    skills: [String],
    categories: [String],
    city: { type: String, default: 'Maputo' },
    neighborhood: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 300 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isArmed: { type: Boolean, default: false },
    birthDate: String,
    idDocNumber: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const SecurityProfileModel =
  models.SecurityProfile || model<ISecurityProfile>('SecurityProfile', SecurityProfileSchema);

// ============================================================
// APPLICATION
// ============================================================
export interface IApplication {
  _id: string;
  securityProfileId: string;
  status: 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'NEEDS_CORRECTION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  adminNotes?: string;
  rejectionReason?: string;
  correctionDetails?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt?: Date;
  createdAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    _id: { type: String, required: true },
    securityProfileId: { type: String, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'UNDER_REVIEW', 'NEEDS_CORRECTION', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'DRAFT',
    },
    adminNotes: String,
    rejectionReason: String,
    correctionDetails: String,
    reviewedBy: String,
    reviewedAt: Date,
    submittedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const ApplicationModel =
  models.Application || model<IApplication>('Application', ApplicationSchema);

// ============================================================
// VERIFICATION DOCUMENT
// ============================================================
export interface IVerificationDocument {
  _id: string;
  applicationId: string;
  docType: 'BI_DIRE' | 'CRIMINAL_RECORD' | 'SECURITY_CERTIFICATE' | 'RESIDENCE_PROOF';
  fileName: string;
  fileKey: string;
  fileSize: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  expiresAt?: string;
  adminNotes?: string;
  createdAt?: Date;
}

const VerificationDocumentSchema = new Schema<IVerificationDocument>(
  {
    _id: { type: String, required: true },
    applicationId: { type: String, required: true },
    docType: {
      type: String,
      enum: ['BI_DIRE', 'CRIMINAL_RECORD', 'SECURITY_CERTIFICATE', 'RESIDENCE_PROOF'],
      required: true,
    },
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileSize: { type: Number, required: true },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    expiresAt: String,
    adminNotes: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const VerificationDocumentModel =
  models.VerificationDocument ||
  model<IVerificationDocument>('VerificationDocument', VerificationDocumentSchema);

// ============================================================
// SERVICE CATEGORY
// ============================================================
export interface IServiceCategory {
  _id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  isActive: boolean;
  displayOrder: number;
  targetAudiences: string[];
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    iconName: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    targetAudiences: [String],
  },
  { _id: false }
);

export const ServiceCategoryModel =
  models.ServiceCategory || model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);

// ============================================================
// BOOKING REQUEST
// ============================================================
export interface IBookingRequest {
  _id: string;
  clientId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  numGuards: number;
  budget?: number;
  specificSkills: string[];
  status: string;
  createdAt?: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    _id: { type: String, required: true },
    clientId: { type: String, required: true },
    categoryId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    city: String,
    neighborhood: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    numGuards: { type: Number, default: 1 },
    budget: Number,
    specificSkills: [String],
    status: { type: String, default: 'PENDING' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const BookingRequestModel =
  models.BookingRequest || model<IBookingRequest>('BookingRequest', BookingRequestSchema);

// ============================================================
// BOOKING
// ============================================================
export interface IBooking {
  _id: string;
  bookingRequestId: string;
  clientId: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  startedAt?: Date;
  completedAt?: Date;
  cancellationReason?: string;
  createdAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    _id: { type: String, required: true },
    bookingRequestId: { type: String, required: true },
    clientId: { type: String, required: true },
    status: { type: String, default: 'PENDING' },
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    startedAt: Date,
    completedAt: Date,
    cancellationReason: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const BookingModel = models.Booking || model<IBooking>('Booking', BookingSchema);

// ============================================================
// BOOKING ASSIGNMENT
// ============================================================
export interface IBookingAssignment {
  _id: string;
  bookingId: string;
  securityProfileId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInNotes?: string;
  createdAt?: Date;
}

const BookingAssignmentSchema = new Schema<IBookingAssignment>(
  {
    _id: { type: String, required: true },
    bookingId: { type: String, required: true },
    securityProfileId: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED'], default: 'PENDING' },
    checkInTime: Date,
    checkOutTime: Date,
    checkInNotes: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const BookingAssignmentModel =
  models.BookingAssignment || model<IBookingAssignment>('BookingAssignment', BookingAssignmentSchema);

// ============================================================
// REVIEW
// ============================================================
export interface IReview {
  _id: string;
  bookingId: string;
  clientId: string;
  securityProfileId: string;
  ratingPunctuality: number;
  ratingProfessionalism: number;
  ratingGeneral: number;
  comment?: string;
  isModerated: boolean;
  createdAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    _id: { type: String, required: true },
    bookingId: { type: String, required: true },
    clientId: { type: String, required: true },
    securityProfileId: { type: String, required: true },
    ratingPunctuality: { type: Number, required: true },
    ratingProfessionalism: { type: Number, required: true },
    ratingGeneral: { type: Number, required: true },
    comment: String,
    isModerated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const ReviewModel = models.Review || model<IReview>('Review', ReviewSchema);

// ============================================================
// NOTIFICATION
// ============================================================
export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'APPLICATION' | 'SYSTEM' | 'REVIEW' | 'PAYMENT';
  isRead: boolean;
  linkUrl?: string;
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['BOOKING', 'APPLICATION', 'SYSTEM', 'REVIEW', 'PAYMENT'], required: true },
    isRead: { type: Boolean, default: false },
    linkUrl: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const NotificationModel =
  models.Notification || model<INotification>('Notification', NotificationSchema);

// ============================================================
// PAYMENT
// ============================================================
export interface IPayment {
  _id: string;
  bookingId: string;
  amount: number;
  method: 'MPESA' | 'EMOLA' | 'BANK_TRANSFER' | 'MANUAL';
  reference: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  receiptUrl?: string;
  paidAt?: Date;
  createdAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    _id: { type: String, required: true },
    bookingId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['MPESA', 'EMOLA', 'BANK_TRANSFER', 'MANUAL'], required: true },
    reference: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    receiptUrl: String,
    paidAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const PaymentModel = models.Payment || model<IPayment>('Payment', PaymentSchema);

// ============================================================
// AUDIT LOG
// ============================================================
export interface IAuditLog {
  _id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt?: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String, required: true },
    actorUserId: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    details: String,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

export const AuditLogModel = models.AuditLog || model<IAuditLog>('AuditLog', AuditLogSchema);

// ============================================================
// PLATFORM SETTINGS (single document)
// ============================================================
export interface IPlatformSettings {
  _id: string;
  platformName: string;
  slogan: string;
  commissionPercent: number;
  serviceFeeFixed: number;
  supportEmail: string;
  supportPhone: string;
  termsUrl: string;
  privacyUrl: string;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    _id: { type: String, required: true },
    platformName: String,
    slogan: String,
    commissionPercent: { type: Number, default: 10 },
    serviceFeeFixed: { type: Number, default: 150 },
    supportEmail: String,
    supportPhone: String,
    termsUrl: String,
    privacyUrl: String,
  },
  { _id: false }
);

export const PlatformSettingsModel =
  models.PlatformSettings || model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
