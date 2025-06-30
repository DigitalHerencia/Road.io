import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

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
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

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
