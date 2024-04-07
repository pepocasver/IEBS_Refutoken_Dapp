import { useState, useEffect } from "react";
import RefuToken from "./contracts/RefuToken.json";
import Web3 from "web3";
import "./App.css";

function App() {
  const [state, setState] = useState({ web3: null, contract: null });
  const [data, setData] = useState("");
  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545");

    async function template() {
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = RefuToken.networks[networkId];
      const contract = new web3.eth.Contract(
        RefuToken.abi,
        deployedNetwork.address
      );
      console.log(contract);
      setState({ web3: web3, contract: contract });
    }
    provider && template();
  }, []);
  
  useEffect(() => {
    const { contract } = state;
    async function readData() {
      const data = await contract.methods.getPrice().call();
      toString(data);
      setData(data);
      console.log(data);
    }
    contract && readData();
  }, [state]);

  async function writeData() {
    const { contract } = state;
    const data = document.querySelector("#value").value;
    await contract.methods
      .setPrice(data)
      .send({ from: "0x04221915c1Ec977733E3b49848D7BcA20dE6aB78" });
    window.location.reload();
  }

  return (
    <>
      <h1>Welcome to Dapp</h1>
      <div className="App">
        <p className="text">Contract Data : {data} </p>
        <div>
          <input type="text" id="value" required="required"></input>
        </div>

        <button onClick={writeData} className="button button2">
          Change Data
        </button>
      </div>
    </>
  );
}

export default App;