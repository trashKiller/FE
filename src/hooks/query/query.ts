import {
  TrashCanInfo,
  TrashCanRequest,
  TrashCanStatus,
} from "@/types/trashinfo";
import { APIURL } from "@/util/const";
import { getSession } from "next-auth/react";

interface MyTrashcanResponse {
  totalPages: number;
  trashcansResponses: TrashCanInfo[];
}

export const queryInfo = {
  notice: (page: number) => ({
    queryKey: ["notice", page],
    queryFn: async () => {
      const res = await fetch(`${APIURL}/api/notification?page=${page}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data;
    },
  }),
  user: (searchQuery?: string) => ({
    queryKey: ["user", searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `/api/members/list${searchQuery ? `/${searchQuery}` : `?page=${pageParam}`}`,
      );
      const result = await response.json();
      return result;
    },
    getNextPageParam: (lastPage: any, allPage: any) => {
      if (lastPage.isLast) return undefined;
      return allPage.length + 1;
    },
    initialPageParam: 1,
  }),
  trashcaninfo: (info: TrashCanRequest | null) => ({
    queryKey: [
      info?.latitude ?? 0,
      info?.longitude ?? 0,
      info?.radius ?? 0,
      info?.status ?? "added",
      info?.trashcanId ?? "",
    ],
    queryFn: async () => {
      if (!info) return [];
      const {
        latitude: lat,
        longitude: lng,
        radius,
        status,
        trashcanId: id,
      } = info;

      const reqURL = id
        ? `/api/trashcans/locations/details/${id}`
        : `/api/trashcans/locations?${new URLSearchParams({
            latitude: lat.toString(),
            longitude: lng.toString(),
            radius: radius.toString(),
            status: status ?? "added",
          }).toString()}`;

      const res = await fetch(reqURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data;
    },
  }),

  myranking: {
    queryKey: ["rank"],
    queryFn: async () => {
      const session = await getSession();
      if (!session?.accessToken) throw new Error("로그인이 필요합니다.");
      const res = await fetch(`${APIURL}/api/rank/me`, {});
      if (!res.ok) {
        throw new Error("랭킹 정보를 불러오는데 실패했습니다.");
      }
      return res.json();
    },
  },
  memberList: (page: number, memberName?: string) => ({
    queryKey: ["members", memberName, page],
    queryFn: async () => {
      const response = await fetch(
        `${APIURL}/api/admin/members?page=${page}${memberName?.length ? `&memberName=${memberName}` : ``}`,
      );
      const result = await response.json();
      return result;
    },
  }),

  trashcanList: (
    page: number,
    status: TrashCanStatus,
    sort: "ASC" | "DESC" = "ASC",
  ) => ({
    queryKey: ["trashcanList", status, page],
    queryFn: async () => {
      const response = await fetch(
        `${APIURL}/api/admin/trashcans?page=${page}&status=${status}${sort?.length ? `&sort=${sort}` : ``}`,
      );
      const result = await response.json();
      return result;
    },
  }),

  reportList: (page: number) => ({
    queryKey: ["reportList", page],
    queryFn: async () => {
      const response = await fetch(`${APIURL}/api/admin/reports?page=${page}`);
      const result = await response.json();
      return result;
    },
  }),
};

export const infiniteQueryInfo = {
  ranking: {
    queryKey: ["ranking"],
    queryFn: async ({ pageParam = 1 }) => {
      if (pageParam === undefined || typeof pageParam !== "number") return [];
      const response = await fetch(
        `${APIURL}/api/rank/list?startIndex=${pageParam}&endIndex=${pageParam + 9}`,
      );
      const result = await response.json();
      return result;
    },
    getNextPageParam: (lastPage: any, allPage: any) => {
      if (lastPage?.message || lastPage?.length < 10) {
        return undefined;
      }
      return allPage.length * 10 + 1;
    },
    initialPageParam: 1,
  },
  mytrashcan: (type: "REGISTRATION" | "SUGGESTION") => ({
    queryKey: ["myTrashcan", type],
    queryFn: async ({ pageParam = 0 }) => {
      const session = await getSession();
      if (!session?.accessToken) throw new Error("로그인이 필요합니다.");
      const res = await fetch(
        `${APIURL}/api/trashcans/members/me?page=${pageParam}&type=${type}`,
      );

      const data = await res.json();

      if (data?.message)
        return {
          totalPages: 0,
          trashcansResponses: [],
        };
      return data as MyTrashcanResponse;
    },
    getNextPageParam: (lastPage: any, allPage: any) => {
      if (lastPage?.message || lastPage?.totalPages > allPage.length) {
        return undefined;
      }
      return allPage.length + 1;
    },

    initialPageParam: 0,
  }),
};
