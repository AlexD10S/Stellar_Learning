//Stellar JS SDK create an account and fund it with XLM.

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');

// an arbitary list of trusted assets
const ASSETS = {
    'MUR': new StellarSdk.Asset('MUR', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //name, ISSUER ACC
    'MUR2': new StellarSdk.Asset('MUR2', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //name, ISSUER ACC
    'MUR3': new StellarSdk.Asset('MUR3', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //name, ISSUER ACC
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

    //OPERATION 2: Change Trustline to trust the asset to be used on the platform. 
    // Q: How to change trust for another account?, than the one loaded? A: by adding multiple signers! (see tx sign below)
    builder.addOperation(
        StellarSdk.Operation.changeTrust({
            asset: getAsset('MUR'), //asset name
            source: newAccountKeypair.publicKey() //new account
        })
    )

    //operation 2(b) Trust MUR2 assets
    builder.addOperation(
        StellarSdk.Operation.changeTrust({
            asset: getAsset('MUR2'), //asset name
            source: newAccountKeypair.publicKey() //new account
        })
    )

    //operation 2(c) Trust MUR3 assets
    builder.addOperation(
        StellarSdk.Operation.changeTrust({
            asset: getAsset('MUR3'), //asset name
            source: newAccountKeypair.publicKey() //new account
        })
    )
    
    //OPERATION 3: Send the MUR that are now trusted to the new account.
    builder.addOperation(
        StellarSdk.Operation.payment({
            destination: newAccount, // newAccount account address, taken from random keypair's public key
            asset: getAsset('MUR'), // see helper function above
            amount: '100000' // transaction amount as string (Murph test tokens)
        })
    )

    //OPERATION 3(b): Send the MUR2 that are now trusted to the new account.
    builder.addOperation(
        StellarSdk.Operation.payment({
            destination: newAccount, // newAccount account address, taken from random keypair's public key
            asset: getAsset('MUR2'), // see helper function above
            amount: '1000000' // transaction amount as string (Murph2 test tokens)
        })
    )

    //OPERATION 3(b): Send the MUR3 that are now trusted to the new account.
    builder.addOperation(
        StellarSdk.Operation.payment({
            destination: newAccount, // newAccount account address, taken from random keypair's public key
            asset: getAsset('MUR3'), // see helper function above
            amount: '7000009' // transaction amount as string (Murph3 test tokens)
        })
    )

    signers.push(newAccountKeypair) // add second signer to list of signers (This is shown for if modularising is required)

    // create the transaction XDR
    let transaction = builder.build();

    // sign the XDR
    transaction.sign(...signers);
    
    // submit to the network. this returns a promise (resolves or rejects depending on the outcome of the transaction)
    server.submitTransaction(transaction);
    console.log("New Account Created and Funded with XLM and MUR, MUR2, and MUR3 tokens.");
})
