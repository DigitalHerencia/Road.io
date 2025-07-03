import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
})

export async function GET() {
  try {
    // Test database connection by fetching all users
    const allUsers = await db.select().from(users);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      users: allUsers,
      count: allUsers.length
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const { email, name } = userSchema.parse(raw);

    // Insert a new user
    // clerkUserId is required, so provide a placeholder or generate one
    const [newUser] = await db.insert(users).values({
      clerkUserId: 'test-' + Date.now(), // or use a real value if available
      email, 
      name 
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
