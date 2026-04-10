import React, { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../utils/currency';

const LocationPicker = ({ isOpen, onClose, onSelect, initialAddress }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && !mapInstanceRef.current && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current && !mapInstanceRef.current) {
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
              
              if (data.address) {
                const addr = data.address;
                const parts = [];
                if (addr.road || addr.pedestrian || addr.footway) parts.push(addr.road || addr.pedestrian || addr.footway);
                if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
                if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
                if (addr.region) parts.push(addr.region);
                
                const fullAddress = parts.join(', ');
                setSelectedAddress(fullAddress);
                
                markerRef.current.bindPopup(fullAddress).openPopup();
              }
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
              setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          });
        }
      }, 100);
    }

    return () => {
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      setSelectedAddress('');
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedAddress) {
      onSelect(selectedAddress);
      onClose();
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Ghana')}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
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
          markerRef.current.bindPopup(data[0].display_name).openPopup();
          setSelectedAddress(data[0].display_name);
        }
      })
      .catch(console.error);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[151] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-charcoal-100 border border-ivory-100/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-charcoal-200/50 border-b border-ivory-100/10 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif text-ivory-100">Select Delivery Location</h3>
              <p className="text-sm text-ivory-100/50">Click on the map or search for your address</p>
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

          <div className="p-4 border-b border-ivory-100/10">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for a location in Ghana..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 pl-10 bg-charcoal-200/50 border border-ivory-100/10 text-ivory-100 rounded-xl focus:outline-none focus:border-gold-300/50"
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

          <div className="relative" style={{ height: '400px' }}>
            <div ref={mapRef} className="w-full h-full" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
              <div className="px-4 py-2 bg-charcoal-100/90 backdrop-blur-sm rounded-xl text-sm text-ivory-100/70 shadow-lg border border-ivory-100/10">
                <span className="text-gold-300 mr-2">✦</span>
                Click anywhere on the map to select your location
              </div>
            </div>
          </div>

          {selectedAddress && (
            <div className="p-4 border-t border-ivory-100/10 bg-charcoal-200/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ivory-100/50 mb-1">Selected Location:</p>
                  <p className="text-ivory-100">{selectedAddress}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-charcoal-200/50 border-t border-ivory-100/10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-ivory-100/20 text-ivory-100/70 rounded-xl hover:bg-charcoal-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedAddress}
              className="flex-1 py-3 bg-gold-300 text-charcoal-300 rounded-xl hover:bg-gold-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationPicker;
