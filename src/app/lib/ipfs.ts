import axios from "axios";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
const PINATA_BASE = "https://api.pinata.cloud/pinning";

export interface IPFSUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * 파일을 Pinata IPFS에 업로드
 */
export async function uploadFileToIPFS(file: File): Promise<IPFSUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${PINATA_BASE}/pinFileToIPFS`, formData, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: PINATA_JWT,
    },
  });
  return res.data;
}

/**
 * JSON 메타데이터를 Pinata IPFS에 업로드
 */
export async function uploadJSONToIPFS(data: any): Promise<IPFSUploadResult> {
  const res = await axios.post(`${PINATA_BASE}/pinJSONToIPFS`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: PINATA_JWT,
    },
  });
  return res.data;
}
