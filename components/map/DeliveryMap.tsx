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
  onPick?: (lat: number, lng: number) => void
}

// Tunis center as default
const DEFAULT_LAT = 36.8065
const DEFAULT_LNG = 10.1815

export function DeliveryMap({
  lat = DEFAULT_LAT,
  lng = DEFAULT_LNG,
  driverLat,
  driverLng,
  restaurantLat,
  restaurantLng,
  interactive = false,
  onPick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return

    import('leaflet').then(L => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(ref.current!, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        attributionControl: false,
      })

      mapRef.current = map

      // Dark tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map)

      // Customer marker (orange)
      const orangeIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#FF6B1A;border:3px solid #fff;box-shadow:0 0 10px rgba(255,107,26,0.7)"></div>`,
        className: '',
        iconAnchor: [7, 7],
      })
      L.marker([lat, lng], { icon: orangeIcon }).addTo(map)
        .bindPopup('<b>Adresse de livraison</b>')

      // Driver marker (green pulsing)
      if (driverLat && driverLng) {
        const driverIcon = L.divIcon({
          html: `
            <div style="position:relative;width:20px;height:20px">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(52,211,153,0.3);animation:ping 1.2s ease-out infinite"></div>
              <div style="position:absolute;inset:4px;border-radius:50%;background:#34D399;border:2px solid #fff"></div>
            </div>`,
          className: '',
          iconAnchor: [10, 10],
        })
        L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map)
          .bindPopup('<b>Livreur</b>')
      }

      // Restaurant marker (white)
      if (restaurantLat && restaurantLng) {
        const restIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:3px;background:#fff;border:2px solid #FF6B1A;box-shadow:0 0 8px rgba(255,255,255,0.4)"></div>`,
          className: '',
          iconAnchor: [6, 6],
        })
        L.marker([restaurantLat, restaurantLng], { icon: restIcon }).addTo(map)
          .bindPopup('<b>Restaurant</b>')

        // Draw dashed route
        L.polyline(
          [[restaurantLat, restaurantLng], [driverLat || lat, driverLng || lng], [lat, lng]],
          { color: '#FF6B1A', weight: 2, dashArray: '8 6', opacity: 0.7 }
        ).addTo(map)
      }

      // Click to pick address
      if (interactive && onPick) {
        map.on('click', (e: any) => {
          onPick(e.latlng.lat, e.latlng.lng)
        })
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div
      ref={ref}
      className="h-full w-full leaflet-container"
      style={{ minHeight: 220, borderRadius: 12 }}
    />
  )
}
