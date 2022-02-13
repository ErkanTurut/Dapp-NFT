import React, { Component } from "react";
import nft from "./contracts/NFT.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import ipfs from "./ipfs";

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
    totalSupply: 0,
    userCollections: [],
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

      //get user nft collection
      const collection_balance = await instance.methods
        .balanceOf(accounts[0])
        .call();

      let balance = await web3.eth.getBalance(accounts[0]);

      for (var i = 1; i <= collection_balance; i++) {
        const collection = await instance.methods
          .tokenOfOwnerByIndex(accounts[0], i - 1)
          .call();
        this.setState({
          userCollections: [...this.state.userCollections, collection],
        });
      }

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
    const { web3, accounts, contract, userCollections } = this.state;
    console.log(userCollections.length);

    for (var i = 0; i < userCollections.length; i++) {
      const collection = await contract.methods
        .tokenURI(userCollections[i])
        .call();
      //await getData(hash);
      const link = await collection.replace("ipfs://", "");
      console.log(link);
      const { cid } = await ipfs.dag.resolve(link);
      console.log(cid._baseCache.get("z"));
      const t = await ipfs.cat(cid._baseCache.get("z"));
      console.log(t);

      for await (const itr of t) {
        let data = Buffer.from(itr).toString();
        console.log(data);
        return data;
      }

      //const ipfs_file = ipfs.get(cid._baseCache.cat("z"));

      //console.log(ipfs_file);
    }

    const owner = await contract.methods.ownerOf(8).call();
    console.log(owner);
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
        <p>Account : {this.state.accounts} </p>
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
