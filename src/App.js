import React, { Component } from "react";
//import ReactDOM from "react-dom";
import RefuToken from "./contracts/RefuToken.json";
import getWeb3 from "./helpers/getWeb3";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";



// Importar componentes de las páginas
import Header from './Header';
//import HomePage from "./Pages/Home";
import AdminPage from "./Pages/Admin";
import MyBalancePage from './Pages/MyBalancePage';

//require("dotenv").config();
//const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
//const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
//const web3 = createAlchemyWeb3(alchemyKey);


//const CONTRACT_ADDRESS = "0xC44F32496471de15A5fF444eD312500615Fd8e78" //Ganache
const CONTRACT_ADDRESS = "0xB85CD5E461e7D79304BC4aB41D9474C1DFFCb872" //Sepolia
const CONTRACT_ABI = require("./contracts/RefuToken.json").abi

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
       web3: null,
       accounts: null, 
       contract: null,
       tokenPrice: 0, 
       isStopped: 'Y',
       BuytokenAmount: null,
       setBuyEthAmount: null,
       setTransactionStatus: null,
       RefuBalance: null,
       AssetNum: null,
       AssetSupply: null,
       AssetName: null,
       LendTokenAmount: null,
       AssetFractBalance: null,
       Error: null
    }
  }   
  
  componentDidMount = async () => {
   // try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the network ID
      var networkId = await web3.eth.net.getId();
      networkId = Number(networkId);
      const deployedNetwork = RefuToken.networks[networkId];

      // Check if the Smart Contract is deployed on Network with ID: XY
      if (deployedNetwork === undefined) {
        // alert("Por favor, conectate a Ganache para continuar utilizando la aplicacion");
        this.setState({ web3, accounts, networkId })
        return;
      }

      // Create the Smart Contract instance
      const instance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, networkId, contract: instance });

   /*/ } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }*/
  };

  componentDidUpdate() {
    this.handleMetamaskEvent();
    //this.handleContractEvent()
   
  }


  // --------- METAMASK EVENTS ---------
  handleMetamaskEvent = async () => {
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      alert("Incoming event from Metamask: Account changed")
      window.location.reload()
    })

    window.ethereum.on('networkChanged', function (networkId) {
      // Time to reload your interface with the new networkId
      alert("Incoming event from Metamask: Network changed")
      window.location.reload()
    })
  }

  switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: this.state.web3.utils.toHex(11155111)
          }
        ]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: this.state.web3.utils.toHex(11155111),
                chainName: 'Sepolia',
                rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'] /* ... */,
              },
            ],
          });
        } catch (addError) {
          console.log(addError)
        }
      }
    }
  }

   // Función para conectar la billetera
  connectWallet = async () => {
    try {
      // Solicitar acceso a la billetera
      await window.ethereum.enable();
      
      // Actualizar cuentas
      const accounts = await this.state.web3.eth.getAccounts();
      this.setAccounts(accounts);
      this.setSelectedAccount(accounts[0]);

      // Limpiar errores si la conexión fue exitosa
      this.setError('');
    } catch (error) {
      console.error('Error al conectar la billetera', error);
      this.setError('Error: ' + error.message);
    }
  };

  // --------- SMART CONTRACT EVENTS ---------
  /*handleContractEvent = async () => {
    if (!this.state.contract) return
    this.state.contract.events.PriceSet([])
      .on("connected", function (subscriptionId) {
        console.log("New subscription with ID: " + subscriptionId)
      })
      .on('data', function (event) {
        console.log("New event:")
        console.log(event)
        alert("New Highest BID 🤑 💰 💸")
      })
    // this.state.contract.once("Status",function(error, event){ console.log(event); });
  }*/


    // Get Token Price FUNCTION
    getPrice = async () => {
      const {  contract } = this.state;
      // Get the value of price
      var tokenPrice = await contract.methods.getPrice().call();
      console.log(tokenPrice);
      tokenPrice = Number(tokenPrice);
      // Update state with the result.
      this.setState({ tokenPrice: tokenPrice});
    };

    // Get Refutoken Balance FUNCTION
    getTokenBalance = async () => {
      const {  contract } = this.state;
      // Get the value of price
      var tokenBalance = await contract.methods.REFUbalanceOf(this.state.accounts[0]).call();
      console.log(tokenBalance);
      tokenBalance = Number(tokenBalance);
      // Update state with the result.
      this.setState({ RefuBalance: tokenBalance});
    };

    // Función para comprar tokens (CustomerBuyToken en el smartContract)
      buyTokens = async () => {
      if (!this.state.web3) {
        this.setState({Error: 'Web3 is not available'});
        return;
      }

      if (!this.state.BuytokenAmount || isNaN(this.state.BuytokenAmount)) {
        this.setState({Error: 'Please enter a valid amount'});
        return;
      }

      if (!this.state.contract) {
        this.setError({Error: 'Contract is not available'});
        return;
      }

      try {

        // Calculate token amount
        var EthAmmount = this.state.BuytokenAmount / this.state.tokenPrice;
        EthAmmount = this.state.web3.utils.toWei(Number(EthAmmount), 'ether') //comvertimos a wei
        this.setState ( {setBuyEthAmount: EthAmmount});
        console.log(EthAmmount);
        console.log(this.state.BuytokenAmount);
        // Send transaction to the contract to buy tokens
        const { contract } = this.state;

        var result =  await contract.methods.CustomerBuyToken(this.state.BuytokenAmount)
        .send({
          from: this.state.accounts[0],
          value: EthAmmount
      });
  
      //  window.location.reload();
        console.log( result );

        // Update transaction status
       // this.setTransactionStatus(`Transaction successful. Purchased ${this.state.BuytokenAmount} tokens.`);
      } catch (error) {
        console.error('Error buying tokens:', error);
        this.setState({Error: '' + error.message});
      }
    };

  //Crear assets
    createAsset = async () => {
      const { contract } = this.state;
      try{
      
        const casset = await contract.methods.createAsset(this.state.AssetSupply, this.state.AssetName).send({ from: this.state.accounts[0] });
        console.log(casset);
      }
      catch (error) {
        console.error('Error creating asset:', error);
        this.setState({Error: '' + error.message});
      }
      
    }

   //Consulta assets
     QueryAsset = async () => {
      const { contract } = this.state;
      try{
       
        const asset = await contract.methods.tokenizedAssets(this.state.AssetNum).call();
        console.log(asset);
        this.setState({ AssetSupply: Number(asset[1]), AssetRem: Number(asset[2]), AssetName: asset[3]})
      }
      catch (error) {
        console.error('Error creating asset:', error);
        this.setState({Error: '' + error.message});
      }
      
    }

     //Prestamos de Refutoken a asset
     LendToAsset = async () => {
      const { contract } = this.state;
      try{
        console.log(this.state.AssetNum);
        console.log(this.state.LendTokenAmount);
        const asset = await contract.methods.CustomerBuyAsset(this.state.AssetNum, this.state.LendTokenAmount).send({ from: this.state.accounts[0] });  
        console.log(asset);
    

        const result = await contract.methods.fractionalOwnership(this.state.AssetNum, this.state.accounts[0]).call();
        this.setState( {AssetFractBalance: Number(result) })
        console.log(result);
      }
      catch (error) {
        console.error('Error lending to asset:', error);
        this.setState({Error: '' + error.message});
      }
      
    }
    
  // Emergency Sotop  FUNCTION
  emergencyStop = async () => {
    const { contract } = this.state;

      // Get the new values: isActive and newOwner
     const isStopped =  await contract.methods.emergencyStop(true).call();
     console.log(isStopped);
     
   
    // Update state with the result.
    if(!isStopped)
    this.setState({ isStopped: false });
  }
 
  render() {

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        
         <Router>
          <div>
          <Header />
          <main>
            <h1>Welcome to the Refugee Token Dapp</h1>
            <section className="wallet-section">
              {this.state.web3 && this.state.accounts[0].length > 0 ? (
                <h2>Wallet Connected</h2>
              ) : (
                <div>
                  <p>Wallet coud not be connected</p>
                  <button onClick={this.connectWallet}>Connect Wallet</button>
                </div>
              )}
              {/* Resto del código permanece igual */}
            </section>
          </main>
          
          <section className="Account-section">
            {/* Context Information: Account & Network */}
            <div className="Context-information">
              <p> Your address: {this.state.accounts[0]}</p>
              <p> Network connected: {this.state.networkId}</p>
              {this.state.networkId !== 11155111 && <p id="inline">This DAPP is currently working on GANACHE, please press the button</p>}
              {this.state.networkId !== 11155111 && <button onClick={this.switchNetwork}>Switch to Sepolia</button>}
            </div>
          </section>
          <br></br><br></br>

          {/* RefuToken information */}
          <section className="RefuInfo-section">
            <div className="RefuToken-information">
              <div className="RefuToken-information-img">
                {/* RefuToken Image 
                <img src="https://bafybeifzm6xqduwgl6lwjyabj2v5qwduwqgotr6hjj5cu632ldtu6zbw4a.ipfs.nftstorage.link/"></img>
                 */}
                {/* RefuToken Description 
                <h3>{this.state.auctionInfo[0]}</h3> */}

                {/* RefuToken Status 
                {this.state.isActive ? <p>The auction is still active!! 🤩 🤩</p> : <p><b>The auction is not longer active </b>😭 😭</p>}  */}
              </div>

              <div className="RefuToken-information-text">

              </div>
            </div>
          </section>

            <Routes>
              <Route path="/"/>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/my-balance" element={<MyBalancePage />} />
              {/* Aquí puedes agregar más rutas para otras páginas */}
            </Routes>
          </div>
        </Router>


          {/* RefuToken actions */}
          <h2>RefuToken Actions</h2>
          <div className="RefuToken-actions">

            <h3>RefuToken Get Price</h3>
              {/* Input & Button to Get Price */}
              <p> <button id="button-send-price" onClick={this.getPrice}>Token Price</button> </p>
              {this.state.tokenPrice > 0 && <p><b>Token Price:</b> 1 Ether by {this.state.tokenPrice} RefuTokens</p> }
          
              {this.state.tokenPrice > 0 && <h3>Buy RefuTokens</h3>}
              {/* Input para monto a comprar &&  Button para comprar  Tokens*/}
              {this.state.tokenPrice > 0 && <input placeholder="Insert RefuToken Quantity" onChange={(e) => this.setState({ value: e.target.value, BuytokenAmount: e.target.value, })}></input> } {this.state.tokenPrice > 0 && <button id="button-send" onClick={this.buyTokens}>Buy Tokens</button> }
              {this.state.value && !isNaN(this.state.value) && <p>You are going to buy {this.state.value} tokens using {this.state.value / this.state.tokenPrice} Ether. In Wei: {this.state.web3.utils.toWei(this.state.value / this.state.tokenPrice, 'ether') }</p>}
              <br></br>
            
            <h3>RefuTokens Balance</h3>
              {/* Input para mostrar balance de RefuTokens*/}
              {<button id="button-send-RefuBalance" onClick={this.getTokenBalance}>Get RefuToken Balance</button> }
              {this.state.RefuBalance != null && 
              <p>Your Refutoken balance is: {this.state.RefuBalance}</p>}

            <h3>Create Apartment</h3>     
              {/* Input para crear Apartamento*/}
              {<p>Provide Total Supply for Apartment: 
              <input placeholder="Total Supply of Tokens" onChange={(e) => this.setState({ AssetSupply: e.target.value, })}></input></p>}
              {<p>Provide Name for Apartment: 
              <input placeholder="Name of Apartment" onChange={(e) => this.setState({ AssetName: e.target.value, })}></input> </p>}
              {<button id="button-create-aprtmnt" onClick={this.createAsset}>Create Apartment</button> }
              <br></br><br></br>

            <h3>Query Apartment</h3>   
              {/* Input para consultar Apartamentos*/}
              {<p>Provide Apartment Number: 
              <input placeholder="Number" onChange={(e) => this.setState({ AssetNum: e.target.value, })}></input></p>}
              {<button id="button-query-aprtmnt" onClick={this.QueryAsset}>Query Apartment</button> }
              <br></br>
              {<p>Apartment Supply: <b>{this.state.AssetSupply}</b></p>}
              {<p>Apartment Remaing: <b>{this.state.AssetRem}</b></p>}
              {<p>Apartment Name: <b>{this.state.AssetName}</b></p>}
              <br></br>

            <h3>Lend RefuToken to Apartment</h3>   
              {/* Input para prestart token a Apartamento*/}
              {<p>Provide Apartment Number: 
              <input placeholder="AssetNumber" onChange={(e) => this.setState({ AssetNum: e.target.value, })}></input></p>}
              {<p>Provide REFUTOKEN Amount to Lend: 
              <input placeholder="NumberToLend" onChange={(f) => this.setState({ LendTokenAmount: f.target.value, })}></input></p>}
              {<button id="button-send-lend" onClick={this.LendToAsset}>Lend to Apartment</button> }  
              { this.state.AssetFractBalance != null && <p>Your Refutoken balance lent to Apartment <b>{this.state.AssetNum}</b> is: <b>{this.state.AssetFractBalance}</b></p>}
      

            {/* Button to stop refutoken 
            <button id="button-send" onClick={this.emergencyStop}>STOP REFU</button>
            {<p><b>Status:</b> {this.state.isStopped}</p> } */}

            {/* Helper to convert wei to ether - {this.state.web3.utils.toWei(this.state.value / this.state.tokenPrice, 'ether') */}
        
          
          </div>

          <br /><br /><br /><br />

          
          <br /><br /><br /><br />

      </div >
    );
  }
}

export default App;

//const rootElement = document.getElementById("root");
//ReactDOM.render(<App />, rootElement);