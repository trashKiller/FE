import Button from "@/components/button/button";

export default function FindTrashCan() {
  return (
    <div>
      <h2 className="font-extrabold text-xl">가장 가까운 쓰레기통 위치</h2>
      <div className="border w-full" />
      <h2 className="font-extrabold text-xl">주변 쓰레기통 위치</h2>
      <Button
        onClick={() => {}}
        className=""
        icon="svg/NavigationIcon.svg"
        content="길찾기"
      />
    </div>
  );
}
