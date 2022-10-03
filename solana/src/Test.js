import React, { useState, useEffect, useCallback } from "react";

if (typeof window.solana !== "undefined") {
  console.log("phantom is installed!");
};

function Test() {
  const [walletAddress, setWalletAddress] = useState(null);
 
  const connectWalletPhantom = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  return (
    <div className="App">
      <header>
        <div>
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={connectWalletPhantom}
          >
            1. 지갑연결
          </button>
          <br />
        </div>
      </header>
    </div>
  );
}

export default Test;
