import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthSection from '@/components/AuthSection'
import React from 'react'

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  UserButton: () => <div>User</div>,
  SignInButton: ({ children }: { children: React.ReactNode }) => <div data-signin>{children}</div>,
}))

import { useUser } from '@clerk/nextjs'
import '@testing-library/jest-dom'

describe('AuthSection component', () => {
  it('renders sign in prompt when not signed in', () => {
    vi.mocked(useUser).mockReturnValue({ isSignedIn: false, isLoaded: true } as any)
    render(<AuthSection />)
    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
  })

  it('shows user info when signed in', () => {
    vi.mocked(useUser).mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      user: { id: '1', fullName: 'Tester', emailAddresses: [{ emailAddress: 't@example.com' }], createdAt: Date.now() },
    } as any)
    render(<AuthSection />)
    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    expect(screen.getByText('t@example.com')).toBeInTheDocument()
  })
})
