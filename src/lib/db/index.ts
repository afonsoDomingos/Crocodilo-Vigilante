import fs from 'fs';
import path from 'path';
import {
  User,
  ClientProfile,
  SecurityProfile,
  Application,
  VerificationDocument,
  ServiceCategory,
  AvailabilitySchedule,
  BookingRequest,
  Booking,
  BookingAssignment,
  Review,
  Complaint,
  Notification,
  Payment,
  Invoice,
  AuditLog,
  PlatformSettings,
} from './types';
import { getInitialSeedData } from './seed';

export interface DatabaseSchema {
  users: User[];
  clientProfiles: ClientProfile[];
  securityProfiles: SecurityProfile[];
  applications: Application[];
  verificationDocuments: VerificationDocument[];
  serviceCategories: ServiceCategory[];
  availabilitySchedules: AvailabilitySchedule[];
  bookingRequests: BookingRequest[];
  bookings: Booking[];
  bookingAssignments: BookingAssignment[];
  reviews: Review[];
  complaints: Complaint[];
  notifications: Notification[];
  payments: Payment[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'crocodilo_db.json');

// In-memory cache + persistent file storage
let memoryDb: DatabaseSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function ensureDataDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function getDatabase(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content) as DatabaseSchema;
      return memoryDb;
    } catch (err) {
      console.error('Error reading db.json, generating default seed:', err);
    }
  }

  // Initialize with seed data
  const initial = getInitialSeedData();
  memoryDb = initial;
  saveDatabaseSync(initial);
  return memoryDb;
}

export function saveDatabase(data: DatabaseSchema): Promise<void> {
  memoryDb = data;
  ensureDataDirectory();
  
  // Chain writes sequentially to prevent file locking races
  writeQueue = writeQueue.then(async () => {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      await fs.promises.rename(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file asynchronously:', err);
    }
  });

  return writeQueue;
}

export function saveDatabaseSync(data: DatabaseSchema): void {
  memoryDb = data;
  ensureDataDirectory();
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database file synchronously:', err);
  }
}

/**
 * Resets database back to default seed data (useful for demos and automated testing)
 */
export async function resetDatabase(): Promise<DatabaseSchema> {
  const fresh = getInitialSeedData();
  await saveDatabase(fresh);
  return fresh;
}
