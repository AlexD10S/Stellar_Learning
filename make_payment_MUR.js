//Stellar JS SDK make a payment

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');


// an arbitary list of trusted assets
const ASSETS = {
    'MUR': new StellarSdk.Asset('MUR', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //asset_code, issuing account
    'MUR2': new StellarSdk.Asset('MUR2', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //name, ISSUER ACC
    'MUR3': new StellarSdk.Asset('MUR3', 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7'), //name, ISSUER ACC
    'XLM': StellarSdk.Asset.native()
}

// helper function to get desired asset object
const getAsset = (asset) => {
    if (ASSETS[asset]) return ASSETS[asset]
    return StellarSdk.Asset.native()
}

//must be "fromsecret" to sign a Tx with
const sender = StellarSdk.Keypair.fromSecret('S...'); //MUR Buyer 3 //get from database? distributor secret key
var recipient = "GAFPZODJ27C5FNHHOVRO56VTGXYCZG2Z4FPAWISI4MFRZMNQ2LYFEWO3";//MUR buyer 1 //recipient public address //TRUSTLINE HAS TO EXIST

var asset_code = 'MUR2'; //arbitrarily pick one to test... This will be set by user. //can send multiple at once if wanted.
var asset_issuer = 'GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7';// will be checked to verify it's the real asset from MURPH

// 'load' the account (really, all it's getting is the next tx sequence number)
server.loadAccount(sender.publicKey())
.then(account => {
    
    // new transaction builder (convenience constructor grabs tx sequence number from account object)
    let builder = new StellarSdk.TransactionBuilder(account);

    // add an operation, here we're adding a single payment operation. You can add upto 100 operations in one transaction,
    // that could be 100 payments to 100 different accounts, etc...
    //send MUR
    if(asset_code == 'MUR' && asset_issuer == "GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7"){
        builder.addOperation(
            StellarSdk.Operation.payment({
                destination: recipient, // destination address(random test account) //TRUSTLINE HAS TO EXIST 
                asset: getAsset('MUR'), // see helper function above
                amount: '1.0' // transaction amount as string
            })
        )
    }
    

    //send MUR2
    if(asset_code == 'MUR2' && asset_issuer == "GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7"){
        builder.addOperation(
            StellarSdk.Operation.payment({
                destination: recipient, // destination address(random test account) //TRUSTLINE HAS TO EXIST 
                asset: getAsset('MUR2'), // see helper function above
                amount: '5000.0' // transaction amount as string
            })
        )
    }
    
    //send MUR3
    if(asset_code == 'MUR3' && asset_issuer == "GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7"){
        builder.addOperation(
            StellarSdk.Operation.payment({
                destination: recipient, // destination address(random test account) //TRUSTLINE HAS TO EXIST 
                asset: getAsset('MUR3'), // see helper function above
                amount: '40005.99' // transaction amount as string
            })
        )
    }
    
    // create the transaction XDR
    let transaction = builder.build();

    // sign the XDR
    transaction.sign(sender);
    
    // submit to the network. this returns a promise (resolves or rejects depending on the outcome of the transaction)
    server.submitTransaction(transaction);
    console.log("Transaction Submitted");
})
