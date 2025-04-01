// components/LocationPicker.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const FlyToLocation = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [lat, lng, map]);

  return null;
};

const LocationPicker = ({ lat, lng, onSelect }) => {
  const defaultPosition = [51.505, -0.09];
  const center = lat && lng ? [lat, lng] : defaultPosition;

  return (
    <div className="h-72 w-full rounded overflow-hidden mb-4">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToLocation lat={lat} lng={lng} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
