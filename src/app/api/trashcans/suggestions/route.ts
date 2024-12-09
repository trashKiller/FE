import { put } from "@vercel/blob";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { TrashCanStatus } from "@/types/trashinfo";
import { authOptions } from "../../auth/[...nextauth]/authoption";

const uploadBlob = async (trashcanId: string, fileList: File[]) => {
  try {
    if (!fileList || !fileList.length) return true;
    const blobs = await Promise.all(
      fileList.map((file) => put(file.name, file, { access: "public" })),
    );

    await Promise.all(
      blobs.map(
        (blob) =>
          sql`INSERT INTO trashcan_images VALUES (${trashcanId},${blob.url})`,
      ),
    );

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

interface TrashcanCreateReq {
  address: string;
  addressDetail: string;
  userId: string;
  status: TrashCanStatus;
  latitude: string;
  longitude: string;
}

const createTrashcan = async ({
  address,
  addressDetail,
  userId,
  status,
  latitude,
  longitude,
}: TrashcanCreateReq) => {
  try {
    const res =
      await sql`INSERT INTO trashcan_info (address,"addressDetail","userId",status,latitude,longitude) 
      VALUES (${address},${addressDetail},${userId},${status},${latitude},${longitude}) RETURNING trashcan_info."trashcanId"`;
    return res.rows[0].trashcanId;
  } catch (e) {
    return null;
  }
};

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return NextResponse.json(
      { message: "로그인 후 시도해주세요." },
      { status: 401 },
    );

  const formData = await req.formData();

  const trashcanId = await createTrashcan({
    ...Object.fromEntries(formData),
    userId: session.user.id,
    status: "SUGGESTED", // 임시처리
  } as TrashcanCreateReq);

  if (!trashcanId)
    return NextResponse.json(
      { message: "쓰레기통 등록에 실패했습니다." },
      { status: 500 },
    );

  const imageUploadSuccess = await uploadBlob(
    trashcanId,
    formData.getAll("imageObject") as File[],
  );

  if (!imageUploadSuccess)
    return NextResponse.json(
      { message: "이미지 등록에 실패했습니다." },
      { status: 500 },
    );

  return NextResponse.json(
    { message: "등록에 성공했습니다." },
    { status: 200 },
  );
};
