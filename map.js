
let _map = null;
let _userMarker = null;
let _userCircle = null;

export function initMap() {
  if (typeof window === 'undefined') return null;
  // if Leaflet isn't loaded yet, try to require it from window
  const L = window.L;
  if (!L) {
    console.warn('Leaflet not loaded (window.L is undefined).');
    return null;
  }

  if (_map) {
    _map.invalidateSize();
    return _map;
  }

  const mapEl = document.getElementById('app-map');
  if (!mapEl) return null;

  _map = L.map(mapEl).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(_map);
  // Add a locate control (Find me) to trigger geolocation on demand
  let _locateControl = null;

  const locateAndMark = () => {
    if (!navigator || !navigator.geolocation) {
      console.info('Geolocation not available in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          _map.setView([lat, lng], 13);

          if (_userMarker) _map.removeLayer(_userMarker);
          if (_userCircle) _map.removeLayer(_userCircle);

          _userMarker = L.marker([lat, lng]).addTo(_map).bindPopup('You are here').openPopup();
          _userCircle = L.circle([lat, lng], { radius: Math.max(pos.coords.accuracy || 50, 20), color: '#007bff', fillOpacity: 0.12 }).addTo(_map);
        } catch (e) {
          console.warn('Error centering map on user location', e);
        }
      },
      (err) => {
        console.info('Geolocation failed or permission denied', err && err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // create a compact Leaflet control button
  if (!_locateControl) {
    _locateControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-locate');
        const a = L.DomUtil.create('a', '', container);
        a.href = '#';
        a.title = 'Find my location';
        a.innerHTML = '📍';
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(a, 'click', L.DomEvent.stop).on(a, 'click', (e) => {
          locateAndMark();
        });
        return container;
      }
    });
    try {
      new _locateControl().addTo(_map);
    } catch (e) {
      console.warn('Could not add locate control', e);
    }
  }

  return _map;
}

export function destroyMap() {
  if (_map) {
    _map.remove();
    _map = null;
  }
}
