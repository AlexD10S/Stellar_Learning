//Stellar JS SDK create an account and fund it with XLM.

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');

// an arbitary list of trusted assets
const ASSETS = {
    'MUR': new StellarSdk.Asset('MUR', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //name, ISSUER ACC
    'USDT': new StellarSdk.Asset('USDT', 'GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V'),
    'MOBI' : new StellarSdk.Asset('MOBI', 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH'),
    'XLM': StellarSdk.Asset.native()
}

// helper function to get desired asset object
const getAsset = (asset) => {
    if (ASSETS[asset]) return ASSETS[asset]
    return StellarSdk.Asset.native() 
}

//create the distributor account keypair
var distributorSecret = "S..."; //get from database?
const distributorKeypair = StellarSdk.Keypair.fromSecret(distributorSecret) //DISTRIBUTOR ACCOUNT
//create the new account keypairs to use
var newAccountKeypair = StellarSdk.Keypair.random();
var newAccount = newAccountKeypair.publicKey(); // newAccount public key
var newAccountSecret = newAccountKeypair.secret();
console.log("New Account Public Key is: " + newAccount); //save to database
console.log("New Account Secret Key is: " + newAccountSecret);//save to database

const signers = [distributorKeypair]; //array of the keypairs to be used to sign the Tx, must be initialised, is added to later.

// 'load' the account (really, all it's getting is the next tx sequence number)
server.loadAccount(distributorKeypair.publicKey())
.then(account => {

    // new transaction builder (convenience constructor grabs tx sequence number from account object)
    let builder = new StellarSdk.TransactionBuilder(account);

    // add operations. You can add upto 100 operations in one transaction,
    // that could be 100 payments to 100 different accounts, creating accounts, trustlines, etc...

    //OPERATION 1: Create and Fund new Account, providing the destination from the keypair generated, and the amount of XLM to send.
    builder.addOperation(
        StellarSdk.Operation.createAccount({
            destination: newAccount, // newAccount account address, taken from random keypair's public key
            startingBalance: "5"  // in XLM
        })
    )

    //OPERATION 2: Change Trustline to trust the asset to be used on the platform. How to change trust for another account? 
    builder.addOperation(
        StellarSdk.Operation.changeTrust({
            asset: getAsset('MUR'), //asset name
            source: newAccountKeypair.publicKey() //new account
        })
    )
    
    //OPERATION 3: Send the assets that are now trusted to the new account.
    builder.addOperation(
        StellarSdk.Operation.payment({
            destination: newAccount, // newAccount account address, taken from random keypair's public key
            asset: getAsset('MUR'), // see helper function above
            amount: '10' // transaction amount as string (Murph test tokens)
        })
    )
    signers.push(newAccountKeypair) // add second signer to list of signers (This is shown for if modularising is required)

    // create the transaction XDR
    let transaction = builder.build();

    // sign the XDR
    transaction.sign(...signers);
    
    // submit to the network. this returns a promise (resolves or rejects depending on the outcome of the transaction)
    server.submitTransaction(transaction);
    console.log("New Account Created and Funded with XLM and MUR");
})
