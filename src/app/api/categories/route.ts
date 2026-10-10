import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ServiceCategoryModel } from '@/lib/db/models';
import { seedDatabaseIfEmpty } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    await seedDatabaseIfEmpty();
    const categories = await ServiceCategoryModel.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();
    return NextResponse.json({ categories: categories.map((c) => ({ ...c, id: c._id })) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [] });
  }
}
