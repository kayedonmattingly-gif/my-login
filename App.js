import React, { useState, useEffect } from 'react';
import './App.css';
import './map.css';
import { initMap, destroyMap } from './map';
import logo from './logo.svg';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [brandSrc, setBrandSrc] = useState(logo);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  useEffect(() => {
    if (loggedIn) {
      // initialize the leaflet map after the map container exists in the DOM
      const maybeMap = initMap();
      // small timeout to ensure container size is correct
      setTimeout(() => maybeMap && maybeMap.invalidateSize(), 250);
      return () => {
        destroyMap();
      };
    }
    
    return undefined;
  }, [loggedIn]);

  // Try to load a Midway logo from public folder at runtime. If present, use it.
  useEffect(() => {
    const publicPath = process.env.PUBLIC_URL || '';
    const candidates = [
      `${publicPath}/image/midwaylogo.PNG`,
      `${publicPath}/image/midwaylogo.png`,
      `${publicPath}/midwaylogo.PNG`,
      `${publicPath}/midwaylogo.png`
    ];

    let mounted = true;
    const tryLoad = (index) => {
      if (!mounted) return;
      if (index >= candidates.length) {
        setBrandSrc(logo);
        return;
      }
      const candidate = candidates[index];
      const img = new Image();
      img.onload = () => {
        if (mounted) setBrandSrc(candidate);
      };
      img.onerror = () => tryLoad(index + 1);
      img.src = candidate;
    };

    tryLoad(0);
    return () => { mounted = false; };
  }, []);

  return (
    <div className="app-root">
      <div className="phone-shell">
        <div className="phone-screen">
          {loggedIn ? (
            <div className="map-frame">
              <div className="map-topbar">
                <button className="btn-logout" onClick={() => setLoggedIn(false)}>Logout</button>
              </div>
              <div id="app-map" />
            </div>
          ) : (
            <>
              <div className="brand">
                <img src={brandSrc} alt="logo" />
              </div>

              <h1 className="title">Welcome to CSE-410</h1>

              <form className="login-card" onSubmit={handleSubmit}>
                <label className="field-label">Username</label>
                <input className="field" defaultValue="Mobile Computing" />

                <label className="field-label">Password</label>
                <input className="field" type="password" defaultValue="cse410" />

                <button className="btn-primary">Login</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
