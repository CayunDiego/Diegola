'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import { QrCodeSvg } from "./qr-code-svg"

export function QrModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan to Join</DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone to open the guest view and add songs to the playlist.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-white rounded-lg">
          <QrCodeSvg />
        </div>
      </DialogContent>
    </Dialog>
  )
}
