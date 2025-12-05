"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export function useWalletUser() {
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 메타마스크 연결
  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask를 설치해주세요!");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const addr = accounts[0];
    setAddress(addr);
    localStorage.setItem("wallet", addr);

    // 로그인 API 호출
    const res = await axios.post("/api/auth/wallet", { address: addr });
    setUser(res.data.user);
  };

  // 초기 자동 로그인 시도
  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) {
      setAddress(saved);
      axios.post("/api/auth/wallet", { address: saved }).then((res) => {
        setUser(res.data.user);
      });
    }
    setLoading(false);
  }, []);

  const disconnect = () => {
    setAddress(null);
    setUser(null);
    localStorage.removeItem("wallet");
  };

  return { address, user, loading, connect, disconnect };
}
