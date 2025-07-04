'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  listUsersAction,
  createUserAction,
  testDbConnectionAction,
} from '@/lib/actions/dev'

interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function DatabaseTest() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsersAction()
      if (data.success) {
        setUsers(data.users)
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    if (!newUserEmail) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await createUserAction({
        email: newUserEmail,
        name: newUserName || undefined,
      })
      if (data.success) {
        setNewUserEmail('')
        setNewUserName('')
        await fetchUsers()
      } else {
        setError(data.message ?? 'Failed to create user')
      }
    } catch (err) {
      console.error('Error creating user:', err)
      setError('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await testDbConnectionAction()
      if (data.success) {
        setUsers(data.users)
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      console.error('Database connection error:', err)
      setError('Database connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Test the Neon PostgreSQL database connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={fetchUsers} variant="outline" disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Users'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium">Users ({users.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="text-sm p-2 bg-gray-50 rounded">
                    <strong>{user.name || 'No name'}</strong> - {user.email}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>
            Add a new user to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email *</Label>
            <Input
              id="userEmail"
              type="email"
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userName">Name (optional)</Label>
            <Input
              id="userName"
              placeholder="John Doe"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
          </div>
          <Button onClick={createUser} className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
