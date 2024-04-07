import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import RefuToken from "./contracts/RefuToken.json";
import './App.css';


function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState(null);

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
          // Establecer cuenta seleccionada
          setSelectedAccount(accounts[0]);

          // Detectar cambios de cuenta
          window.ethereum.on('accountsChanged', function (newAccounts) {
            setAccounts(newAccounts);
            setSelectedAccount(newAccounts[0]);

           // Crear instancia del contrato
           
           const deployedNetwork = RefuToken.networks[networkId];
           console.log(deployedNetwork.address);
           const contractInstance = new web3Instance.eth.Contract(RefuToken.abi, deployedNetwork.address);
           setContract(contractInstance);
           setNetwork(networkId);
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

  return (
    <div className="App">
      <header>
        <nav>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Social impact</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Login</a></li>
            <li><a href="#">Register</a></li>
          </ul>
        </nav>
      </header>
      

      <main>
        <section className="wallet-section">
          <h2>Conectar billetera</h2>
          {web3 && accounts.length > 0 ? (
            <p>Your address: {selectedAccount}</p>
           // <p>Contract: {contract}</p>
           // <p>Network: {network}</p>
          ) : (
            <p>No se pudo conectar la billetera</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
