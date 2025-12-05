import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT!;
  const data = new FormData();
  data.append("file", file);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: pinataJwt,
    },
  });

  return NextResponse.json(res.data);
}
