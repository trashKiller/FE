"use client";

import Accordion from "@/components/accordion/accordion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface TrashCan {
  lat: number;
  lng: number;
  status: "added" | "waiting" | "removed";
  image?: string;
  description?: string;
}

const randomLatLng = () =>
  // 서울의 위도 경도 범위
  Array(100)
    .fill(0)
    .map(() => {
      const lat = Math.random() * (37.7 - 37.4) + 37.4;
      const lng = Math.random() * (127.2 - 126.8) + 126.8;
      return { lat, lng };
    });

const createNewMarker = (
  { lat, lng, status, image, description }: TrashCan,
  setSelectedMarker: React.Dispatch<React.SetStateAction<TrashCan | null>>,
) => {
  const icon =
    status === "added"
      ? "/img/TrashcanIconIMG.png"
      : "/img/TrashcanIconIMG.png";
  const markerImage = new window.kakao.maps.MarkerImage(
    icon,
    new window.kakao.maps.Size(30, 30),
    {
      offset: new window.kakao.maps.Point(15, 15),
    },
  );
  const marker = new window.kakao.maps.Marker({
    position: new window.kakao.maps.LatLng(lat, lng),
    image: markerImage,
  });

  window.kakao.maps.event.addListener(marker, "click", () => {
    setSelectedMarker({ lat, lng, status, image, description });
  });

  return { lat, lng, status, marker, image, description };
};

export default function LocationPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<TrashCan | null>(null);
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
          map,
          averageCenter: true,
          minLevel: 7,
        });

        const positions = randomLatLng().map((position) =>
          createNewMarker(
            {
              lat: position.lat,
              lng: position.lng,
              status: "added",
              image: "/img/TEST.jpg",
            },
            setSelectedMarker,
          ),
        );

        clusterer.addMarkers(positions.map((position) => position.marker));
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
      <Image
        className="absolute left-0 top-0 z-50"
        width={500}
        height={300}
        src={selectedMarker?.image ?? ""}
        alt=""
      />
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