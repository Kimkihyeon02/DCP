import { ethers } from "ethers";
import { CONTRACTS, RPC_URL } from "./constants";

// ===============================
// 🔥 1) Provider (read-only)
// ===============================
export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

// ===============================
// 🔥 2) Read-only Contract
// 조회 함수(ownerOf, royaltyInfo, view 함수) 전용
// 절대로 MetaMask 연결 안 함
// ===============================
export const getReadContract = (name: keyof typeof CONTRACTS) => {
  const provider = getProvider();
  const { address, abi } = CONTRACTS[name];
  return new ethers.Contract(address, abi, provider);
};

// ===============================
// 🔥 3) Signer Contract (MetaMask)
// 트랜잭션 write 전용 (mint, burn, buy 등)
// ===============================
export const getSignerContract = async (name: keyof typeof CONTRACTS) => {
  if (typeof window === "undefined") {
    throw new Error("Signer is client-only");
  }

  const { ethereum } = window as any;
  if (!ethereum) throw new Error("MetaMask not found");

  // 요청하지 않으면 signer가 뜨지 않음
  await ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  const { address, abi } = CONTRACTS[name];
  return new ethers.Contract(address, abi, signer);
};

// ===============================
// 🔥 4) Auto Contract (read → write 자동 분기)
// - SSR: read-only
// - CSR + MetaMask 있음: signer
// - CSR + MetaMask 없으면 read-only
// ===============================
export const getContract = async (name: keyof typeof CONTRACTS) => {
  // SSR 환경 → read-only
  if (typeof window === "undefined") {
    return getReadContract(name);
  }

  const { ethereum } = window as any;

  // MetaMask 없는 브라우저 → read-only
  if (!ethereum) {
    return getReadContract(name);
  }

  try {
    // MetaMask 연결 성공 → signer contract
    await ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();

    const { address, abi } = CONTRACTS[name];
    return new ethers.Contract(address, abi, signer);
  } catch (err) {
    // MetaMask 연결 실패 → fallback to read-only
    return getReadContract(name);
  }
};
