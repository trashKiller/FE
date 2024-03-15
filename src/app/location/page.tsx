"use client";

import Accordion from "@/components/accordion/accordion";
import { useEffect, useRef, useState } from "react";

export default function LocationPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    if (window.kakao) {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(37.4, 126.8),
          level: 3,
        };

        const map = new window.kakao.maps.Map(mapRef.current, options);

        map.setCopyrightPosition(
          window.kakao.maps.CopyrightPosition.BOTTOMRIGHT,
          true,
        );

        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
        });

        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: mapRef.current,
          averageCenter: true,
          minLevel: 7,
        });

        clusterer.addMarkers([]);
      });
    }
  }, []);

  return (
    <>
      <Accordion isOpen={isAccordionOpen} setIsOpen={setIsAccordionOpen}>
        {Array(30)
          .fill(0)
          .map((_, idx) => idx + 1)
          .map((idx) => (
            <div
              key={`${idx}`}
              className="h-20 bg-white border-2 border-dark-blue p-4"
            >
              {idx}
            </div>
          ))}
      </Accordion>
      <div
        ref={mapRef}
        className={
          isAccordionOpen
            ? "absolute z-0 top-0 h-screen duration-300 w-[calc(100%-20rem)] translate-x-[19.875rem] box-content"
            : "absolute z-0 top-0 h-screen duration-300 w-full box-content"
        }
      />
    </>
  );
}
