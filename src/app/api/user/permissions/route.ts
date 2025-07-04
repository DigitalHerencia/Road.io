import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/rbac';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      permissions: user.permissions,
      organization: {
        id: user.orgId,
        name: user.organizationName,
        slug: user.organizationSlug,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
