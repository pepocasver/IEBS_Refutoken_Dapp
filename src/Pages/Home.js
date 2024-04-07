import React from 'react';

const HomePage = () => {
  return (
    <div>
        <div>Esta es la página de Inicio.</div>

        <h1>Welcome to the Refugee Token Dapp</h1>

        {/* Context Information: Account & Network */}
        <div className="Context-information">
        <p> Your address: {this.state.accounts[0]}</p>
        <p> Network connected: {this.state.networkId}</p>
        {this.state.networkId !== 11155111 && <p id="inline">This DAPP is currently working on GANACHE, please press the button</p>}
        {this.state.networkId !== 11155111 && <button onClick={this.switchNetwork}>Switch to Sepolia</button>}
        </div>

    

        {/* RefuToken actions */}
        <><h2>RefuToken actions</h2><div className="RefuToken-actions">

            {/* Input & Button to Get Price */}
            <p> <button id="button-send" onClick={this.getPrice}>Token Price</button> </p>
            {this.state.tokenPrice > 0 && <p><b>Token Price:</b> 1 Ether by {this.state.tokenPrice} RefuTokens</p>}

            {/* Input para monto a comprar &&  Button para comprar  Tokens*/}
            {this.state.tokenPrice > 0 && <input placeholder="Insert RefuToken Quantity" onChange={(e) => this.setState({ value: e.target.value, BuytokenAmount: e.target.value, })}></input>} {this.state.tokenPrice > 0 && <button id="button-send" onClick={this.buyTokens}>Buy Tokens</button>}
            {this.state.value && !isNaN(this.state.value) && <p>You are going to buy {this.state.value} tokens using {this.state.value / this.state.tokenPrice} Ether. In Wei: {this.state.web3.utils.toWei(this.state.value / this.state.tokenPrice, 'ether')}</p>}
            {/* Button buy Tokens */}


            {<p><b>Status:</b> {this.state.isStoped}</p>}

            {/* Button to stop auction */}
            <button id="button-send" onClick={this.stopAuction}>STOP AUCTION</button>
            {<p><b>Status:</b> {this.state.isStoped}</p>}

            {/* Helper to convert wei to ether - {this.state.web3.utils.toWei(this.state.value / this.state.tokenPrice, 'ether') */}


        </div></>

        {/* Button to sign a message (i.e. sign the bid) */}
        <button onClick={this.signMessage}>SIGN MESSAGE</button><div style={{ overflowWrap: "anywhere" }}>
            {this.state.signature && <p>Signed message: {this.state.signature}</p>}
            {this.state.signer && <p>Signer address: {this.state.signer}</p>}
        </div><br /><br /><br /><br />

    </div>
  );
};

export default HomePage;