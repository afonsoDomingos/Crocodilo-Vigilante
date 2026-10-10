import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const db = getDatabase();
  const categories = db.serviceCategories
    .filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  return NextResponse.json({ categories });
}
