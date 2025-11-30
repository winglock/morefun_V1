import { useState } from "react";

export const useWeb3 = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts"
      });
      setAddress(accounts[0]);
      setConnected(true);
    }
  };

  return { address, connected, connect };
};
