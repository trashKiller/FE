import { useKakaoStore } from "@/stores/useKakaoStore";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "../searchbar/searchbar";

type NavigatorBarType =
  | ""
  | "findlocation"
  | "addlocation"
  | "ranking"
  | "announcement"
  | "getdirection";

interface MenuItemType {
  href: NavigatorBarType;
  title: string;
  icon: string;
}

const navList: MenuItemType[] = [
  {
    href: "",
    title: "홈",
    icon: "/svg/home.svg",
  },
  {
    href: "findlocation",
    title: "위치 찾기",
    icon: "/svg/findlocation.svg",
  },
  {
    href: "getdirection",
    title: "길 찾기",
    icon: "/svg/getdirection.svg",
  },
  {
    href: "addlocation",
    title: "위치 추가",
    icon: "/svg/addlocation.svg",
  },
  {
    href: "ranking",
    title: "랭킹",
    icon: "/svg/ranking.svg",
  },
  {
    href: "announcement",
    title: "공지사항",
    icon: "/svg/announcement.svg",
  },
];
export default function Header({ children }: { children: React.ReactNode }) {
  const { keywordSearch } = useKakaoStore();
  const [navOpened, setNavOpened] = useState(false);
  const [detailOpened, setDetailOpened] = useState(false);
  const pathName = usePathname();

  const [clicked, setClicked] = useState<NavigatorBarType>(
    pathName.slice(1) as NavigatorBarType,
  );

  return (
    <header className="relative z-40 w-full">
      <div className="flex flex-col p-4 bg-white gap-4 shadow-md">
        <div className="relative w-full flex items-center justify-between">
          <button
            type="button"
            className="flex flex-col justify-center"
            onClick={() => setNavOpened(true)}
          >
            <img src="/svg/menu.svg" alt="메뉴버튼" />
          </button>
          <h1 className="absolute left-[50%] -translate-x-[50%] text-[1.rem] font-extrabold">
            쓰파인더
          </h1>
          <button type="button" onClick={() => setDetailOpened(true)}>
            자세히 보기
          </button>
        </div>
        <SearchBar
          placeholder="장소 검색"
          keywordSearchMethod={keywordSearch}
          className="w-full border-2 border-light-green rounded-md"
          logo="/svg/searchicon.svg"
        />
      </div>

      <div
        className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-20 duration-300 pointer-events-none"
        style={{
          backgroundColor: navOpened
            ? "rgba(0, 0, 0, 0.5)"
            : "rgba(0, 0, 0, 0)",
        }}
      >
        <nav
          className="bg-white pointer-events-auto h-full w-[50%] duration-300"
          style={{
            transform: `translateX(${navOpened ? "0" : "-100%"})`,
          }}
        >
          <div className="flex flex-col items-start p-4 gap-4 justify-between">
            <div className="flex items-center gap-4">
              <img
                src="img/test.jpg"
                className="w-[2rem] object-cover rounded-full aspect-square"
                alt="사용자 프로필"
              />
              <div className="flex flex-col">
                <p className="text-lg font-bold">이근성</p>
                <p className="text-sm text-[#777777]">rmstjd333@gmail.com</p>
              </div>
              <div className="flex-grow" />
              <button
                type="button"
                className="font-semilight text-[1.5rem]"
                onClick={() => setNavOpened(false)}
              >
                X
              </button>
            </div>
            <div className="border-b-2 w-full" />
            <div className="w-[calc(100%+2rem)] relative right-4 flex flex-col">
              {navList.map((nav) => (
                <Link
                  href={`/${nav.href}`}
                  key={nav.title}
                  onClick={() => {
                    setNavOpened(false);
                    setDetailOpened(true);
                    setClicked(nav.href);
                  }}
                  className={
                    clicked === nav.href
                      ? "w-full text-dark-green bg-black bg-opacity-10 p-3 font-semibold"
                      : "p-3 font-semibold"
                  }
                >
                  {nav.title}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
      <div
        className="h-screen bg-white absolute top-0 right-0 flex flex-col items-end p-8 duration-300"
        style={{
          width: detailOpened ? "100%" : "0px",
          padding: detailOpened ? "2rem" : "0px",
        }}
      >
        <div
          className={
            detailOpened
              ? "opacity-100 pointer-events-auto w-full"
              : "opacity-0 pointer-events-none w-full"
          }
        >
          <button
            type="button"
            className="font-semilight text-[1.5rem]"
            onClick={() => setDetailOpened(false)}
          >
            X
          </button>
          {children}
        </div>
      </div>
    </header>
  );
}