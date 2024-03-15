import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./index.css";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Button from "./Button";

const App = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  const [map, setMap] = useState(/**@type google.maps.Map*/ null);
  const [androidLocation, setAndroidLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  const locationMarker = useRef([]);
  const androidMarker = useRef([]);

  const [center, setCenter] = useState({
    lat: 1.2882,
    lng: 103.859,
  });

  function animateMapZoomTo(map, targetZoom) {
    var currentZoom = arguments[2] || map.getZoom();
    if (currentZoom != targetZoom) {
      google.maps.event.addListenerOnce(map, "zoom_changed", function (event) {
        animateMapZoomTo(
          map,
          targetZoom,
          currentZoom + (targetZoom > currentZoom ? 1 : -1)
        );
      });
      setTimeout(function () {
        map.setZoom(currentZoom);
      }, 80);
    }
  }

  const goToCurrentLocation = () => {
    // remove previous location marker
    for (let i = 0; i < locationMarker.current.length; i++) {
      locationMarker.current[i].setMap(null);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const infoWindow = new google.maps.InfoWindow();
        const marker = new google.maps.Marker({
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          map: map,
          label: "CurLocation",
          optimized: false,
        });
        marker.addListener("click", () => {
          const contentString = `
            <div>
              <p>You are here: (${position.coords.latitude}, ${position.coords.longitude})</p>
              <a href="https://www.google.com/maps/search/?api=1&query=${position.coords.latitude}%2C${position.coords.longitude}" target="_blank">Click to see on Google Maps</a>
            </div>
          `;
          infoWindow.setContent(contentString);
          infoWindow.open(marker.getMap(), marker);
        });

        locationMarker.current.push(marker);

        map.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        animateMapZoomTo(map, 14);
      });
    }
  };

  const goToAndroidLocation = () => {
    // remove previous android marker
    for (let i = 0; i < androidMarker.current.length; i++) {
      androidMarker.current[i].setMap(null);
    }
    if (androidLocation !== null) {
      const infoWindow = new google.maps.InfoWindow();
      const marker = new google.maps.Marker({
        position: {
          lat: androidLocation.latitude,
          lng: androidLocation.longitude,
        },
        map: map,
        label: "AndroidLocation",
        optimized: false,
      });
      marker.addListener("click", () => {
        const contentString = `
        <div>
          <p>Android Location: (${androidLocation.latitude}, ${androidLocation.longitude}). Timestamp: ${androidLocation.timestamp}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${androidLocation.latitude}%2C${androidLocation.longitude}" target="_blank">Click to see on Google Maps</a>
        </div>
      `;
        infoWindow.setContent(contentString);
        infoWindow.open(marker.getMap(), marker);
      });
      androidMarker.current.push(marker);
      map.panTo({
        lat: androidLocation.latitude,
        lng: androidLocation.longitude,
      });
      animateMapZoomTo(map, 14);
    } else {
      alert("No location data available");
    }
  };

  // useEffect(() => {
  //   const newSocket = new WebSocket(
  //     "ws://express-server-production-04ab.up.railway.app/"
  //   );

  //   newSocket.onopen = () => {
  //     console.log("WebSocket connected");
  //   };

  //   newSocket.onclose = () => {
  //     console.log("WebSocket disconnected");
  //   };

  //   newSocket.onmessage = (event) => {
  //     console.log("Message received from server:", event.data);
  //     let data = JSON.parse(event.data);
  //     data = JSON.parse(data);
  //     setAndroidLocation(data);
  //   };

  //   setSocket(newSocket);

  //   // Cleanup function to close the WebSocket connection when the component unmounts
  //   return () => {
  //     newSocket.close();
  //   };
  // }, []);

  return (
    <div className="max-w-screen h-full overflow-hidden">
      <div className="absolute w-full flex justify-center items-center overflow-hidden">
        <div
          id="floatingMenuBar"
          className="z-10 mt-1 w-[400px] h-14 bg-white relative shadow-xl rounded-md p-2 flex justify-around items-center opacity-85"
        >
          <Button onClick={goToCurrentLocation} text={"Curr Location"} />
          <Button onClick={goToAndroidLocation} text={"Android Location"} />
        </div>
      </div>

      {isLoaded && (
        <GoogleMap
          mapContainerClassName="w-full h-full overflow-hidden"
          center={center}
          zoom={11}
          onLoad={(map) => setMap(map)} // allows us to use the map instance
          onUnmount={() => setMap(null)}
        ></GoogleMap>
      )}
    </div>
  );
};

export default App;
