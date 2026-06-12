'use client'
import { useEffect, useRef } from 'react'

type Props = {
  lat?: number
  lng?: number
  driverLat?: number
  driverLng?: number
  restaurantLat?: number
  restaurantLng?: number
  interactive?: boolean
  height?: number
  onPick?: (lat: number, lng: number) => void
}

const DEFAULT = { lat: 36.8065, lng: 10.1815 }

export function DeliveryMap({
  lat = DEFAULT.lat,
  lng = DEFAULT.lng,
  driverLat, driverLng,
  restaurantLat, restaurantLng,
  interactive = false,
  height = 220,
  onPick,
}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !divRef.current || mapRef.current) return

    let mounted = true

    // Inject Leaflet CSS once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then(({ default: L }) => {
      if (!mounted || !divRef.current || mapRef.current) return

      // Fix default icon paths
      ;(L.Icon.Default as any).prototype._getIconUrl = undefined
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(divRef.current!, {
        center:           [lat, lng],
        zoom:             14,
        zoomControl:      interactive,
        scrollWheelZoom:  interactive,
        dragging:         interactive,
        attributionControl: false,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Delivery marker — orange
      L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#FF6B1A;border:3px solid #fff;box-shadow:0 0 10px rgba(255,107,26,.6)"></div>`,
          className: '', iconAnchor: [7, 7],
        }),
      }).addTo(map).bindPopup('<b>Adresse de livraison</b>')

      // Driver marker — green pulsing
      if (driverLat && driverLng) {
        L.marker([driverLat, driverLng], {
          icon: L.divIcon({
            html: `<div style="position:relative;width:20px;height:20px">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(52,211,153,.25);animation:ping 1.2s ease-out infinite"></div>
              <div style="position:absolute;inset:4px;border-radius:50%;background:#34D399;border:2px solid #fff"></div>
            </div>`,
            className: '', iconAnchor: [10, 10],
          }),
        }).addTo(map).bindPopup('<b>Livreur en route</b>')
      }

      // Restaurant marker — white square
      if (restaurantLat && restaurantLng) {
        L.marker([restaurantLat, restaurantLng], {
          icon: L.divIcon({
            html: `<div style="width:12px;height:12px;border-radius:3px;background:#fff;border:2px solid #FF6B1A"></div>`,
            className: '', iconAnchor: [6, 6],
          }),
        }).addTo(map).bindPopup('<b>Restaurant</b>')

        // Dashed route
        L.polyline(
          [[restaurantLat, restaurantLng], [driverLat ?? lat, driverLng ?? lng], [lat, lng]],
          { color: '#FF6B1A', weight: 2, dashArray: '8 6', opacity: 0.65 }
        ).addTo(map)
      }

      if (interactive && onPick) {
        map.on('click', (e: any) => onPick(e.latlng.lat, e.latlng.lng))
      }
    })

    return () => {
      mounted = false
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={divRef}
      style={{ height, borderRadius: 12, overflow: 'hidden', background: '#0f0f0f' }}
      className="w-full"
    />
  )
}
