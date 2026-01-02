import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function getNextInspectionDate(lastInspection: Date, doorType: string): Date {
  const next = new Date(lastInspection)
  if (doorType === 'FLAT_ENTRANCE') {
    next.setMonth(next.getMonth() + 12)
  } else {
    next.setMonth(next.getMonth() + 3)
  }
  return next
}

export function isInspectionOverdue(nextDueDate: Date): boolean {
  return new Date() > nextDueDate
}

export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
