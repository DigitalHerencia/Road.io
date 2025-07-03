import React from "react"
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CookieBanner from '@/components/CookieBanner'

vi.mock('@/lib/actions/settings', () => ({
  acceptCookieConsent: vi.fn(async () => ({ success: true }))
}))

import { acceptCookieConsent } from '@/lib/actions/settings'
import '@testing-library/jest-dom'

describe('CookieBanner', () => {
  it('hides banner after acceptance', async () => {
    render(<CookieBanner />)
    expect(screen.getByText(/best experience/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /accept/i }))
    await waitFor(() => {
      expect(acceptCookieConsent).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByText(/best experience/i)).not.toBeInTheDocument()
    })
  })
})
