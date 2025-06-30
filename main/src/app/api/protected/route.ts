import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This is a protected route - only authenticated users can access
    return NextResponse.json({
      success: true,
      message: 'Successfully accessed protected route',
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in protected route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Example of processing authenticated user data
    return NextResponse.json({
      success: true,
      message: 'Data processed successfully',
      userId,
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing authenticated request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
