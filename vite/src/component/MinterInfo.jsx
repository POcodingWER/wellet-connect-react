import React,{useEffect,useState,useMemo} from 'react'
import OwnableKIP17 from '../abi/MinterKIP17.json'
import Modal from './Modal'
import EditModal from './EditModal'
import dayjs from 'dayjs';
/*
    const zzz =await window.caver.utils.toPeb('1', 'KLAY');  //klay ->peb
    const zzz = window.caver.utils.fromPeb(getSlaeInfo.saleKlayAmount, 'KLAY');   //peb->klay
*/
export default function MinterInfo({mintadr}) {
    const [minterInfo, setMinterInfo] = useState({})
    const [slaeInfo, setslaeInfo] = useState([])
    const [modal,setModal]= useState(false)
    const [editModal,setEditModal]= useState(false)
    const [modalInfo,setModalInfo]= useState({})
    const minterContract = new window.caver.klay.Contract(OwnableKIP17.abi,mintadr);
    let array =[];
    
    const blockNumberToTimestamp = async (blockNumber) => {
        let block;
        try {
            block = await window.caver.klay.getBlock(blockNumber);
            return parseInt(block.timestamp);
        } catch (e) {
          const currentBlockNumber = parseInt(
            await window.caver.klay.getBlockNumber()
          );
          const currentBlockTimestamp = await blockNumberToTimestamp(
            currentBlockNumber
          );
          return (
            currentBlockTimestamp +
            parseInt(blockNumber) -
            parseInt(currentBlockNumber)
          );
        }
      };
    const convertDateToBlockNumber = async (date) => {
        const timestamp = dayjs(date, 'YYYY-MM-DD HH:mm:ss').unix();
        const currentTimestamp = parseInt(Date.now() / 1000);  
        if (currentTimestamp >= timestamp) {
          return await getBlockNumberByTimestamp(timestamp);
        } else {
          return await getBlockNumberByFutureTimestamp(timestamp);
        }
      };

    const convertBlockNumberToDate = async (blockNumber) => {
        const timestamp = await blockNumberToTimestamp(blockNumber);

        return dayjs(Number(timestamp) * 1000).format('YYYY-MM-DD HH:mm:ss');
      };

    useMemo(() => {
        const addressInfo = async ()=>{
            
            const getminterInfo = await minterContract.methods
                .getOptions()
                .call({ from: klaytn.selectedAddress});

                setMinterInfo(getminterInfo);
            
            for (let i = 1; i <= getminterInfo._lastSaleId; i++) {
                const getSlaeInfo = await minterContract.methods
                .getSaleInfo(i)
                .call({ from: klaytn.selectedAddress});
                array.push({...getSlaeInfo,saleId:i,time:await convertBlockNumberToDate(getSlaeInfo.startBlockNumber)})
            } 
            setslaeInfo(array); 
        }
        addressInfo();       
    }, [])

    
    const SaleType = {
        Whitelist : 0,
        Public : 1,
    }
    
    const saleStop = async ()=>{
        if (!confirm('????????? ??????????????????????')) {
            return;
        }
    
        if (!klaytn.selectedAddress) {
            return alert('??????????????? ???????????????.');
        }
        console.log(minterContract);
        const mintgas =await minterContract.methods   //????????? ????????????
            .close()
            .estimateGas({from: klaytn.selectedAddress});

        const tx = await minterContract.methods
            .close()
            .send({
                from:klaytn.selectedAddress,
                gas:mintgas
        });

        if (tx.status) {
            alert('????????? ?????????????????????.');
            window.location.reload();
        } else {
            alert('?????????????????????.');
        }
    }
    
    async function saleStartHandler(saleId, saleType) {
        const alertTypeTxt = saleType === SaleType.Whitelist ? 'Whitelist' : 'Public';
    
        if (!confirm(alertTypeTxt + ' ?????? ?????? ???????????????????')) {
          return;
        }
    
        if (!klaytn.selectedAddress) {
          return alert('??????????????? ???????????????.');
        }
    
        // const tx = await
        //   minterContract,
        //   'open',
        //   [Number(saleId), Number(saleType)],
        //   klaytn.selectedAddress
        // );
        const mintgas =await minterContract.methods   //????????? ????????????
            .open(Number(saleId), Number(saleType))
            .estimateGas({from: klaytn.selectedAddress});

        const tx = await minterContract.methods
            .open(Number(saleId), Number(saleType))
            .send({
                from:klaytn.selectedAddress,
                gas:mintgas
        })
    
        if (tx.status) {
          alert('??????????????? ?????????????????????.');
          window.location.reload();
        } else {
          alert('?????????????????????.');
        }
    }

    const modalOn = ()=>{
        setModal(true)
    }


return (
    <div>
        <br/>
        <table border="1">
                    <tr>
                        <th>?????????</th>
                        <th>?????? ????????????</th>
                        <th>????????? ?????? ?????? ???</th>
                        <th>????????? ????????????(?????????)</th>
                        <th>Token URI</th>
                    </tr>
                    <tr>
                        <td>{minterInfo._isOpen?<p style={{color:'blue'}}>????????????</p>:<p style={{color:'red'}}>?????? ??????</p>}</td>
                        <td>{minterInfo._currentSaleId}</td>
                        <td>{minterInfo._currentSaleType===0?'????????? ??????':'?????????????????? ??????'}</td>
                        <td>{minterInfo._retryBlockAmount}</td>
                        <td>{minterInfo._baseTokenURI}</td>
                    </tr>
        </table>
        <br/>
        <br/>
        <table border="1">
                    <tr>
                        <th>????????????</th>
                        <th>?????? ?????? ??????</th>
                        <th>?????? ?????? ??????	</th>
                        <th>??????</th>
                        <th>NFT ?????? ?????? ??????	</th>
                        <th>?????? ??? ?????? ?????? ??????</th>
                        <th>??????????????? ????????????	</th>
                        <th>Klay ?????? ??????(klay)</th>
                        <th>??????</th>
                    </tr>
                    {slaeInfo ? slaeInfo.map((info,i)=>{
                         const klayc = window.caver.utils.fromPeb(info.saleKlayAmount, 'KLAY');
                        return(
                            <tr key={i}>
                                <td>
                                {Number(minterInfo._currentSaleId) === Number(info.saleId) && minterInfo._isOpen
                                ?<div>
                                    <button onClick={saleStop} >????????????</button>
                                </div>
                                :<div>
                                    <button onClick={()=>{saleStartHandler(info.saleId,SaleType.Whitelist)}} style={{marginRight:10}}>?????????????????? ?????? ??????</button>
                                    <button onClick={()=>{saleStartHandler(info.saleId, SaleType.Public)}}>????????? ?????? ??????</button>
                                </div>
                                }</td>
                                <td>{info.saleId}</td>
                                <td>{info.startBlockNumber}</td>
                                <td>{info.time}</td>
                                <td>{info.lastSaleTokenId}</td>
                                <td>{info.buyAmountPerWallet}</td>
                                <td>{info.buyAmountPerTrx}</td>
                                <td>{klayc}</td>
                                <td> <button onClick={()=>{
                                    setModalInfo({...info,klayc})
                                    setEditModal(true);
                                }}>Edit</button></td>
                            </tr>
                        );
                    })
                    :''}
        </table>
        <br/>
        <br/>
        <button onClick={modalOn}> ?????? ?????? ??????~</button>
        {modal?<Modal setModal={setModal} lastSaleId={minterInfo._lastSaleId} mintadr={mintadr}/>:''}
        {editModal?<EditModal setModal={setEditModal} mintadr={mintadr} modalInfo={modalInfo}/>:''}
        
    </div>
  )
}
