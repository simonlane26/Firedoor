'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard')
      } else {
        fetchUsers()
      }
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage({ type: 'error', text: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingUserId(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      setMessage({ type: 'success', text: 'User deleted successfully' })
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to delete user' })
    } finally {
      setDeletingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return <Badge className="bg-red-600">Administrator</Badge>
    }
    if (role === 'MANAGER_RESPONSIBLE_PERSON' || role === 'MANAGER') {
      return <Badge className="bg-blue-600">Manager / Responsible Person</Badge>
    }
    if (role === 'HOUSING_OFFICER') {
      return <Badge className="bg-green-600">Housing Officer</Badge>
    }
    if (role === 'AUDITOR') {
      return <Badge className="bg-purple-600">Auditor</Badge>
    }
    return <Badge className="bg-slate-600">Inspector</Badge>
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.user.name}</span>
            <Badge variant="outline">{session.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-2">Manage users and their roles</p>
          </div>
          <Link href="/settings/users/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New User
            </Button>
          </Link>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
            <CardDescription>Users in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-slate-500 mb-4">No users found</p>
                <Link href="/settings/users/new">
                  <Button className="bg-red-600 hover:bg-red-700">Add First User</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{user.name}</span>
                          {user.id === session.user.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Created {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(user.role)}
                      {user.id !== session.user.id && (
                        <div className="flex gap-2">
                          <Link href={`/settings/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Understanding user permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-red-600 mt-1">Admin</Badge>
              <div className="flex-1">
                <div className="font-semibold mb-1">Administrator</div>
                <div className="text-sm text-slate-600">
                  Full system access including user management, tenant settings, branding, and all data operations
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-600 mt-1">Manager</Badge>
              <div className="flex-1">
                <div className="font-semibold mb-1">Manager</div>
                <div className="text-sm text-slate-600">
                  Can manage buildings, doors, inspections, and reports. Can import/export data. Cannot modify settings or manage users.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-slate-600 mt-1">Inspector</Badge>
              <div className="flex-1">
                <div className="font-semibold mb-1">Inspector</div>
                <div className="text-sm text-slate-600">
                  Can record inspections and view assigned doors. Can export data. Cannot import data or modify settings.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
