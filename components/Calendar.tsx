'use client'

import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enGB } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState } from 'react'

const locales = {
  'en-GB': enGB,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: {
    inspectionId?: string
    doorId?: string
    doorNumber: string
    location: string
    buildingName: string
    inspectionType: string
    status: string
    overallResult?: string
  }
}

interface CalendarProps {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  selectedEvents?: Set<string>
  multiSelectMode?: boolean
}

export default function Calendar({ events, onSelectEvent, selectedEvents, multiSelectMode }: CalendarProps) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6' // blue for upcoming
    const isSelected = selectedEvents?.has(event.id)

    if (event.resource?.status === 'COMPLETED') {
      if (event.resource?.overallResult === 'PASS') {
        backgroundColor = '#10b981' // green for passed
      } else if (event.resource?.overallResult === 'FAIL') {
        backgroundColor = '#ef4444' // red for failed
      } else if (event.resource?.overallResult === 'REQUIRES_ATTENTION') {
        backgroundColor = '#f59e0b' // orange for requires attention
      }
    } else if (event.resource?.status === 'PENDING') {
      backgroundColor = '#8b5cf6' // purple for pending
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: isSelected ? 1 : 0.9,
        color: 'white',
        border: isSelected ? '3px solid #000' : '0px',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 4px',
        cursor: multiSelectMode ? 'pointer' : 'default',
        fontWeight: isSelected ? 'bold' : 'normal'
      }
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] bg-white p-4 rounded-lg shadow">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={(newView) => setView(newView)}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        views={['month', 'week', 'day', 'agenda']}
        popup
        onSelectEvent={onSelectEvent}
        tooltipAccessor={(event) => {
          if (event.resource) {
            return `${event.title}\n${event.resource.doorNumber} - ${event.resource.location}\n${event.resource.buildingName}`
          }
          return event.title
        }}
      />
    </div>
  )
}
