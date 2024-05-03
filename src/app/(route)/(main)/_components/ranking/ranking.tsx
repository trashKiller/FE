"use client";

import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { APIURL } from "@/util/const";
import { useInfiniteQuery } from "@tanstack/react-query";
import { forwardRef } from "react";

const rankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-light-green border-2 border-light-green";
    case 2:
      return "bg-[#D5D5C7] bg-opacity-20 border-2 border-[#C5C5BD]";
    case 3:
      return "bg-[#E9A56A] bg-opacity-10 border-2 border-[#E9A56A]";
    default:
      return "bg-white border-[#AAAAAA] border-2 border-opacity-50";
  }
};

const UserRanking = forwardRef(function UserRanking(
  {
    rank,
    name,
    score,
    icon,
  }: {
    rank: number;
    name: string;
    score: number;
    icon?: string;
  },
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      className={`flex rounded-tr-lg shadow-md px-4 py-2 items-center ${rankColor(rank)}`}
    >
      {rank > 3 ? (
        <span className="text-dark-blue font-extrabold text-[1.25rem] w-8 text-center">
          {rank}
        </span>
      ) : (
        <img
          src={`/svg/rank${rank}icon.svg`}
          alt="랭킹 아이콘"
          className="w-8"
        />
      )}
      <div
        className={`flex items-center justify-between w-full px-4 ${
          rank === 1 ? "text-white" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              className=""
              src={icon ?? "/svg/defaulticon.svg"}
              alt="사용자 아이콘"
            />
          </div>
          <div className={`text-lg${rank < 4 ? " font-bold" : ""}`}>
            {name ?? "익명"}
          </div>
        </div>
        <div className="text-sm">{score}pt</div>
      </div>
    </div>
  );
});

interface UserRankingResponse {
  memberId: number;
  memberName: string;
  totalScore: number;
  personalRank: number;
}

export default function Ranking() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["ranking"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `${APIURL}/api/rank/list?startIndex=${pageParam}&endIndex=${pageParam + 9}`,
      );
      const result = await response.json();
      return result;
    },
    getNextPageParam: (lastPage, allPage) => {
      if (lastPage?.message || lastPage?.length < 10) {
        return undefined;
      }
      return allPage.length * 10 + 1;
    },
    initialPageParam: 1,
  });

  const { setTarget } = useIntersectionObserver({
    hasNextPage,
    fetchNextPage,
  });

  console.log(data);

  return (
    <div className="flex flex-col">
      <h2 className="text-[1.25rem] font-extrabold">랭킹</h2>
      <p className="text-dark-blue text-sm">
        * 해당 랭킹은 사용자들이 쓰레기통 위치를 성공적으로 등록함에 따라 얻은
        점수를 기반으로 한 순위입니다.
      </p>
      <div className="relative flex justify-end items-center gap-2 right-5 w-[calc(100%+3rem-4px)] py-2 px-4 border-y-2 bg-[#F5F5F5]">
        <div className="text-sm text-[#666666]">오후 00시 00분 기준</div>
        <button type="button">reload</button>
      </div>

      <div className="flex flex-col gap-4 my-8">
        {data?.pages
          .flat()
          .sort((a, b) => a.personalRank - b.personalRank)
          .map((item: UserRankingResponse, idx, org) => (
            <UserRanking
              ref={idx === org.length - 1 ? setTarget : null}
              key={item.memberId}
              rank={item.personalRank}
              name={item.memberName}
              score={item.totalScore}
            />
          ))}
      </div>
    </div>
  );
}