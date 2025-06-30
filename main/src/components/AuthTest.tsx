'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTest() {
  const { isSignedIn, user } = useUser();
  const [apiResult, setApiResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const testProtectedAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/protected');
      const data = await response.json();
      setApiResult(data);
    } catch (error) {
      console.error('API call failed:', error);
      setApiResult({ error: 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  const testProtectedPOST = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/protected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello from authenticated user!',
          timestamp: new Date().toISOString()
        }),
      });
      const data = await response.json();
      setApiResult(data);
    } catch (error) {
      console.error('API call failed:', error);
      setApiResult({ error: 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Sign in to test protected API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to be signed in to test the authentication features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>
          Test protected API endpoints with your authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testProtectedAPI} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test GET /api/protected'}
          </Button>
          <Button 
            onClick={testProtectedPOST} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test POST /api/protected'}
          </Button>
        </div>
        
        {apiResult && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">API Response:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="font-medium text-blue-800">Current User Info:</h4>
          <p className="text-sm text-blue-600">
            <strong>User ID:</strong> {user?.id}
          </p>
          <p className="text-sm text-blue-600">
            <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
