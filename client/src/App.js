import React, { Component } from "react";
import nft from "./contracts/NFT.json";
import getWeb3 from "./getWeb3";

import "./App.css";

window.ethereum.on("accountsChanged", async () => {
  window.location.reload(false);
});

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    balance: 0,
  };
  mintNFT = this.mintNFT.bind(this);

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = nft.networks[networkId];
      const instance = new web3.eth.Contract(
        nft.abi,
        deployedNetwork && deployedNetwork.address
      );
      console.log(instance);
      let balance = await web3.eth.getBalance(accounts[0]);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { web3, accounts, contract: instance, balance },
        this.runExample
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { web3, accounts, contract } = this.state;
    const totalSupply = await contract.methods.totalSupply().call();
    console.log(totalSupply);
    const uri = await contract.methods.balanceOf(accounts[0]).call();
    console.log(uri);
    const owner = await contract.methods.ownerOf(totalSupply).call();
    console.log(owner);
    const Approved = await contract.methods
      .approve(owner, 3)
      .send({ from: "0xC3bB87EDCBF01cEE0b3931924d1CaD523466709E" });
    console.log(Approved);
  };

  async mintNFT() {
    const { web3, accounts, contract } = this.state;
    const mintPrice = web3.utils.toWei("1", "ether");
    const ouai = await contract.methods
      .mint()
      .send({ from: accounts[0], value: mintPrice });
    console.log(ouai);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          {this.state.web3.utils.fromWei(this.state.balance.toString())} ether
        </p>
        <button onClick={this.mintNFT}>Mint</button>
      </div>
    );
  }
}

export default App;
