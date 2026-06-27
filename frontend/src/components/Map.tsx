"use client";
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TeacherLocation {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  specialty: string;
}

export default function Map({ teachers }: { teachers: TeacherLocation[] }) {
  // Default center (Luanda)
  const center: [number, number] = [-8.839988, 13.289437];

  return (
    <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-lg border border-slate-200 z-0">
      <MapContainer center={center} zoom={11} className="h-full w-full relative z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {teachers.map((teacher) => (
          <Marker key={teacher.id} position={[teacher.lat, teacher.lng]}>
            <Popup>
              <div className="font-bold text-slate-800 text-sm">{teacher.name}</div>
              <div className="text-primary text-xs font-bold mt-1">{teacher.specialty}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
