import "./App.css";
import { Metaplex } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useState } from "react";

const connection = new Connection(clusterApiUrl("devnet"));
const mx = Metaplex.make(connection);

function App() {
  const [address, setAddress] = useState(
    "32WsxRK1vYia8Bk1WfDaoKdtdmVJbYFCZuh6Q58yhHPr"
  );
  const [nft, setNft] = useState(null);

  const fetchNft = async () => {
    const asset = await mx.nfts().findByMint({ mintAddress: new PublicKey(address) });

    setNft(asset);
  };
  
  const connectWellet = async () =>{
    console.log(1);
  }

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">NFT Mint Address</h1>
        <div className="nftForm">
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <button onClick={fetchNft}>Fetch</button>
        </div>
        {nft && (
          <div className="nftPreview">
            <h1>{nft.name}</h1>
            <img
              src={nft.json.image}
              alt="The downloaded illustration of the provided NFT address."
            />
          </div>
        )}
        
        <button
            style={{ width: "220px", height: "50px" }}
            onClick={connectWellet}
          >
            1. 지갑연결
          </button>
          <br />
      </div>
    </div>
  );
}

export default App;
