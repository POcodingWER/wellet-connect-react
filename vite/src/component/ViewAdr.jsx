import React,{useState,useEffect,useRef} from 'react'
import OwnableKIP17 from '../abi/MinterKIP17.json'



export default function ViewAdr({mintadr}) {
    const [minterInfo, setMinterInfo] = useState("");
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    const [currentBlockTime, setCurrentBlockTime] = useState(0);
    const [totalSaleAmount, setTotalSaleAmount] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);
    const [scopeURI, setScopeURI] = useState('https://scope.klaytn.com/');
    const blockNumberRef = useRef(0);
    const minterContract = new window.caver.klay.Contract(OwnableKIP17.abi,mintadr);

    useEffect(() => {
        if(klaytn.networkVersion === 1001) setScopeURI('https://baobab.scope.klaytn.com/');
        const addressInfo = async ()=>{
            const adrlog =  await minterContract.methods
                .getAddress()
                .call({ from: klaytn.selectedAddress});
                setMinterInfo(adrlog);
            const totalSaleAmount =  await minterContract.methods
                .tokenIdCounter()
                .call({ from: klaytn.selectedAddress});

            setTotalSaleAmount(totalSaleAmount> 0? totalSaleAmount-1:totalSaleAmount);
            setTotalSupply(totalSaleAmount)
        }
        addressInfo()
    },[] );

    useEffect(() => {       //블록넘 5개블럭마다 싱크맞추고 아니면 ++
        // const getTimeStemp = async ()=>{
        //     const blockNumber = await window.caver.klay.getBlockNumber();
        //     const block = await window.caver.klay.getBlock(blockNumber);
        //     const blockTimestamp = parseInt(block.timestamp);
        //     const dateFormatter = new Date(blockTimestamp * 1000);
        //     // console.log( dateFormatter.getFullYear(),dateFormatter.getMonth()+1,dateFormatter.getDate(),dateFormatter.getHours(),dateFormatter.getMinutes(),dateFormatter.getSeconds())
        //     setCurrentBlockTime(dateFormatter.toISOString().replace(/T/, ' ').replace(/\..+/, '') )
        // }
        // getTimeStemp()
        const interval = setInterval(async() => {
            if(blockNumberRef.current === 0){  
                blockNumberRef.current = await window.caver.klay.getBlockNumber();
                setCurrentBlockNumber(blockNumberRef.current)
            }else if(blockNumberRef.current%5 === 0){
                blockNumberRef.current = await window.caver.klay.getBlockNumber();
                setCurrentBlockNumber(blockNumberRef.current)
                // console.log(blockNumberRef.current,'sync' );
            }else{
               const num = blockNumberRef.current++;
               setCurrentBlockNumber(num);
            }

            const block = await window.caver.klay.getBlock(blockNumberRef.current);
            const blockTimestamp = parseInt(block.timestamp);
            const dateFormatter = new Date(blockTimestamp * 1000);
            setCurrentBlockTime(dateFormatter.toISOString().replace(/T/, ' ').replace(/\..+/, '') )
        }, 1000);
    
        return () => {
            clearInterval(interval);
        };
    },[])
    

  return (
    <div>
        {minterInfo
        ?<div>
            <div>
                <br/>
                <p>NFT address :<a href={scopeURI+"account/"+minterInfo._nftToken} target="_blank">{minterInfo._nftToken}</a></p>
                <p>walletAddress :<a href={scopeURI+"account/"+minterInfo._walletAddress} target="_blank">{minterInfo._walletAddress}</a></p>
                <p>판매대금 지갑주소 :<a href={scopeURI+"account/"+minterInfo._nftToken} target="_blank">{minterInfo._nftToken}</a></p>
            </div>
            <table border="1">
                <tr>
                    <th>현재 블록 번호</th>
                    <th>현재 시간</th>
                    <th>현재까지 발행 NFT ID</th>
                    <th>현재까지 총 발행량</th>
                </tr>
                <tr>
                    <td>{currentBlockNumber}</td>
                    <td>{currentBlockTime}</td>
                    <td>{totalSaleAmount}</td>
                    <td>{totalSupply}</td>
                </tr>
            </table>
        </div>
        :"대기"
        }
    </div>
  )
}
