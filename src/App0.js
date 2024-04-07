import React, { useState, useEffect } from 'react';
import RefuToken from "./contracts/RefuToken.json";
import './App.css';


// Importar web3
import Web3 from 'web3';



function App() {

  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkId, setNetwork] = useState(null);
  const [BuytokenAmount, setBuytokenAmount] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [tokenPrice, setPrice] = useState('');
  const [error, setError] = useState('');
  const [BuyAmountEth, setBuyEthAmount] = useState('');

  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      accounts: null,
      selectedAccount: null,
      contract: null,
      networkId: null,
      BuytokenAmount: null,
      investmentAmount: null,
      error: null,
      BuyAmountEth: 0,
      tokenPrice: 0, 
      isStoped: 'Y'
    }
  }   
  


  useEffect(() => {
    // Cargar Web3
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);


        try {
          // Solicitar acceso a la billetera
          await window.ethereum.enable();

          // Obtener cuentas
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);

          const networkId = await web3Instance.eth.net.getId(); //to get contract address
          console.log(networkId);
          // Establecer cuenta seleccionada
          setSelectedAccount(accounts[0]);

         // Crear instancia del contrato
          const deployedNetwork = RefuToken.networks[networkId];
          console.log(deployedNetwork.address);
          const contractInstance = new web3Instance.eth.Contract(RefuToken.abi, deployedNetwork.address);
          setContract(contractInstance);
          setNetwork(networkId);
          
          // Detectar cambios de cuenta
          window.ethereum.on('accountsChanged', function (newAccounts) {
            setAccounts(newAccounts);
            setSelectedAccount(newAccounts[0]);
          });
        } catch (error) {
          console.error('Usuario denegó el acceso a la billetera', error);
        }
      } else {
        console.error('MetaMask no está instalado');
      }
    };
  loadWeb3();
  }, []);

  // Función para conectar la billetera
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        setSelectedAccount(accounts[0]);
      } catch (error) {
        console.error('Error al conectar la billetera:', error);
      }
    }
  };

  // ------------ READ TOKEN PRICE  ------------

  /*useEffect(() => {
    const getTokenPrice = async () => {
      const tokenPrice = await contract.methods.getPrice().call();
      console.log(tokenPrice);
      setPrice( tokenPrice );
    };
    getTokenPrice();
  });*/


  const getTokenPrice = async () => {
    const {  contract } = this.state;
  
    // Bid at an auction for X value
    //await contract.methods.getPrice().call();

    // Get the new values: highest price and bidder, and the status of the auction
    var tokenPrice = await contract.methods.getPrice().call();
    console.log(tokenPrice);
    tokenPrice = Number(tokenPrice);
    // Update state with the result.
    this.setState({ tokenPrice: tokenPrice});
    } 


  // Función para manejar cambios en el campo de entrada de compra
  const handleBuyChange = (event) => {
    setBuytokenAmount(event.target.value);
  };


  // Función para comprar tokens (CustomerBuyToken en el smartContract)
  const buyTokens = async () => {
    if (!web3) {
      setError('Error: Web3 is not available');
      return;
    }

    if (!BuytokenAmount || isNaN(BuytokenAmount)) {
      setError('Error: Please enter a valid amount');
      return;
    }

    if (!contract) {
      setError('Error: Contract is not available');
      return;
    }

    try {
      // Calculate token amount

      const EthAmmount = BuytokenAmount / tokenPrice;

      setBuyEthAmount(EthAmmount);

      // Send transaction to the contract to buy tokens
      var result = await contract.methods.CustomerBuyToken().send({
        from: selectedAccount,
        value: EthAmmount
        //value: web3.utils.toWei(BuytokenAmount.toNumber(), 'ether')
      });

      console.log( result );

      // Update transaction status
      setTransactionStatus(`Transaction successful. Purchased ${BuytokenAmount} tokens.`);
    } catch (error) {
      console.error('Error buying tokens:', error);
      setError('Error: ' + error.message);
    }
  };

  // Función para manejar cambios en el campo de entrada de inversión
  const handleInvestmentChange = (event) => {
    setInvestmentAmount(event.target.value);
  };

  // Función para interactuar con el contrato e invertir tokens (transferOwnership)
  const invertirTokens = async () => {
    if (contract && investmentAmount !== '' && !isNaN(investmentAmount)) {
      try {
        // Convertir la cantidad de inversión a Wei (la unidad más pequeña de Ethereum)
        const investmentWei = web3.utils.toWei(investmentAmount, 'ether');

        // Enviar la transacción al contrato para invertir tokens
        const result = await contract.methods.transferOwnership(investmentWei).send({ from: selectedAccount, value: investmentAmount });

        // Actualizar el estado de la transacción
        setTransactionStatus('Transacción exitosa: ' + result.transactionHash);
      } catch (error) {
        console.error('Error al invertir tokens:', error);
        setTransactionStatus('Error: ' + error.message);
      }
    } else {
      setTransactionStatus('Por favor, ingrese una cantidad válida');
    }
  };



  return (
    <div className="App">
      <header>
        <nav>
          <ul>
           <li><a href="#">About Us</a></li> 
            <li><a href="#">Social Impact</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Login</a></li>
            <li><a href="#">Register</a></li>
          </ul> 
        </nav>
      </header>
      <main>
        <section className="wallet-section">
          <h3>Connect to Wallet</h3>
          {web3 && accounts.length > 0 ? (
            <p>Billetera conectada.  Cuenta seleccionada: {selectedAccount}</p>
          ) : (
            <button onClick={connectWallet}>Connect your Wallet</button>
          )}
          
          <button onClick={getTokenPrice}>Token Price</button>
          {<p>Token Price: {tokenPrice}</p>}

          
          <button onClick={buyTokens}>Buy Tokens</button>
          <input
            type="text"
            value={BuytokenAmount}
            onChange={handleBuyChange}
            placeholder="Enter number of Tokens"
          />
           <input
            type="text"
            value={BuyAmountEth}
            onChange={handleBuyChange}
            placeholder="Your ETH amount is"
          />


          <button onClick={invertirTokens}>Lend Tokens</button>
          <input
            type="text"
            value={investmentAmount}
            onChange={handleInvestmentChange}
            placeholder="Cantidad de tokens a invertir"
          />
           
          {error && <p className="error">{error}</p>}
          {transactionStatus && <p>{transactionStatus}</p>}
        
        </section>
      </main>
    </div>
  );
}

export default App;
