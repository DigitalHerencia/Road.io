'use client';

import { UserButton, useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function AuthSection() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {isSignedIn ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
                <div>
                  <p className="font-medium">Welcome back!</p>
                  <p className="text-sm text-muted-foreground">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Go to Dashboard →
                </Button>
              </Link>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {user.fullName || 'Not provided'}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div>
              <h3 className="font-medium">Authentication Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to access all features including the protected dashboard
              </p>
            </div>
            <SignInButton mode="modal">
              <Button className="w-full">
                Sign In with Clerk
              </Button>
            </SignInButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
