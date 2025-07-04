"use client"
import React from "react"

import { useState, useTransition } from 'react'
import { acceptCookieConsent } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CookieBanner() {
  const [visible, setVisible] = useState(true)
  const [pending, startTransition] = useTransition()

  const accept = () => {
    startTransition(async () => {
      await acceptCookieConsent()
      setVisible(false)
    })
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-center text-sm md:text-left">
            We use cookies to ensure you get the best experience on our website.
          </p>
          <Button onClick={accept} disabled={pending} size="sm">
            Accept
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
