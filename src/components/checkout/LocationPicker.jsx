import React, { useEffect, useRef, useState } from 'react';

const LocationPicker = ({ isOpen, onClose, onSelect, initialAddress }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (isOpen && !mapInstanceRef.current && mapRef.current && !mapError) {
      setTimeout(() => {
        if (mapRef.current && !mapInstanceRef.current && window.L) {
          try {
            mapInstanceRef.current = window.L.map(mapRef.current).setView([5.6037, -0.1870], 13);

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            const LeafIcon = window.L.Icon.extend({
              options: {
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
              }
            });

            const customIcon = new LeafIcon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' });

            mapInstanceRef.current.on('click', async (e) => {
              const { lat, lng } = e.latlng;
              
              if (markerRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current);
              }

              markerRef.current = window.L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);

              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
                );
                const data = await response.json();
                
                if (data.address || data.display_name) {
                  const addr = data.address || {};
                  let placeName = data.display_name || '';
                  let shortAddress = '';
                  
                  const street = addr.road || addr.pedestrian || addr.footway || addr.highway || '';
                  const suburb = addr.neighbourhood || addr.suburb || addr.ward || '';
                  const city = addr.city || addr.town || addr.village || addr.municipality || '';
                  const region = addr.region || '';
                  
                  if (street && suburb) {
                    shortAddress = `${street}, ${suburb}`;
                  } else if (street) {
                    shortAddress = street;
                  } else {
                    shortAddress = placeName.split(',').slice(0, 2).join(', ');
                  }
                  
                  setSelectedLocation({
                    lat,
                    lng,
                    placeName: addr.amenity || addr.building || addr.shop || addr.tourism || addr.leisure || city || 'Selected Location',
                    shortAddress,
                    fullAddress: placeName,
                    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                  });
                  
                  markerRef.current.bindPopup(placeName.split(',')[0]).openPopup();
                }
              } catch (error) {
                console.error('Reverse geocoding failed:', error);
                setSelectedLocation({
                  lat,
                  lng,
                  placeName: 'Selected Location',
                  shortAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                  fullAddress: `${lat}, ${lng}`,
                  googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                });
              }
            });
          } catch (err) {
            console.error('Map initialization failed:', err);
            setMapError(true);
          }
        } else if (!window.L) {
          setMapError(true);
        }
      }, 200);
    }
  }, [isOpen, mapError]);

  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      setSelectedLocation(null);
      setSearchQuery('');
      setMapError(false);
    }
  }, [isOpen]);

  const handleSearch = () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Ghana')}&limit=1`)
      .then(res => res.json())
      .then(async (data) => {
        if (data && data.length > 0) {
          const result = data[0];
          const { lat, lon, display_name } = result;
          
          mapInstanceRef.current.setView([lat, lon], 16);
          
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }

          const LeafIcon = window.L.Icon.extend({
            options: {
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34]
            }
          });

          const customIcon = new LeafIcon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' });
          
          markerRef.current = window.L.marker([lat, lon], { icon: customIcon }).addTo(mapInstanceRef.current);
          markerRef.current.bindPopup(display_name.split(',')[0]).openPopup();

          const addr = result.address || {};
          const placeName = addr.amenity || addr.building || addr.shop || addr.tourism || addr.city || 'Location';
          
          setSelectedLocation({
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            placeName,
            shortAddress: display_name.split(',').slice(0, 2).join(', '),
            fullAddress: display_name,
            googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
          });
        }
      })
      .catch(console.error);
  };

  const openInGoogleMaps = () => {
    if (selectedLocation?.googleMapsUrl) {
      window.open(selectedLocation.googleMapsUrl, '_blank');
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.fullAddress, selectedLocation.placeName, selectedLocation.googleMapsUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
        onClick={onClose}
      />
      <div 
        className="fixed inset-4 lg:inset-10 z-[151] flex flex-col bg-charcoal-100 border border-ivory-100/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-charcoal-200/50 border-b border-ivory-100/10 p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-serif text-ivory-100">Select Delivery Location</h3>
            <p className="text-sm text-ivory-100/50">Search or click on the map to find the delivery address</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ivory-100/50 hover:text-ivory-100 hover:bg-charcoal-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-ivory-100/10 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for a location (e.g., East Legon, Accra Mall)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 pl-10 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300/50 placeholder-charcoal-400"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0">
          {mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-200/50 p-8 text-center">
              <div className="w-20 h-20 bg-charcoal-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-ivory-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h4 className="text-ivory-100 font-medium mb-2">Map could not load</h4>
              <p className="text-ivory-100/50 text-sm mb-4">You can still enter the address manually below</p>
            </div>
          ) : (
            <div ref={mapRef} className="absolute inset-0" />
          )}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="px-4 py-3 bg-charcoal-100/95 backdrop-blur-sm rounded-xl text-sm text-ivory-100/70 shadow-lg border border-ivory-100/10 flex items-center gap-2">
              <svg className="w-4 h-4 text-gold-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Click anywhere on the map to pin your delivery location</span>
            </div>
          </div>
        </div>

        {selectedLocation && (
          <div className="p-4 border-t border-ivory-100/10 bg-charcoal-200/30 flex-shrink-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ivory-100/50 text-xs uppercase tracking-wider mb-1">Selected Location</p>
                <p className="text-ivory-100 font-medium text-lg mb-1">{selectedLocation.placeName}</p>
                <p className="text-ivory-100/70 text-sm">{selectedLocation.shortAddress}</p>
                <p className="text-ivory-100/50 text-xs mt-1 truncate">{selectedLocation.fullAddress}</p>
              </div>
              <button
                onClick={openInGoogleMaps}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center gap-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Maps
              </button>
            </div>
          </div>
        )}

        <div className="p-4 bg-charcoal-200/50 border-t border-ivory-100/10 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:bg-charcoal-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="flex-1 py-3 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationPicker;
