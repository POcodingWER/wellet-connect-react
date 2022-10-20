import "./App.css";
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";
import { keypairIdentity, Metaplex, toBigNumber, sol, toDateTime } from "@metaplex-foundation/js";
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
  const [payer, setpayer] = useState("");
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
    setpayer(publickey);
    console.log(publickey.publicKey.toBase58());
    // const airdropSignature = await connection.requestAirdrop(
    //   publickey.publicKey,
    //   LAMPORTS_PER_SOL * 2
    // );
    // console.log(
    //   "드뢉완료,",
    //   await connection.confirmTransaction(airdropSignature)
    // );
  };
  /** 컬랙션 만들고 캔디머신 만들기 */
  const makeCandyMachine = async () => {
    console.log("loading");
    //돈낼사람 넣어주고
    metaplex.use(keypairIdentity(payer));

    const { nft: collectionNft } = await metaplex.nfts().create({
      isCollection: true,
      name: 'uuuuuuuuuuuu',
      uri: "https://arweave.net/E7ZchKO6QgNKMBtapymZGQDXdm7b1_swQ0AyjmBB_DA", //json 형식 메타데이터
      sellerFeeBasisPoints: 0,
    });

    console.log(
      `민터주소: ${collectionNft.address.toBase58()}\nmetadataAddress: ${collectionNft.metadataAddress.toBase58()}\nupdateAuthorityAddress: ${collectionNft.updateAuthorityAddress.toBase58()}`,
      collectionNft
    );
  
    
    const { candyMachine } = await metaplex.candyMachines().create({
      sellerFeeBasisPoints: 333, // 3.33%
      itemsAvailable: toBigNumber(6),  //몇개 발행
      collection: {
        address: collectionNft.address,
        updateAuthority: metaplex.identity(),
      },
    });

    console.log(
      `캔디머신주소: ${candyMachine.address.toBase58()}
      캔디머신권한: ${candyMachine.authorityAddress.toString()}
      collectionMintAddress: ${candyMachine.collectionMintAddress.toBase58()}
      NFT총 가능양: ${candyMachine.itemsAvailable.toString()}
      지금까지 발행양: ${candyMachine.itemsMinted.toString()}
      남은 발행양: ${candyMachine.itemsRemaining.toString()}
      `,
      candyMachine
    );
    setCandyMachineAdr(candyMachine);
  };
  /** 캔디머신 가져오고 권한업데이트 */
  const getCandyMAandUpdateAuthority = async () => {
    metaplex.use(keypairIdentity(payer))

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 권한자",
      candyMachine.authorityAddress.toString()
    );

    const newAuthority = Keypair.generate();
    console.log("권한 변경할 Account", newAuthority.publicKey.toBase58());

    const tx = await metaplex.candyMachines().update({
      candyMachine,
      authority: payer,
      newAuthority: newAuthority.publicKey,
    });
    console.log("변경 tx 주소",tx);

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("변겨완료", updatedCandyMachine.authorityAddress.toString());
  };
  /** NFT데이터 업데이트 */
  const NFTdataUpdate = async () => {
    metaplex.use(keypairIdentity(payer))

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 권한자",
      candyMachine.authorityAddress.toString()
    );
    
    const newCreator = Keypair.generate();
    console.log("2차수수료 변경할 Account", newCreator.publicKey.toBase58());

    const tx = await metaplex.candyMachines().update({
      candyMachine,
      symbol: 'NEW',
      sellerFeeBasisPoints: 100,
      creators: [{ address: newCreator.publicKey, share: 100 }],
    });
    console.log("변경 tx 주소",tx);

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("변경된 2차수수료 받을 Account", updatedCandyMachine.creators[0].address.toBase58());
  }
  /** 민터(컬랙션) 변경*/
  const candyMachineChangeMinter = async () => {
    metaplex.use(keypairIdentity(payer))

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 권한자",
      candyMachine.authorityAddress.toString(),
      "컬랙션주소",
      candyMachine.collectionMintAddress.toBase58(),
    );
    
    const tx = await metaplex.candyMachines().update({
      candyMachine,
      collection: {
        address:new PublicKey('3i7izYHug4t34mFWqXyV74qmZiM2XkmnXvHNJvE5FmzY'), //바꿀민터
        updateAuthority: metaplex.identity(), //업데이트 권한 확인인가봄?
      },
    });
    console.log("변경 tx 주소",tx);

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log(
      "변경된 컬랙션 주소",
      updatedCandyMachine.collectionMintAddress.toString()
    );

  }
  /** 아이템 목록 설정 */
  const itemUpdate = async () => {
    metaplex.use(keypairIdentity(payer))

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 권한자",
      candyMachine.authorityAddress.toString(),
    );

    const tx = await metaplex.candyMachines().update({
      candyMachine,
      itemSettings: {
        type: "configLines",        //configLines or hidden
        prefixName: "My New NFT #$ID+1$",  
        nameLength: 0,
        prefixUri: "https://arweave.net/",
        uriLength: 43,
        isSequential: true,   //nft를 순차적으로 생성할지:true 램덤하게 생성할지:false
      },
    });

    console.log("변경 tx 주소",tx);
    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("변경된 컬랙션 주소", updatedCandyMachine);
  }
  /** 캔디머신 삭제하기 */
  const candyMachineDelete = async () => {
    metaplex.use(keypairIdentity(payer))

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 가드 주소",
      candyMachine.candyGuard.address.toString(),
    );
    // 캔디머신만 지워짐
    // await metaplex.candyMachines().delete({
    //   candyMachine: candyMachine.address,
    // });

    // 연결된 가드까지 다삭제
    await metaplex.candyMachines().delete({
      candyMachine: candyMachine.address,
      candyGuard: candyMachine.candyGuard.address,
    });
    setCandyMachineAdr('')
    console.log('완료');
  }
  /** json meta data upload */
  const metadataUpload = async () => {
    console.log('****머가 문제인지 업로드안됨, 근데 우리는 메타데이터 다만들고 올릴꺼니깐 2번부터 진행 나중에 1번 해보자');
    //metaplex  기초
    //https://user-images.githubusercontent.com/3642397/167716670-16c6ec5e-76ba-4c15-9dfc-7790d90099dd.png
    console.log('default',metaplex); 
    console.log('default',metaplex.identity());
    metaplex.use(keypairIdentity(payer)).use(nftStorage());
    console.log('키페어세팅후',metaplex.identity());
    console.log(metaplex);
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "My NFT #1",
      description: "제발요",
      // seller_fee_basis_points:200,
      // image: "https://co3fzbfdxjbagsrqdnnkokmzdeano5to3pl7wmcdiazi4ycb7qya.arweave.net/E7ZchKO6QgNKMBtapymZGQDXdm7b1_swQ0AyjmBB_DA",
      // external_url:'https://explorer.solana.com/address/GLeayYXBjWEvb1T6GDrp2SJFkKTVZGxCJ77Hv5qSJxWq?cluster=devnet',
    });
    console.log(uri);
  }
  /** 캔디머신에 이름과 uri 넣기*/
  const CMinsertItems = async () => {
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      candyMachine.items
    );

    await metaplex.candyMachines().insertItems({
      candyMachine,
      items: [
        { name: "bellygom #1", uri: "https://belly.bellygom.world/1.json" },
        { name: "bellygom #2", uri: "https://belly.bellygom.world/2.json" },
        { name: "bellygom #3", uri: "https://belly.bellygom.world/3.json" },
      ],
    });
    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log('insertItems 진행중',updatedCandyMachine.items);

    //데이터 크기가 커서 다안들어가면 인덱스 사용해서 넣어주면됨 설정 수량을 초과할수는없다.
    await metaplex.candyMachines().insertItems({
      candyMachine,
      index:3,
      items: [
        { name: "bellygom #4", uri: "https://belly.bellygom.world/4.json" },
        { name: "bellygom #5", uri: "https://belly.bellygom.world/5.json" },
        { name: "bellygom #6", uri: "https://belly.bellygom.world/6.json" },
      ],
    });
     updatedCandyMachine = await metaplex
    .candyMachines()
    .refresh(candyMachine);
    console.log('insertItems 완료',updatedCandyMachine.items);
  };
  /** 아이템 이름 uri 설정되어있을때 항목삽입법 */
  const itemSettingsCMinsertItems = async () => {
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      candyMachine.itemSettings
    );

    await metaplex.candyMachines().update({
      candyMachine,
      itemsAvailable: toBigNumber(6),
      itemSettings: {
        type: "configLines",
        prefixName: "belly gom #",
        nameLength: 1,
        prefixUri: "https://belly.bellygom.world/",
        uriLength: 6,
        isSequential: true,
      },
    });

    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("캔디머시 아이템세팅", updatedCandyMachine.itemSettings);

    await metaplex.candyMachines().insertItems({
      candyMachine,
      items: [
        { name: "1", uri: "1.json" },
        { name: "2", uri: "2.json" },
        { name: "3", uri: "3.json" },
      ],
    });

    updatedCandyMachine = await metaplex.candyMachines().refresh(candyMachine);
    console.log("캔디머시 아이템인설트", updatedCandyMachine.items);
  };
  /** 아이템 인설트후 수정 방법*/
  const insertItemsModify = async () => {
    metaplex.use(keypairIdentity(payer))

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    if (candyMachine.itemsAvailable.toString()==candyMachine.items.length) {
      return alert('최대발행수까지 세팅되면 수정불가능');
    }
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      candyMachine.itemSettings,
      candyMachine.items
    );
    
    await metaplex.candyMachines().insertItems({
      candyMachine,
      index: 1,
      items: [
        { name: "d", uri: "d.json" }
      ],
    });

    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
      console.log("캔디머시 아이템수정", updatedCandyMachine.items);
  }
  /** 캔디가드가 무엇인가? */
  const whatCandyGuard =  async () => {
    console.log(`
    Address Gate: 민트를 단일 주소로 제한합니다.
    Allow List: 지갑 주소 목록을 사용하여 누가 발행할 수 있는지 결정합니다.
    Bot Tax: 유효하지 않은 거래를 부과하기 위해 구성 가능한 세금입니다.
    End Date: 조폐국을 종료할 날짜를 결정합니다.
    Gatekeeper: 보안문자 통합과 같은 게이트웨이 네트워크를 통한 발행을 제한합니다.
    Mint Limit: 지갑당 Mint 수에 대한 제한을 지정합니다.
    Nft Burn: NFT를 소각해야 하는 특정 컬렉션의 보유자로 민트를 제한합니다.
    Nft Gate: 지정된 컬렉션의 소지자에게만 조폐국을 제한합니다.
    Nft Payment: 지정된 컬렉션의 NFT로 민트의 가격을 설정합니다.
    Redeemed Amount: 발행된 총 발행량을 기준으로 발행 종료 시점을 결정합니다.
    Sol Payment: SOL에서 민트의 가격을 설정합니다.
    Start Date: 박하의 시작 날짜를 결정합니다.
    Third Party Signer: 거래에 대한 추가 서명자가 필요합니다.
    Token Burn: 지정된 토큰 소지자로 조폐국을 제한하여 토큰 소각을 요구합니다.
    Token Gate: 지정된 토큰 소지자에게만 발행을 제한합니다.
    Token Payment: 토큰 금액으로 조폐국의 가격을 설정합니다.
    `);
    metaplex.use(keypairIdentity(payer))
    // withoutCandyGuard:true 이것만 안넣어주면 디폴드값으로 알아서 가드는 생김
    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(10),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey('FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY'),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        botTax: { lamports: sol(0.01), lastInstruction: false },  //  봇어쩌고
        solPayment: { amount: sol(1.5), destination: metaplex.identity().publicKey },  //  대금 지갑주소?
        startDate: { date: toDateTime("2022-10-18T16:00:00Z") },  //  시작시간
      },
    });

    console.log('가드가 있는 캔디머신생성',candyMachine.candyGuard);
    setCandyMachineAdr(candyMachine);
  }
  /** 가드 업데이트 해보기 */
  const guardUpdate = async () => {
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });

    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디가드",
      candyMachine.candyGuard
    );

    await metaplex.candyMachines().update({
      candyMachine,
      guards: {
        botTax: { lamports: sol(0.08), lastInstruction: false },
        solPayment: {
          amount: sol(0.8),
          destination: metaplex.identity().publicKey,
        },
        startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
      },
    });

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log(
      "변경된 캔디머신 가드",
      updatedCandyMachine.candyGuard.guards

    );
  };
  /** 캔디머신따로 가드따로 생성후 합치기 */
  const candyGuardAccountSwap  = async () => {
    console.log('loading');
    metaplex.use(keypairIdentity(payer));
    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(5000),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address:  new PublicKey('FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY'),
        updateAuthority: metaplex.identity(),
      },
      withoutCandyGuard: true,  //가드 안쓴다는 명령어
    });
    console.log('가드가 생성되었는지 확인해보셈',candyMachine);
    
    const { candyGuard } = await metaplex.candyMachines().createCandyGuard({
      guards: {
        botTax: { lamports: sol(0.01), lastInstruction: false },
        solPayment: { amount: sol(1.5), destination: metaplex.identity().publicKey},
        startDate: { date: toDateTime("2022-10-17T16:00:00Z") },
      },
    });
    console.log('create candyGuard',candyGuard);

    await metaplex.candyMachines().wrapCandyGuard({
      candyMachine: candyMachine.address,
      candyGuard: candyGuard.address,
    });
    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log('캔디머신에 캔디가드 연결',updatedCandyMachine);
    
    await metaplex.candyMachines().unwrapCandyGuard({
      candyMachine: candyMachine.address,
      candyGuard: candyGuard.address,
    });
    updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log('캔디머신에 캔디가드 연결끊음 ',updatedCandyMachine);


  }
  /** 캔디머신 가드 구릅화 */
  const candyMachineGuardGroup = async () => {

  }

  const test = ()=>{
    let candyMachine = {
      "botTax": {
          "lamports": {
              "basisPoints": "04c4b400",
              "currency": {
                  "symbol": "SOL",
                  "decimals": 9
              }
          },
          "lastInstruction": false
      },
      "solPayment": {
          "lamports": "2faf0800",
          "destination": "Bao3ZumN6trNwe4HU1XMwm4kfXpTKZ56Jw3MYLsUuhiK",
          "amount": {
              "basisPoints": "2faf0800",
              "currency": {
                  "symbol": "SOL",
                  "decimals": 9
              }
          }
      },
      "tokenPayment": null,
      "startDate": {
          "date": "634ecd80"
      },
      "thirdPartySigner": null,
      "tokenGate": null,
      "gatekeeper": null,
      "endDate": null,
      "allowList": null,
      "mintLimit": null,
      "nftPayment": null,
      "redeemedAmount": null,
      "addressGate": null,
      "nftGate": null,
      "nftBurn": null,
      "tokenBurn": null
  }
    console.log(
      sol(candyMachine.botTax.lamports.basisPoints.toString())
      // candyMachine.baseAddress.toString(),
      // candyMachine.guards.solPayment.destination.toString(),
    );
    
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
        {payer.publicKey?.toBase58()}
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
          onClick={getCandyMAandUpdateAuthority}
        >
          3.캔디머신 찾은후 권한 업데이트
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={NFTdataUpdate}
        >
          4.캔디머신 찾은후 NFTdata 엡데이트
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={candyMachineChangeMinter}
        >
          5.캔디머신 찾은후 민터(컬랙션) 업데이트
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={itemUpdate}
        >
          6.캔디머신 찾은후 아이템 업데이트
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={candyMachineDelete}
        >
          7.캔디머신 찾은후 삭제하기
        </button>
        <br />
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={metadataUpload}
        >
          1.메타데이터 업로드 지금안됨 나중에해보자 
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={CMinsertItems}
        >
          2.캔디머신에 아이템세팅x 이름과 메타데이터 넣기
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={itemSettingsCMinsertItems}
        >
          3.캔디머신에 아이템세팅한후 이름,메타데이터 넣기
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={insertItemsModify}
        >
          4.캔디머신에 아이템 수정
        </button>
        <br />
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={whatCandyGuard}
        >
          1.가드가 있는 캔디머신 만들기
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={guardUpdate}
        >
          2.가드가 정보 업데이트 
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={candyGuardAccountSwap}
        >
          3.캔디머신 생성 가드생성 수동으로 연결분리하기 
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={candyMachineGuardGroup}
        >
          4.캔디머신 가드 구룹으로 나누기 
        </button>
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
