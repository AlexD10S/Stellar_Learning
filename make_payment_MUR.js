//Stellar JS SDK make a payment

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');


// an arbitary list of trusted assets
const ASSETS = {
    'MUR': new StellarSdk.Asset('MUR', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //asset_code, issuing account
    'USDT': new StellarSdk.Asset('USDT', 'GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V'),
    'MOBI' : new StellarSdk.Asset('MOBI', 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH'),
    'XLM': StellarSdk.Asset.native()
}

// helper function to get desired asset object
const getAsset = (asset) => {
    if (ASSETS[asset]) return ASSETS[asset]
    return StellarSdk.Asset.native()
}

//must be "fromsecret" to sign a Tx with
const sender = StellarSdk.Keypair.fromSecret('SAIEZD2ZIEARTCMQK433566CJ24YGPYET6MUSQMFUKIY7QLALW6GUG4G'); //get from database? distributor secret key

// 'load' the account (really, all it's getting is the next tx sequence number)
server.loadAccount(sender.publicKey())
.then(account => {
    
    // new transaction builder (convenience constructor grabs tx sequence number from account object)
    let builder = new StellarSdk.TransactionBuilder(account);

    // add an operation, here we're adding a single payment operation. You can add upto 100 operations in one transaction,
    // that could be 100 payments to 100 different accounts, etc...
    builder.addOperation(
        StellarSdk.Operation.payment({
            destination: 'GAFPZODJ27C5FNHHOVRO56VTGXYCZG2Z4FPAWISI4MFRZMNQ2LYFEWO3', // destination address(random test account) //TRUSTLINE HAS TO EXIST 
            asset: getAsset('MUR'), // see helper function above
            amount: '1.0' // transaction amount as string
        })
    )

    // create the transaction XDR
    let transaction = builder.build();

    // sign the XDR
    transaction.sign(sender);
    
    // submit to the network. this returns a promise (resolves or rejects depending on the outcome of the transaction)
    server.submitTransaction(transaction);
    console.log("Transaction Submitted");
})