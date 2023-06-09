const libWallet = new LibWallet();
await libWallet.setup(
    '0xYourContractAddress',  // Replace with your contract address
    'http://localhost:8545',  // Replace with your JSON-RPC URL
    [ /* Your contract ABI goes here */ ]
);