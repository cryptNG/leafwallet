const sc = artifacts.require("libwallet");
const truffleAssertions = require('truffle-assertions');
const Web3 = require('web3');
const BN = require('bn.js');

contract('libwallet: full integration', async (accounts) => {
    const [deployerAddress, account1, account2] = accounts;
   
    const web3 = config.network==='develop' ||  config.network==='test'? new Web3('http://127.0.0.1:9545'):await (async (config)=>{
        throw `config.networks[${config.network}].web3Uri not set in truffle-config.js` 
        return await new Web3(config.networks[config.network].web3Uri); 
    })(config);

    it("should assert true", async function () {
      let token = await sc.deployed();   
      return assert.isTrue(true);
    });

              
    it("should see that sender is not registered", async function () {
      let instance = await sc.deployed();   
      let result = await instance.isSenderRegistered();
      return assert.isFalse(result);
    });

    it("should see that sender is registered", async function () {
      let instance = await sc.deployed();   
      
      await instance.assignAddressToSender(accounts[0],{from: accounts[1]});
      let result = await instance.isSenderRegistered({from: accounts[0]});
      return assert.isTrue(result);
    });
    

  });