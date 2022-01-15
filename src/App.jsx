import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Linkify from 'react-linkify';
import './App.css';
import memePortal from './utils/MemePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allMemes, setAllMemes] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x7286431361854C77B611A37484050784B775E9bb";

  const getAllMemes = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const memePortalContract = new ethers.Contract(contractAddress, memePortal.abi, signer);

        const memes = await memePortalContract.getAllMemes();

        let memesCleaned = [];
        memes.forEach(meme => {
          memesCleaned.push({
            address: meme.memer,
            timestamp: new Date(meme.timestamp * 1000),
            message: meme.message
          });
        });

        // memesCleaned.sort((a, b) => a.timestamp > b.timestamp)

        // console.log(memesCleaned);

        setAllMemes(memesCleaned);

        memePortalContract.on("NewMeme", (from, timestamp, message) => {
          console.log("NewMeme", from, timestamp, message);

          setAllMemes(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });


      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have Metamask");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found a valid account:", account);
        setCurrentAccount(account);
        getAllMemes();
      } else {
        console.log("No valid account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("You need Metamask");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  function inputLink(event){
    setMessage(event.target.value)
    console.log("Link entered: ", event.target.value)
  }

  const meme = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const memePortalContract = new ethers.Contract(contractAddress, memePortal.abi, signer);

        let count = await memePortalContract.getTotalMemes();
        console.log("Retrieved total meme count...", count.toNumber());

        const memeTxn = await memePortalContract.meme(message, { gasLimit: 300000 });
        console.log("Mining...", memeTxn.hash);

        await memeTxn.wait();
        console.log("Mined --", memeTxn.hash);

        count = await memePortalContract.getTotalMemes();
        console.log("Retrived total meme count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }  

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
    
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        Got Jokes?
        </div>

        <div className="bio">
          Send in a link of your best meme and <i>potentially</i> win some ETH for it!
        </div>

        <br></br>

        <textarea value={message} className="message" onChange={inputLink} placeholder= "Paste link to meme">
        </textarea>

        <button className="memeButton" onClick={meme}>
          Send a Meme
        </button>

        {!currentAccount && (
          <button className="memeButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <br></br>
        <div className="divider">
          Meme Log 
        </div>
        <div className="subDivider">
          Take a look at all the other memes that have been sent 😉
        </div>

        {allMemes.map((meme, index) => {
          return (
            <div className="userInputs">
              <div class="allText">👋 <b>Sender:</b> {meme.address}</div> 
              <br></br>
              <div class="allText">📅 <b>Sent at:</b> {meme.timestamp.toString()}</div> 
              <br></br>
              <div class="allText">😂 <b>Meme:</b> <Linkify> {meme.message} </Linkify> </div>
            </div>)
        })}
      </div>
    </div>
  );
}
export default App

// 0x7286431361854C77B611A37484050784B775E9bb

// 0x5FbDB2315678afecb367f032d93F642f64180aa3