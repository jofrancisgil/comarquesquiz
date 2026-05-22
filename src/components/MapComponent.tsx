import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GameStatus } from '../types/game';
import L from 'leaflet';

interface MapComponentProps {
  geoData: any;
  currentTargetId: string | null;
  selectedId: string | null;
  status: GameStatus;
}

const CENTER: L.LatLngTuple = [41.8205, 1.6677]; // Approximate center of Catalonia
const ZOOM = 8;

export function MapComponent({ geoData, currentTargetId, selectedId, status }: MapComponentProps) {
  
  // Style function applied to every feature in the GeoJSON
  const getFeatureStyle = (feature: any) => {
    const isTarget = feature.id === currentTargetId;
    const isAnswering = status === 'answering';
    
    // Default neutral styling for non-targets matching the target design
    const baseStyle: L.PathOptions = {
        fillColor: '#e2e8f0', // neutral-200
        weight: 1.5,
        opacity: 0.8,
        color: '#94a3b8', // neutral-400
        fillOpacity: 0.8,
        dashArray: 'none',
        className: 'transition-all duration-300'
    };

    if (!isTarget && !isAnswering) {
       return baseStyle;
    }

    if (isAnswering && selectedId !== null) {
      const isCorrect = selectedId === currentTargetId;
      
      // Target feature should always light up yellow when revealed/answered
      if (feature.id === currentTargetId) {
        return {
          fillColor: '#facc15', // yellow-400
          weight: 4,
          opacity: 1,
          color: '#eab308', // yellow-500
          fillOpacity: 0.9,
          className: 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-300 z-50'
        };
      }
      
      // If the user clicked the WRONG feature, light that feature up red
      if (feature.id === selectedId && !isCorrect) {
        return {
          fillColor: '#f87171', // red-400
          weight: 3,
          opacity: 1,
          color: '#ef4444', // red-500
          fillOpacity: 0.9,
          className: 'transition-all duration-300'
        };
      }
      
      // Other features remain muted
      return {
        ...baseStyle,
        fillOpacity: 0.4
      };
    } else if (isTarget) {
      // Highlight the target being asked in yellow
      return {
        fillColor: '#facc15', // yellow-400
        weight: 4,
        opacity: 1,
        color: '#eab308', // yellow-500
        fillOpacity: 0.9,
        className: 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-300 z-50'
      };
    }
    
    return baseStyle;
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
      // We don't bind tooltips so the names remain hidden!
  };

  const geoKey = useMemo(() => {
    return `geo-${currentTargetId}-${status}-${selectedId}`;
  }, [currentTargetId, status, selectedId]);

  return (
    <div className="w-full h-full relative">
      {/* Grid Pattern overlay for the Map container background directly behind it */}
      <div 
        className="absolute inset-0 z-0 bg-neutral-100" 
        style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        minZoom={7}
        maxZoom={11}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        className="w-full h-full bg-transparent z-10"
      >
        {geoData && (
          <GeoJSON 
            key={geoKey}
            data={geoData} 
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
            interactive={false} // Prevents hovering cursors on paths
          />
        )}
      </MapContainer>
    </div>
  );
}
