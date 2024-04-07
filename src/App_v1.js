import Web3 from "web3";
import RefuToken from "./contracts/RefuToken.json"
// Import helper functions
import {useState, useEffect} from "react";
import './App.css';


function App() {
  const[state, setState] = useState({ web3: null, contract: null });
  useEffect(()=>{
      const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545");
      async function template() {
      const web3 = new Web3(provider);
      //console.log(web3);
      const networkId = await web3.eth.net.getId(); //to get contract address
      const deployedNetwork = RefuToken.networks[networkId];
      console.log(deployedNetwork.address);
      //interaccion with smart cotract
      //1) ABI
      //2) Contract address

      const contract = new web3.eth.Contract(RefuToken.abi,deployedNetwork.address);
      console.log(contract);
      setState({web3:web3, contract:contract})
      }
      provider && template();
  },[]);

  useEffect(()=>{
    const {contract}=state;
    async function readData(){
      const data = await contract.methods.totalSupply().call();
      console.log(data);
    }
    contract && readData();
  },[state])

  return <div className="App">
  <header>
    <nav>
      <ul>
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Sobre nosotros</a></li>
        <li><a href="#">Servicios</a></li>
        <li><a href="#">Contacto</a></li>
      </ul>
    </nav>
  </header>
  <main>
    {/* Contenido de la página */}
  </main>
</div>
}

export default App;
