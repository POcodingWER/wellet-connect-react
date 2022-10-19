import "./App.css";
import { keypairIdentity, Metaplex, toBigNumber } from "@metaplex-foundation/js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { useState } from "react";
import * as bs58 from "bs58";

const connection = new Connection(clusterApiUrl("devnet"));
let metaplex = Metaplex.make(connection);

function App() {
  const [address, setAddress] = useState(
    "32WsxRK1vYia8Bk1WfDaoKdtdmVJbYFCZuh6Q58yhHPr"
  );
  const [nft, setNft] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [candyMachineAdr, setCandyMachineAdr] = useState('');

  const fetchNft = async () => {
    const asset = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(address) });
    setNft(asset);
  };
  /** 지갑 연결 */
  const connectWellet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
    }
  };
  /** 비밀키로 키페어만들기 */
  const privateKeyMakekeyPair = async () => {
    let publickey = Keypair.fromSecretKey(
      bs58.decode(
        "4JYbtxKnu8MHQUb1VriWid2xpMLY9rXqm3RWoTQo9fTwHXRLy3pTLCKiEWktr4pBjJaCQ7tvHRFRaymWdJzjGEtK"
      )
    );
    // const keypair = Keypair.fromSecretKey(
    //   Uint8Array.from([
    //     174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    //     222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    //     15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    //     121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    //   ])
    // );
    setWalletAddress(publickey);
    console.log(publickey.publicKey.toBase58());
    const airdropSignature = await connection.requestAirdrop(
      publickey.publicKey,
      LAMPORTS_PER_SOL * 2
    );
    console.log(
      "드뢉완료,",
      await connection.confirmTransaction(airdropSignature)
    );
  };
  /** 컬랙션 만들고 캔디머신 만들기 */
  const makeCandyMachine = async () => {
    console.log("loading");
    //돈낼사람 넣어주고
    metaplex = metaplex
    .use(keypairIdentity(walletAddress))
    // .use(mockStorage());

    const { nft: collectionNft } = await metaplex.nfts().create({
      isCollection: true,
      name: 'My Collection11',
      uri: "https://arweave.net/E7ZchKO6QgNKMBtapymZGQDXdm7b1_swQ0AyjmBB_DA", //json 형식 메타데이터
      sellerFeeBasisPoints: 0,
    });

    console.log(
      `민터주소: ${collectionNft.address.toBase58()}\nmetadataAddress: ${collectionNft.metadataAddress.toBase58()}\nupdateAuthorityAddress: ${collectionNft.updateAuthorityAddress.toBase58()}`,
      collectionNft
    );
  

    const { candyMachine } = await metaplex.candyMachines().create({
      collection: {
        address: collectionNft.address,
        updateAuthority: metaplex.identity(),
      },
      sellerFeeBasisPoints: 333, // 3.33%
      itemsAvailable: toBigNumber(50),
    });

    console.log(candyMachine);
    console.log(
      `캔디머신주소: ${candyMachine.address.toBase58()}\ncollectionMintAddress: ${candyMachine.collectionMintAddress.toBase58()}\nAuthorityAddress: ${collectionNft.authorityAddress?.toBase58()}`,
      candyMachine
    );
    setCandyMachineAdr(candyMachine);
  };

  const test = ()=>{
    console.log(toBigNumber(50));
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
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={privateKeyMakekeyPair}
        >
          1. 비밀키로 키페어 만들기
        </button>
        {walletAddress.publicKey?.toBase58()}
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={makeCandyMachine}
        >
          2. 민터생성 후 캔디머신v3생성
        </button>
        {candyMachineAdr?.address?.toBase58()}
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={test}
        >
          tttttttttttttt
        </button>
        <br />
      </div>
    </div>
  );
}

export default App;
