import Head from 'next/head'
import Web3Modal from "web3modal";
import { Contract, providers, utils} from "ethers";
import { useEffect, useRef, useState } from "react";
import { abi } from "../constants/index.js";
//https://etherscan.io/address/0x1f98431c8ad98523631ae4a59f267346ea31f984#code 
//const { abi: UniswapV3Factory } = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json')
import styles from '../styles/Home.module.css'

export default function Home() {
// Component state
const [walletConnected, setWalletConnected] = useState(false);
const [address0, setAddress0] = useState("");
const [address1, setAddress1] = useState("");
const [fees, setFees] = useState(500);
const [poolAddress, setPoolAddress] = useState("");
//----------------------------------------------------------------------------------------//

// Connect to Metamask  
const web3ModalRef = useRef();

const getProviderOrSigner = async (needSigner = false) => {
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  // If user is not connected to the Goerli network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Change the network to goerli-testnet");
    throw new Error("Change network to goerli-testnet");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};

//---------------------------------------------------------------------------------------//

//Check wallet is connected or not
 const connectWallet = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // When used for the first time, it prompts the user to connect their wallet
    await getProviderOrSigner();
    setWalletConnected(true);

  } catch (err) {
    console.error(err);
  }
};

//--------------------------------------------------------------------------------------//

useEffect(() => {
  // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
  console.log(walletConnected);
  if (!walletConnected) {
    // Assign the Web3Modal class to the reference object by setting it's `current` value
    // The `current` value is persisted throughout as long as this page is open
    web3ModalRef.current = new Web3Modal({
      network: "mainnet",
      providerOptions: {},
      disableInjectedProvider: false,
    });
   // connectWallet();
  }
},[walletConnected]);

//--------------------------------------------------------------------------------------//

const onAddress0Change = (event) => {
  setAddress0(event.target.value.toString());
}

const onAddress1Change = (event) => {
  setAddress1(event.target.value.toString());
}

const onFeesChange = (event) => {
  setFees(event.target.value);
}

//-------------------------------------------------------------------------------------//

//Read-only functions
const UniswapV3FactoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const getPoolAddress= async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner();
  
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const factoryContract = new Contract(
      UniswapV3FactoryAddress,
      abi,
      provider
    );

    console.log("fetching details from the blockchain..");
    console.log(abi);
    console.log(UniswapV3FactoryAddress);
    console.log(factoryContract);

    //Mainnet USD Coin
    //0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

    //Mainnet Weth
    //0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

    // call the getPool from the contract
    const _getPoolAddress = await factoryContract.getPool(address0,address1,500);
    console.log("From contract 0 ",_getPoolAddress);
    await _getPoolAddress;
    console.log("From contract 1",_getPoolAddress);
    setPoolAddress(_getPoolAddress);
   
  
    console.log("fetched!");
    //get the pool address
    console.log("From contract 2",_getPoolAddress);

    console.log(address0);
    console.log(address1);
    console.log(fees);
    console.log(poolAddress);
    // console.log(_createPoolAddress);

    //Reset All Values
    //setAddress0("");
    //setAddress1("");
    //setFees(500);

    
  } 
  
  catch (err) {
    console.error(err);
  }
};


//-----------------------------------------------------------------------------------------//


//https://docs.uniswap.org/protocol/reference/deployments 
//Mainnet Addresses

  return (
    <div className={styles.container}>
    <Head>
      <title>Pool Address Finder</title>
      <meta name="description" content="Pool Address Finder" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    
<main className={styles.main}>
  <h1 className={styles.title}>
        Get Uniswap V3 Pool Address
  </h1>
  <br/>  
{ walletConnected ? (
<div>
  <form>
  <div className="row">

    <div className="col">
    <label>1st Token Address</label>
      <input type="text" className="form-control"  id="address0" placeholder="Asset 1 Address" onChange={onAddress0Change}/>
    </div>
    <br/><br/><br/>

    <div className="col">
    <label>2nd Token Address</label>
      <input type="text" className="form-control"  id="address1" placeholder="Asset 2 Address" onChange={onAddress1Change}/>
    </div>
    <br/><br/><br/><br/><br/><br/>

    <div className="col">
    <label>Select Fee</label>
    <select className="form-select" aria-label="Default select example" onChange={onFeesChange}>
      <option value={500}>500</option>
      <option value={3000}>3000</option>
      <option value={10000}>10000</option>
    </select>
    </div>

        {/* type is button here(important) since not submitting the inputs */}
    <button type="button" className="btn btn-primary mb-2" onClick={getPoolAddress}>Get Pool Address</button>
  </div>
</form>
</div>
) : 
(<button type="button" className="btn btn-primary mb-2" onClick={connectWallet}> Connect your wallet </button>)}
</main> 
{walletConnected && (<h1>{poolAddress}</h1>)}
</div>

  )
}
