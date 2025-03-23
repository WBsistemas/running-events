import React from 'react'
import MapLibreMap from './MapLibreMap'
interface Event {
  id: string
  title: string
  location: string
  date: string
  distance: string
  imageUrl: string
  latitude?: number
  longitude?: number
  eventType?: string
  price?: string
}
interface EventMapProps {
  events?: Event[]
  onEventClick?: (eventId: string) => void
}
function EventMap ({ events = [], onEventClick = () => {} }: EventMapProps) {
  return <MapLibreMap events={events} onEventClick={onEventClick} />
}
export default EventMap
