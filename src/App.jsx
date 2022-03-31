import React, {useEffect,useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState([]);
  const contractAddress = "0x7ea3566D9DdCdee92B83498528747b002866E738"
  const contractABI = abi.abi;

  const getAllWaves = async ()=>{
    try{
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave=>{
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        setAllWaves(wavesCleaned);
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error){
      console.log(error);
    }
  }

  
  const checkIfWalletIsConnected = async () =>{
    
    try{   
      const {ethereum} = window;
  
      if (!ethereum){
        console.log("Make sure you have metamask!");
      }else{
        console.log("We have the ethereum object",ethereum);
      }

      const accounts = await ethereum.request({method: "eth_accounts"});

      if (accounts.length !==0){
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves()
      }else{
        console.log("No authorized account found")
      }
    }catch(error){
      console.log(error);
    }
  }


  const connectWallet = async () => {

    try {
      const {ethereum} = window;

      if(!ethereum){
        alert("Get Metamask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(error){
      console.log(error)
    }
  }

  const handleChange = async (event)=>{
    await setMessage(event.target.value);
    console.log(message)
  }

  const wave = async (event) => {
    event.preventDefault()
    try{
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message,{ gasLimit: 300000 });    
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrived total wave count...', count.toNumber());
        getAllWaves()
      }else{
        console.log("Ethereum object doesnt exist!");
      }
    }catch(error){
      console.log(error);
    }
  }
  
  useEffect(()=>{
    checkIfWalletIsConnected();
  },[])
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Type a message in the text box below and hit send to send a wave and message to the blockchain
        </div>
        <form onSubmit={wave}>
          <input onChange={handleChange} type="text"></input>
          <input className="waveButton" type="submit" value="Send"/>
        </form>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
