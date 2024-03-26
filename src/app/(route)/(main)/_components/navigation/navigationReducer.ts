/* eslint-disable import/prefer-default-export */

import {
  FeatureCollection,
  MarkerType,
  NavigationCoordinate,
  RouteSection,
  Transportation,
} from "@/types/navigate";

interface NavigationState {
  selectedTransport: Transportation;
  navigateCoordinate: NavigationCoordinate;
  marker: MarkerType;
  isSettingMarker: boolean;
  selectedRoute: number | null;
  carRoute: RouteSection[];
  walkRoute: FeatureCollection;
  map: any;
  eraseMarker?: () => void;
}

// 초기 상태
export const initialNavigationState: NavigationState = {
  map: null,
  selectedTransport: "car",
  navigateCoordinate: {},
  marker: {},
  isSettingMarker: false,
  selectedRoute: null,
  carRoute: [],
  walkRoute: {
    type: "FeatureCollection",
    features: [],
  },
  eraseMarker: () => {},
};

const Actions = {
  SET: "SET",
  SET_MAP: "SET_MAP",
  SET_TRANSPORT: "SET_TRANSPORT",
  SET_DEPARTURE: "SET_DEPARTURE",
  SET_ARRIVAL: "SET_ARRIVAL",
  SET_SELECTED_ROUTE: "SET_SELECTED_ROUTE",
  SET_CAR_ROUTE: "SET_CAR_ROUTE",
  SET_WALK_ROUTE: "SET_WALK_ROUTE",
  SWAP_DEPARTURE_ARRIVAL: "SWAP_DEPARTURE_ARRIVAL",
  REMOVE_DEPARTURE_ARRIVAL: "REMOVE_DEPARTURE_ARRIVAL",
} as const;

export type NavigateActionType = (typeof Actions)[keyof typeof Actions];

interface SetAction {
  type: "SET";
  payload: Partial<NavigationState>;
}

interface SetMapAction {
  type: "SET_MAP";
  payload: any;
}

interface SetTransportAction {
  type: "SET_TRANSPORT";
  payload: Transportation;
}

interface SetDepartureAction {
  type: "SET_DEPARTURE";
  payload: Pick<NavigationCoordinate, "startX" | "startY">;
}

interface SetArrivalAction {
  type: "SET_ARRIVAL";
  payload: Pick<NavigationCoordinate, "endX" | "endY">;
}

interface SetSelectedRouteAction {
  type: "SET_SELECTED_ROUTE";
  payload: number | null;
}

interface SetCarRouteAction {
  type: "SET_CAR_ROUTE";
  payload: RouteSection[];
}

interface SetWalkRouteAction {
  type: "SET_WALK_ROUTE";
  payload: FeatureCollection;
}

interface SwapDepartureArrivalAction {
  type: "SWAP_DEPARTURE_ARRIVAL";
}

interface RemoveDepartureArrivalAction {
  type: "REMOVE_DEPARTURE_ARRIVAL";
}

export type NavigationAction =
  | SetAction
  | SetMapAction
  | SetTransportAction
  | SetDepartureAction
  | SetArrivalAction
  | SetSelectedRouteAction
  | SetCarRouteAction
  | SetWalkRouteAction
  | SwapDepartureArrivalAction
  | RemoveDepartureArrivalAction;

// 리듀서 함수
export const navigationReducer = (
  state: NavigationState,
  action: NavigationAction,
): NavigationState => {
  switch (action.type) {
    case "SET":
      return {
        ...state,
        ...action.payload,
      };
    case "SET_MAP": {
      const startImageSrc = "svg/departure.svg"; // 마커이미지의 주소입니다
      const imageSize = new window.kakao.maps.Size(32, 32);
      const startMarkerImage = new window.kakao.maps.MarkerImage(
        startImageSrc,
        imageSize,
      );

      const endImageSrc = "svg/arrival.svg"; // 마커이미지의 주소입니다
      const endMarkerImage = new window.kakao.maps.MarkerImage(
        endImageSrc,
        imageSize,
      );
      const startMarker = new window.kakao.maps.Marker({
        image: startMarkerImage,
      });

      const endMarker = new window.kakao.maps.Marker({
        image: endMarkerImage,
      });
      startMarker.setMap(action.payload);
      endMarker.setMap(action.payload);
      return {
        ...state,
        marker: {
          startMarker,
          endMarker,
        },
        map: action.payload,
      };
    }

    case "SET_TRANSPORT":
      return {
        ...state,
        selectedTransport: action.payload,
      };

    case "SET_DEPARTURE": {
      state.marker.startMarker.setPosition(
        new window.kakao.maps.LatLng(
          action.payload.startY,
          action.payload.startX,
        ),
      );

      return {
        ...state,
        navigateCoordinate: {
          ...state.navigateCoordinate,
          ...action.payload,
        },
      };
    }

    case "SET_ARRIVAL": {
      state.marker.endMarker.setPosition(
        new window.kakao.maps.LatLng(action.payload.endY, action.payload.endX),
      );
      return {
        ...state,
        navigateCoordinate: {
          ...state.navigateCoordinate,
          ...action.payload,
        },
      };
    }

    case "SET_SELECTED_ROUTE": {
      if (action.payload === null) {
        return {
          ...state,
          selectedRoute: null,
        };
      }
      return {
        ...state,
        selectedRoute: action.payload,
      };
    }

    case "SET_CAR_ROUTE":
      return {
        ...state,
        carRoute: action.payload,
        selectedRoute: 0,
      };
    case "SET_WALK_ROUTE":
      return {
        ...state,
        walkRoute: action.payload,
        selectedRoute: 0,
      };

    case "SWAP_DEPARTURE_ARRIVAL": {
      const { startX, startY, endX, endY } = state.navigateCoordinate;
      state.marker.startMarker.setPosition(
        new window.kakao.maps.LatLng(endY, endX),
      );
      state.marker.endMarker.setPosition(
        new window.kakao.maps.LatLng(startY, startX),
      );
      return {
        ...state,
        navigateCoordinate: {
          startX: endX,
          startY: endY,
          endX: startX,
          endY: startY,
        },
      };
    }

    case "REMOVE_DEPARTURE_ARRIVAL": {
      state.marker.startMarker.setMap(null);
      state.marker.endMarker.setMap(null);
      return {
        ...state,
        navigateCoordinate: {},
      };
    }
    default:
      return state;
  }
};