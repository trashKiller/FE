"use client";

import useMap from "@/hooks/map/usemap";
import { useCallback, useEffect, useRef, useState } from "react";
import Accordion from "@/components/accordion/accordion";
import { isMobile } from "react-device-detect";
import Header from "@/components/header/header";
import { useKakaoStore } from "@/stores/usekakaostore";
import ButtonList from "@/components/button/buttonlist";
import { ButtonProps } from "@/types/button";
import Navigator from "@/components/sidebar/navigator";
import useDrawMarker from "@/hooks/map/usedrawmarker";
import { useTrashCanStore } from "@/stores/usetrashcanstore";

interface MainLayoutProps {
  children: React.ReactNode;
}

const buttonProps: ButtonProps<boolean>[] = [
  {
    content: "지도",
    type: false,
  },
  {
    content: "로드뷰",
    type: true,
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const roadViewRef = useRef<HTMLDivElement | null>(null);

  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop">("desktop");
  const [isRoadViewOpen, setIsRoadViewOpen] = useState(false);
  const { kakaoMap, isRoadView, roadViewClient, kakaoRoadView, setIsRoadView } =
    useKakaoStore();

  useMap(mapRef, roadViewRef);
  const { data, needRefresh, setNeedRefresh, reFresh } = useDrawMarker(
    "ADDED",
    {
      markerIcon: "/svg/trashcanicongreen.svg",
    },
  );
  const { setTrashCanList } = useTrashCanStore();

  useEffect(() => {
    if (data) {
      setTrashCanList(data);
    }
  }, [data]);

  useEffect(() => {
    if (isMobile) {
      setDeviceType("mobile");
    } else {
      setDeviceType("desktop");
    }
  }, [isMobile]);

  const handleClick = useCallback(
    (mouseEvent: any) => {
      const position = mouseEvent.latLng;
      roadViewClient.getNearestPanoId(position, 50, (panoId: any) => {
        kakaoRoadView.setPanoId(panoId, position);
      });
      setIsRoadView(true);
      window.kakao.maps.event.removeListener(kakaoMap, "click", handleClick);
    },
    [roadViewClient, kakaoRoadView, kakaoMap],
  );

  useEffect(() => {
    if (window.kakao && isRoadViewOpen) {
      kakaoMap.addOverlayMapTypeId(window.kakao.maps.MapTypeId.ROADVIEW);
      window.kakao.maps.event.addListener(kakaoMap, "click", handleClick);
    }

    if (window.kakao && !isRoadViewOpen) {
      setIsRoadView(false);
      kakaoMap.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.ROADVIEW);
      window.kakao.maps.event.removeListener(kakaoMap, "click", handleClick);
    }
  }, [isRoadViewOpen]);

  return (
    <>
      {deviceType === "mobile" ? (
        <Header>
          <section className="w-full">{children}</section>
        </Header>
      ) : (
        <>
          <Navigator />
          <Accordion isOpen={isAccordionOpen} setIsOpen={setIsAccordionOpen}>
            <section className="my-5">{children}</section>
          </Accordion>
        </>
      )}

      <ButtonList
        selectedStatus={isRoadViewOpen}
        setselectedStatus={setIsRoadViewOpen}
        buttonInfo={buttonProps}
        className={`absolute right-4 z-30 w-40${
          deviceType === "mobile" ? " top-36" : " top-4"
        }`}
      />
      <button
        className={`absolute duration-300 ${deviceType === "mobile" ? "top-36" : "top-4"} left-[50%] -translate-x-[50%] z-40 bg-white rounded-md shadow-lg p-4 font-bold text-light-blue ${needRefresh ? "bg-white pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        type="button"
        onClick={() => {
          setNeedRefresh(false);
          reFresh();
        }}
      >
        새로 고침
      </button>
      <div
        ref={mapRef}
        style={{ zIndex: !isRoadView ? "10" : "0" }}
        className={
          (deviceType === "mobile" ? false : isAccordionOpen)
            ? "absolute top-0 h-svh duration-300 w-[calc(100%-20rem)] translate-x-[19.875rem] box-content"
            : "absolute top-0 h-svh duration-300 w-full box-content"
        }
      />
      <div
        ref={roadViewRef}
        style={{ zIndex: isRoadView && isRoadViewOpen ? "10" : "0" }}
        className={
          isAccordionOpen
            ? "absolute top-0 left-0 h-svh duration-300 w-[calc(100%-20rem)] translate-x-[19.875rem] box-content"
            : "absolute top-0 left-0 h-svh duration-300 w-full box-content"
        }
      />
    </>
  );
}
