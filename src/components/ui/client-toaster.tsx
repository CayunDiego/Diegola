"use client"

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";

/**
 * A wrapper for the Toaster component that ensures it is only rendered on the client side.
 * This prevents hydration errors with Next.js App Router.
 */
export function ClientToaster() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the Toaster only on the client side
  return isClient ? <Toaster /> : null;
}
