import React, { useState, useEffect } from 'react';

export default function WalletConnect() {
  const [address, setAddress] = useState<string>('');

  const connectWallet = async () => {
    // window.ethereum 타입 에러 방지를 위한 any 캐스팅
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert("메타마스크가 필요합니다!");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
    } catch (error) {
      console.error("User rejected connection", error);
    }
  };

  // 지갑 주소 줄여서 보여주기 (예: 0x1234...abcd)
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-md transition-all active:scale-95"
    >
      {address ? formatAddress(address) : "🔌 Connect Wallet"}
    </button>
  );
}
