// Import the prerequisites
const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider(endpoint='http://localhost:8545/');

// The following methods use Promises
const example = async () => {

    console.log('running Example');

    // Get the private key from the first account from the ganache-accounts
    // through trufflepig
    const { privateKey } = await loader.getAccount(0);

    console.log('privateKey,', privateKey);

    // Create a wallet with the private key (so we have a balance we can use)
    const wallet = new Wallet(privateKey, provider);

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
        loader,     // Instance of a Loader
        provider,   // Interface to ethereum, e.g. for sending/receiving transactions
        wallet,     // Interface to an Ethereum wallet, e.g. for signing transactions
    });


    // lets take a look at the account's balance!
    await printWalletBalance(wallet);

    // Connect to ColonyNetwork with the adapter!
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();


    // Deploy a new ERC20 token for our Colony.
    // You could also skip this step and use a pre-existing/deployed contract.
    // THIS COSTS MONEY
    const tokenAddress = await networkClient.createToken({
        name: 'Cool Colony Token',
        symbol: 'COLNY',
    });
    console.log('Token address: ' + tokenAddress);

    await printWalletBalance(wallet);


    // Create a Colony!
    const {
        eventData: { colonyId, colonyAddress },
    } = await networkClient.createColony.send({ tokenAddress });

    // Congrats, you've created a Colony!
    console.log('Colony ID: ' + colonyId);
    console.log('Colony address: ' + colonyAddress);

    await printWalletBalance(wallet);

    // get ColonyClient interface object using its ID
    const colonyClient = await networkClient.getColonyClient(colonyId);

    // lets take a look at how many tasks there are
    let taskcount = await colonyClient.getTaskCount.call();
    console.log(taskcount);

    // get an estimate of gas cost for creating a colony
    const estimate = await networkClient.createColony.estimate({
        tokenAddress: tokenAddress
    });

    console.log(estimate.toString());


    // // For a colony that exists already, you just need its ID:
    // const colonyClient = await networkClient.getColonyClient(colonyId);
    //
    // // Or alternatively, just its address:
    // // const colonyClient = await networkClient.getColonyClientByAddress(colonyAddress);
    //
    // // You can also get the Meta Colony:
    // const metaColonyClient = await networkClient.getMetaColonyClient();
    // console.log('Meta Colony address: ' + metaColonyClient.contract.address);
};

const printWalletBalance = async (wallet) => {
    let balance = await wallet.getBalance();
    console.log(balance.toString());
};

example()
    .then(result => {
        console.log('Result:',result);
    })
    .catch(err => {
        console.log(err);

        console.log(err.stack);

    });
const test = async () => {
    // const colonyClient = await networkClient.getColonyClient()
};