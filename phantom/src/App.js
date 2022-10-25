import "./App.css";
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";
import {
  keypairIdentity,
  Metaplex,
  toBigNumber,
  sol,
  toDateTime,
  getMerkleRoot,
  getMerkleProof,
} from "@metaplex-foundation/js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  TOKEN_PROGRAM_ID,
  getMint,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getMinimumBalanceForRentExemptAccount,
  createInitializeAccountInstruction,
  ACCOUNT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
  createMintToCheckedInstruction,
  createTransferCheckedInstruction
} from "@solana/spl-token";
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
  const [candyMachineAdr, setCandyMachineAdr] = useState("");
  const [mintingAdr, setMintingAdr] = useState("FVoahsR3Z6GK2cPiPXBWxZD5ZLFo5MfdpLJB2BGZnKej");

  const fetchNft = async () => {
    const asset = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(address) });
    setNft(asset);
  };
  /*------------------------1-----------------------------*/
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
      name: "uuuuuuuuuuuu",
      uri: "https://arweave.net/E7ZchKO6QgNKMBtapymZGQDXdm7b1_swQ0AyjmBB_DA", //json 형식 메타데이터
      sellerFeeBasisPoints: 0,
    });

    console.log(
      `민터주소: ${collectionNft.address.toBase58()}\nmetadataAddress: ${collectionNft.metadataAddress.toBase58()}\nupdateAuthorityAddress: ${collectionNft.updateAuthorityAddress.toBase58()}`,
      collectionNft
    );

    const { candyMachine } = await metaplex.candyMachines().create({
      sellerFeeBasisPoints: 333, // 3.33%
      itemsAvailable: toBigNumber(6), //몇개 발행
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
    metaplex.use(keypairIdentity(payer));

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
    console.log("변경 tx 주소", tx);

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("변겨완료", updatedCandyMachine.authorityAddress.toString());
  };
  /** NFT데이터 업데이트 */
  const NFTdataUpdate = async () => {
    metaplex.use(keypairIdentity(payer));

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
      symbol: "NEW",
      sellerFeeBasisPoints: 100,
      creators: [{ address: newCreator.publicKey, share: 100 }],
    });
    console.log("변경 tx 주소", tx);

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log(
      "변경된 2차수수료 받을 Account",
      updatedCandyMachine.creators[0].address.toBase58()
    );
  };
  /** 민터(컬랙션) 변경*/
  const candyMachineChangeMinter = async () => {
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 권한자",
      candyMachine.authorityAddress.toString(),
      "컬랙션주소",
      candyMachine.collectionMintAddress.toBase58()
    );

    const tx = await metaplex.candyMachines().update({
      candyMachine,
      collection: {
        address: new PublicKey("3i7izYHug4t34mFWqXyV74qmZiM2XkmnXvHNJvE5FmzY"), //바꿀민터
        updateAuthority: metaplex.identity(), //업데이트 권한 확인인가봄?
      },
    });
    console.log("변경 tx 주소", tx);

    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log(
      "변경된 컬랙션 주소",
      updatedCandyMachine.collectionMintAddress.toString()
    );
  };
  /** 아이템 목록 설정 */
  const itemUpdate = async () => {
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 권한자",
      candyMachine.authorityAddress.toString()
    );

    const tx = await metaplex.candyMachines().update({
      candyMachine,
      itemSettings: {
        type: "configLines", //configLines or hidden
        prefixName: "My New NFT #$ID+1$",
        nameLength: 0,
        prefixUri: "https://arweave.net/",
        uriLength: 43,
        isSequential: true, //nft를 순차적으로 생성할지:true 램덤하게 생성할지:false
      },
    });

    console.log("변경 tx 주소", tx);
    const updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("변경된 컬랙션 주소", updatedCandyMachine);
  };
  /** 캔디머신 삭제하기 */
  const candyMachineDelete = async () => {
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      "캔디머신 가드 주소",
      candyMachine.candyGuard.address.toString()
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
    setCandyMachineAdr("");
    console.log("완료");
  };
  /*-------------------------2----------------------------*/
  /** json meta data upload */
  const metadataUpload = async () => {
    //metaplex  기초
    console.log("default", metaplex);
    metaplex.use(keypairIdentity(payer))
    .use(nftStorage()); //metadata maker

    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "fufufu #1",
      symbol: "gjgjgj",
      description: "제발요",
      seller_fee_basis_points: 200,
      image:
        "https://bafybeibcd22kigwqqf5ii3lftfiqi52e3zgy55zr3pa6kqk7wylrqrl33m.ipfs.nftstorage.link/4996.png",
      external_url: "https://acidmonkeys.io/",
      collection: {
        name: "Acid Monkeys",
        family: "Acid Monkeys",
      },
      attributes: [
        {
          trait_type: "Background",
          value: "Pink",
        },
        {
          trait_type: "Hand",
          value: "Bat",
        },
        {
          trait_type: "Classification",
          value: "Cthulhu",
        },
        {
          trait_type: "Eyes",
          value: "Cyborg",
        },
        {
          trait_type: "Face",
          value: "Calm",
        },
        {
          trait_type: "Body",
          value: "None",
        },
        {
          trait_type: "Head",
          value: "None",
        },
        {
          trait_type: "Eyewear",
          value: "Aviator Green",
        },
      ],
      properties: {
        files: [
          {
            uri: "https://bafybeibcd22kigwqqf5ii3lftfiqi52e3zgy55zr3pa6kqk7wylrqrl33m.ipfs.nftstorage.link/393.png",
            type: "image/png",
          },
        ],
        category: "image",
        maxSupply: 1,
        creators: [
          {
            address: "7f69dN6gQHGea3o4aRif8EfHYLXASsBweftBNcWXL2p8",
            share: 100,
          },
        ],
      },
    });
    console.log(uri);
  };
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
    console.log("insertItems 진행중", updatedCandyMachine.items);

    //데이터 크기가 커서 다안들어가면 인덱스 사용해서 넣어주면됨 설정 수량을 초과할수는없다.
    await metaplex.candyMachines().insertItems({
      candyMachine,
      index: 3,
      items: [
        { name: "bellygom #4", uri: "https://belly.bellygom.world/4.json" },
        { name: "bellygom #5", uri: "https://belly.bellygom.world/5.json" },
        { name: "bellygom #6", uri: "https://belly.bellygom.world/6.json" },
      ],
    });
    updatedCandyMachine = await metaplex.candyMachines().refresh(candyMachine);
    console.log("insertItems 완료", updatedCandyMachine.items);
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
    metaplex.use(keypairIdentity(payer));

    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdr.address.toBase58()),
    });
    if (candyMachine.itemsAvailable.toString() == candyMachine.items.length) {
      return alert("최대발행수까지 세팅되면 수정불가능");
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
      items: [{ name: "d", uri: "d.json" }],
    });

    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("캔디머시 아이템수정", updatedCandyMachine.items);
  };
  /*-------------------------3----------------------------*/
  /** 캔디가드가 무엇인가? 가드생성 */
  const whatCandyGuard = async () => {
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
    metaplex.use(keypairIdentity(payer));
    // withoutCandyGuard:true 이것만 안넣어주면 디폴드값으로 알아서 가드는 생김
    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(10),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        botTax: { lamports: sol(0.01), lastInstruction: false }, //  봇어쩌고
        solPayment: {
          amount: sol(1.5),
          destination: metaplex.identity().publicKey,
        }, //  대금 지갑주소?
        startDate: { date: toDateTime("2022-10-18T16:00:00Z") }, //  시작시간
      },
    });

    console.log("가드가 있는 캔디머신생성", candyMachine.candyGuard);
    setCandyMachineAdr(candyMachine);
  };
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
    console.log("변경된 캔디머신 가드", updatedCandyMachine.candyGuard.guards);
  };
  /** 캔디머신따로 가드따로 생성후 합치기 분리하기 */
  const candyGuardAccountSwap = async () => {
    console.log("loading");
    metaplex.use(keypairIdentity(payer));
    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(3),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      withoutCandyGuard: true, //가드 안쓴다는 명령어
    });
    console.log("가드가 생성되었는지 확인해보셈", candyMachine);

    const { candyGuard } = await metaplex.candyMachines().createCandyGuard({
      guards: {
        botTax: { lamports: sol(0.01), lastInstruction: false },
        solPayment: {
          amount: sol(1.5),
          destination: metaplex.identity().publicKey,
        },
        startDate: { date: toDateTime("2022-10-17T16:00:00Z") },
      },
    });
    console.log("create candyGuard", candyGuard);

    await metaplex.candyMachines().wrapCandyGuard({
      candyMachine: candyMachine.address,
      candyGuard: candyGuard.address,
    });
    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("캔디머신에 캔디가드 연결", updatedCandyMachine);

    await metaplex.candyMachines().unwrapCandyGuard({
      candyMachine: candyMachine.address,
      candyGuard: candyGuard.address,
    });
    updatedCandyMachine = await metaplex.candyMachines().refresh(candyMachine);
    console.log("캔디머신에 캔디가드 연결끊음 ", updatedCandyMachine);
  };
  /** 캔디머신 가드 그룹으로 나누기 */
  const candyMachineGuardGroup = async () => {
    console.log("loading");
    metaplex.use(keypairIdentity(payer));

    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(10),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      groups: [
        {
          label: "early",
          guards: {
            solPayment: {
              amount: sol(1),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
            endDate: { date: toDateTime("2022-10-18T17:00:00Z") },
            botTax: { lamports: sol(0.001), lastInstruction: true },
          },
        },
        {
          label: "late",
          guards: {
            solPayment: {
              amount: sol(2),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T17:00:00Z") },
            botTax: { lamports: sol(0.001), lastInstruction: true },
          },
        },
      ],
    });
    console.log("가드가 그룹 확인해보셈", candyMachine.candyGuard.groups);

    await metaplex.candyMachines().update({
      candyMachine,
      groups: [
        {
          label: "early",
          guards: {
            solPayment: {
              amount: sol(1),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
            endDate: { date: toDateTime("2022-10-18T17:00:00Z") },
            botTax: { lamports: sol(0.001), lastInstruction: true },
          },
        },
        {
          label: "late",
          guards: {
            solPayment: {
              amount: sol(3),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T17:00:00Z") },
            botTax: { lamports: sol(0.001), lastInstruction: true },
          },
        },
      ],
    });
    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log(
      "가드가 업데이트 완료 그룹 확인해보셈",
      updatedCandyMachine.candyGuard.groups
    );
  };
  /** 위에 그룹 중복되는거 밖으로뺄수있음*/
  const candyGuardGroupRepeatMerge = async () => {
    console.log("loading");
    metaplex.use(keypairIdentity(payer));

    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(10),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        botTax: { lamports: sol(0.001), lastInstruction: true },
      },
      groups: [
        {
          label: "early",
          guards: {
            solPayment: {
              amount: sol(1),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
            endDate: { date: toDateTime("2022-10-18T17:00:00Z") },
          },
        },
        {
          label: "late",
          guards: {
            solPayment: {
              amount: sol(2),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T17:00:00Z") },
          },
        },
      ],
    });
    console.log("중복되는가드합쳤음 그룹 확인해보셈", candyMachine);
  };
  /**병렬 가능 화리랑 퍼블같이 판매가능하다는뜻 */
  const candyGuardParallelGroups = async () => {
    console.log(
      "미완성 눈으로만보셈, 병렬로 열려서 동시에 2그룹을 실행할수도잇다"
    );
    metaplex.use(keypairIdentity(payer));

    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(10),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        botTax: { lamports: sol(0.001), lastInstruction: true },
      },
      groups: [
        {
          label: "WL",
          guards: {
            solPayment: {
              amount: sol(1),
              destination: metaplex.identity().publicKey,
            },
            // nftGate: { requiredCollection: innocentBirdCollectionNft.address }, //nft 가지고있는 유저망 통과
          },
        },
        {
          label: "public",
          guards: {
            solPayment: {
              amount: sol(2),
              destination: metaplex.identity().publicKey,
            },
          },
        },
      ],
    });
    console.log("중복되는가드합쳤음 그룹 확인해보셈", candyMachine);
  };
  /** allowList */
  const allowListCandymachine = async () => {
    metaplex.use(keypairIdentity(payer));
    console.log("지금 안됨ㅜㅜ ");
    const allowList = [
      "GjwcWFQYzemBtpUoN5fMAP2FZviTtMRWCmrppGuTthJS",
      "2vjCrmEFiN9CLLhiqy8u1JPh48av8Zpzp3kNkdTtirYG",
      "AT8nPwujHAD14cLojTcB1qdBzA1VXnT6LVGuUd6Y73Cy",
    ];
   
    console.log(getMerkleRoot(allowList));
    console.log("allowList", allowList);

    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(10),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        allowList: { merkleRoot: getMerkleRoot(allowList) },
      },
    });
    console.log(candyMachine);
  };
  /*---------------------------------------------*/
  /** 민팅전  마지막세팅*/
  const candymachineItemFinalSeting = async () => {
    metaplex.use(keypairIdentity(payer));
    console.log('loading');
    const { candyMachine } = await metaplex.candyMachines().create({
      sellerFeeBasisPoints: 333, // 3.33%
      itemsAvailable: toBigNumber(6), //몇개 발행
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      itemSettings: {
        type: "configLines",
        prefixName: "belly gom #",
        nameLength: 1,
        prefixUri: "https://belly.bellygom.world/",
        uriLength: 6,
        isSequential: true,
      },
      guards: {
        botTax: { lamports: sol(0.01), lastInstruction: false }, //  봇어쩌고
      },
      groups: [
        {
          label: "early",
          guards: {
            solPayment: {
              amount: sol(0.1),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
            endDate: { date: toDateTime("2022-10-18T17:00:00Z") },
          },
        },
        {
          label: "late",
          guards: {
            solPayment: {
              amount: sol(0.5),
              destination: metaplex.identity().publicKey,
            },
            startDate: { date: toDateTime("2022-10-18T17:00:00Z") },
          },
        },
      ],
    });

    console.log(
      "만든 캔디머신 주소",
      candyMachine.address.toBase58(),
      candyMachine
    );

    await metaplex.candyMachines().insertItems({
      candyMachine,
      items: [
        { name: "1", uri: "1.json" },
        { name: "2", uri: "2.json" },
        { name: "3", uri: "3.json" },
        { name: "4", uri: "4.json" },
        { name: "5", uri: "5.json" },
        { name: "6", uri: "6.json" },
      ],
    });
    let updatedCandyMachine = await metaplex
      .candyMachines()
      .refresh(candyMachine);
    console.log("캔디머시 이템인서트완료 ", updatedCandyMachine);
    setMintingAdr(updatedCandyMachine)
  };
  /** minting start */
  const mintingstart = async () => {
    metaplex.use(keypairIdentity(payer));
    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey("471qmaiF6TLhUT1ExPkz6xwpPAdYzWXJCjgnpgzQa7b7"),
    });
    
    console.log(
      "찾은 캔디머신 주소",
      candyMachine.address.toBase58(),
      candyMachine,
      candyMachine.mintAuthorityAddress
    );

    // await metaplex.candyMachines().insertItems({
    //   candyMachine,
    //   items: [
    //     { name: "bellygom #1", uri: "https://belly.bellygom.world/1.json" },
    //     { name: "bellygom #2", uri: "https://belly.bellygom.world/2.json" },
    //     { name: "bellygom #3", uri: "https://belly.bellygom.world/3.json" },
    //   ],
    // });
    // console.log('item insert');
    
    const collectionUpdateAuthority = metaplex.identity().publicKey;
    //내생각에 collectionUpdateAuthority 계정을통해서 컬랙션이랑 캔디머신이 연결되어있어서그런거같음 그래서 Authority 나눠서 생성해야될듯 
    const { nft } = await metaplex.candyMachines().mint({
      candyMachine,
      collectionUpdateAuthority,
      owner:new PublicKey('3g4cE28FuqYq45TmkdatMogdu3Ronq7HHnxYzhrSCJ4f')
    });

    console.log("민팅완료", nft);
  };
  /** 가드통해서 민팅  */
  const mintingWhiteGuard = async () => {
    metaplex.use(keypairIdentity(payer));

    const thirdPartySigner = Keypair.generate();
    console.log('thirdPartySigner',thirdPartySigner.publicKey.toBase58());
    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(3),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        thirdPartySigner: { signerKey: thirdPartySigner.publicKey }, //3자지갑세팅
        mintLimit: { id: 1, limit: 2 },           //아이디1개당 2개만 가능
      },
    });
    console.log(
      "캔디머신생성",
      candyMachine.address.toBase58(),
      candyMachine
    );

    await metaplex.candyMachines().insertItems({
        candyMachine,
        items: [
          { name: "bellygom #1", uri: "https://belly.bellygom.world/1.json" },
          { name: "bellygom #2", uri: "https://belly.bellygom.world/2.json" },
          { name: "bellygom #3", uri: "https://belly.bellygom.world/3.json" },
        ],
      });
      console.log('item insert');

    const collectionUpdateAuthority = metaplex.identity().publicKey;

    for (let i = 0; i < 3; i++) {
      const { nft } = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority,
        guards: {
          thirdPartySigner: { signer: thirdPartySigner },   //제3자가 있어야 민팅가능 3자지갑은 만든사람이알겠지?
        },
      });
      console.log('엔프트 발행',nft);
    }
  }
  /** 가드 그룹 나눠서 민팅 */
  const guardGroupMinting = async () => {
    metaplex.use(keypairIdentity(payer));

    const thirdPartySigner = Keypair.generate();
    console.log("트랜잭션 용량이커서 안된다함 thirdPartySigner", thirdPartySigner.publicKey.toBase58());

    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(3),
      sellerFeeBasisPoints: 333, // 3.33%
      collection: {
        address: new PublicKey("FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"),
        updateAuthority: metaplex.identity(),
      },
      guards: {
        botTax: { lamports: sol(0.001), lastInstruction: true },
        // thirdPartySigner: { signerKey: thirdPartySigner.publicKey },
        startDate: { date: toDateTime("2022-10-18T17:00:00Z") },
      },
      groups: [
        {
          label: "nft",
          guards: {
            nftPayment: {
              //컬랙션
              requiredCollection: new PublicKey(
                "FMc5wWNJumx1hdHuJjrU8YnyQwTMKvKGcP7mGurUhPhY"
              ),
              //받을지갑
              destination: new PublicKey(
                "3g4cE28FuqYq45TmkdatMogdu3Ronq7HHnxYzhrSCJ4f"
              ),
            },
            startDate: { date: toDateTime("2022-10-18T16:00:00Z") },
          },
        },
        {
          label: "public",
          guards: {
            solPayment: {
              amount: sol(0.3),
              destination: new PublicKey(
                "3g4cE28FuqYq45TmkdatMogdu3Ronq7HHnxYzhrSCJ4f"
              ),
            },
          },
        },
      ],
    });

    console.log(
      "캔디머신생성",
      candyMachine.address.toBase58(),
      candyMachine
    );

    await metaplex.candyMachines().insertItems({
      candyMachine,
      items: [
        { name: "bellygom #9", uri: "https://belly.bellygom.world/9.json" },
        { name: "bellygom #8", uri: "https://belly.bellygom.world/8.json" },
        { name: "bellygom #7", uri: "https://belly.bellygom.world/7.json" },
      ],
    });
    console.log('insert success');

    const collectionUpdateAuthority = metaplex.identity().publicKey;
    const { nft } = await metaplex.candyMachines().mint({
      candyMachine,
      collectionUpdateAuthority,
      group: "nft",
      guards: {
        // thirdPartySigner: { signer: thirdPartySigner },
        nftPayment: { mint: new PublicKey("FUvY7fc4s4PFjt32DxSXBkE3VaQezQJwmqgudJLdFWNt") },
      },
    });
    console.log("엔프트 발행", nft);
  };
  /*---------------------------------------------*/
  /** 트랜잭션 만들고 보내기*/
  const mkaetransactionAndSend = async () => {
    console.log('loading');
    let fromKeypair = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(
      fromKeypair.publicKey,
      LAMPORTS_PER_SOL * 2
    );
    console.log(
      "코인 드뢉완료,",
      await connection.confirmTransaction(airdropSignature)
    );
    let toKeypair = Keypair.generate();
    console.log(
      "wallet create \n fromKeypair:",
      fromKeypair.publicKey.toBase58(),
      "toKeypair :",
      toKeypair.publicKey.toBase58()
    );

    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL,
      })
    );
    
   console.log(await sendAndConfirmTransaction(connection, transaction, [fromKeypair]))
  };
  /** 코인 tx전송해보기 */
  const getBalanceAndSendCoin = async () => {
    console.log('loading');
    const feePayer = Keypair.fromSecretKey(
      Uint8Array.from([
        251, 11, 45, 81, 62, 13, 86, 73, 81, 22, 130, 118, 64, 244, 168, 106,
        52, 215, 144, 155, 161, 228, 240, 119, 205, 69, 93, 119, 42, 203, 134,
        79, 39, 185, 26, 173, 207, 181, 67, 187, 70, 86, 159, 70, 126, 53, 79,
        140, 232, 191, 99, 83, 228, 168, 2, 160, 152, 55, 38, 95, 210, 195, 3,
        160,
      ])
    );
    let balance = await connection.getBalance(feePayer.publicKey);
    console.log(`form${balance / LAMPORTS_PER_SOL} SOL`);

    
    balance = await connection.getBalance(new PublicKey('Bao3ZumN6trNwe4HU1XMwm4kfXpTKZ56Jw3MYLsUuhiK'));
    console.log(`to ${balance / LAMPORTS_PER_SOL} SOL`);

    let tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: feePayer.publicKey,
        toPubkey: new PublicKey('Bao3ZumN6trNwe4HU1XMwm4kfXpTKZ56Jw3MYLsUuhiK'),
        lamports: 0.3 * LAMPORTS_PER_SOL,
      })
    );
    console.log(tx.feePayer);
    tx.feePayer = feePayer.publicKey;
    console.log(tx.feePayer);
    let txhash = await connection.sendTransaction(tx, [feePayer]);
    console.log(`txhash: ${txhash}`);
  }
  /**민트 후 tx  */
  const createMintSendTx = async () => {
    let mint = Keypair.generate();
    console.log(`mint: ${mint.publicKey.toBase58()}`);

    let tx = new Transaction();
    console.log(TOKEN_PROGRAM_ID);
    tx.add(
      // create account
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        0, // decimals
        payer.publicKey, // mint authority (an auth to mint token)
        null // freeze authority (we use null first, the auth can let you freeze user's token account)
      )
    );
    console.log(
      `민트 발행완료 txhash: ${await sendAndConfirmTransaction(connection, tx, [
        payer,
        mint,
      ])}`
    );

    mint = await getMint(connection, new PublicKey(mint.publicKey.toString()));
    console.log("find mint", mint);
  };
  /** 민트계정에 연결되는 토큰 만들기 */
  const createTokenAccount = async () => {
    console.log(
      `1번 램덤방식 
      주요 개념은 임의의 키 쌍을 만들고 토큰 계정으로 입력!
      이런 방식을 사용하는 것을 추천하지 않는다, 사용자들이 많은 다른 계정을 저장하게 한다.
      토큰 계정 관리를 어렵게 하다`
    );
    const mintPubkey = new PublicKey('8LUdKKUYbGPSZJXbdzjdsEHZt6bkTcBP5DXWwujUfFzV')
    let tokenAccount = Keypair.generate();
    console.log(`ramdom token address: ${tokenAccount.publicKey.toBase58()}`);

    let tx = new Transaction();
    tx.add(
      // create account
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: tokenAccount.publicKey,
        space: ACCOUNT_SIZE,
        lamports: await getMinimumBalanceForRentExemptAccount(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init token account
      createInitializeAccountInstruction(tokenAccount.publicKey, mintPubkey, payer.publicKey)
    );

    console.log(
      `create random token account txhash: ${await connection.sendTransaction(
        tx,
        [payer, tokenAccount]
      )}`
    );

    console.log(
      `2번 관련 토큰 주소(ATA) 
      이렇게 하면 SOL 주소 + 민트 주소로 토큰 주소를 얻을 수 있다!
      그리고 같은 결과가 나올 때마다 같은 SOL 주소와 민트 주소를 전달하면
      SOL 주소만으로 당신의 모든 토큰 주소를 알 수 있기 때문에 토큰 계정을 쉽게 관리할 수 있습니다.`
    );

    let ata = await getAssociatedTokenAddress(
      mintPubkey, // mint
      payer.publicKey, // owner
      false // allow owner off curve
    );
    console.log(`이거는 최초 한번만 발행가능 주소가 계속같으니깐  ata: ${ata.toBase58()}`);
    
    // tx = new Transaction();
    // tx.add(
    //   createAssociatedTokenAccountInstruction(
    //     payer.publicKey, // payer
    //     ata, // ata
    //     payer.publicKey, // owner
    //     mintPubkey // mint
    //   )
    // );
    // console.log(`create ata txhash: ${await connection.sendTransaction(tx, [payer])}`);

    tokenAccount = await getAccount(connection, ata);
    console.log('get Account:',tokenAccount);
  }
  /** 민트하고 토큰 찾고 트랜스퍼 */
  const mintToGetTokenBalanceAndTransfer = async () => {

    const mintPubkey = new PublicKey("8LUdKKUYbGPSZJXbdzjdsEHZt6bkTcBP5DXWwujUfFzV");
    const tokenAccount1Pubkey = new PublicKey("DNd88dpZpaVDg7Ve2P9sMMzG4h2rcW67PYGWEUhjLXjZ");
    const tokenAccount2Pubkey = new PublicKey("dwmDPN32t2E1JUy7nYZ97oFPvMffuAC7nFuS3EsdiJa");
    console.log('2번방식 ATA',tokenAccount1Pubkey.toBase58());
    console.log('1번방식 Random',tokenAccount2Pubkey.toBase58());

    let tx = new Transaction();
    tx.add(
      createMintToCheckedInstruction(
        mintPubkey,   //토큰 주소
        tokenAccount1Pubkey,  //토큰 어카운트 주소
        payer.publicKey, // mint auth
        1, // amount
        0 // decimals
      )
    );
    console.log(
      `txhash: ${await sendAndConfirmTransaction(connection, tx, [payer])}`
    );

    let tokenAccountBalance = await connection.getTokenAccountBalance(tokenAccount1Pubkey);
    console.log(`decimals: ${tokenAccountBalance.value.decimals}, amount: ${tokenAccountBalance.value.amount}`);

    tx = new Transaction();
    tx.add(
      createTransferCheckedInstruction(
        tokenAccount1Pubkey, // from
        mintPubkey, // mint
        tokenAccount2Pubkey, // to
        payer.publicKey, // from's owner
        1, // amount
        0 // decimals
      )
    );

    console.log(`transfer txhash: ${await connection.sendTransaction(tx, [payer])}`);

  };
  const test = () => {
    
    console.log(
      "4gqhY7SiBec7ZG7x6cLrxzTc4PxJraZ9ozKcMobYYZdX"
    );
  };
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
        <h3>해야될일: 3-7allowList추가안됨 </h3>
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
        <button style={{ width: "220px", height: "50px" }} onClick={itemUpdate}>
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
          1.메타데이터 업로드
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
          onClick={candyGuardGroupRepeatMerge}
        >
          5.위에 그룹 나눈거 중복되는거를 보기좋게 합치기
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={candyGuardParallelGroups}
        >
          6.그룹을 사용하여 병열처럼 2개를 동시에 오픈할수도있다 (wl,public)
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={allowListCandymachine}
        >
          7.allowList가 있는 캔디머신
        </button>
        <br />
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={candymachineItemFinalSeting}
        >
          1.민팅할수있는 캔디머신 만들기
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={mintingstart}
        >
          2.가드 없을때 민팅
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={mintingWhiteGuard}
        >
          2.가드사용할때 민팅(제3자사인있어야되고 아이디당 2개)
        </button>
        <br />
        <button
          style={{ width: "220px", height: "50px" }}
          onClick={guardGroupMinting}
        >
          2.가드 그룹통해서 민팅
        </button>
        <br />
        <br />
        <button style={{ width: "220px", height: "50px" }} onClick={mkaetransactionAndSend}>
          1. 트랜잭션 생성 보내기
        </button>
        <br />
        <button style={{ width: "220px", height: "50px" }} onClick={getBalanceAndSendCoin}>
          2. 코인 트랜잭션으로 보내기
        </button>
        <br />
        <button style={{ width: "220px", height: "50px" }} onClick={createMintSendTx}>
          3.민트후 토큰만들기
        </button>
        <br />
        <button style={{ width: "220px", height: "50px" }} onClick={createTokenAccount}>
          4.토큰 Account 만들기
        </button>
        <br />
        <button style={{ width: "220px", height: "50px" }} onClick={mintToGetTokenBalanceAndTransfer}>
          5.mint하고 발행개수찾고 트랜스퍼 해보기
        </button>
        <br />
        <button style={{ width: "220px", height: "50px" }} onClick={test}>
          tttttttttttttt
        </button>
        <br />
      </div>
    </div>
  );
}

export default App;
