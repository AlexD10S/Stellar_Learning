//Stellar JS SDK view balance.

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');

// This solution checks for both the asset_code and the asset_issuer of the token/asset being checked (MUR).
// For general accounts you may need to verify the issuing account id: b.asset_issuer
var issuerPublicKey = "GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7"; //get from database?
const getBalance = (account, currency) => {
    let balance = 0;
    if (currency == 'XLM') {
        balance = Number.parseFloat(account.balances.find(b => b.asset_type == 'native').balance);
    } else {
        balance = Number.parseFloat(account.balances.find(b => b.asset_code == currency && b.asset_issuer == issuerPublicKey ).balance);
    }
    return balance;
}

const keypair = StellarSdk.Keypair.fromPublicKey('GCXYQK65HXITPWSTEP5Y4JUEVD2SU2XT45NU5ALIO3LXRENZA2XH3XN6')

server.loadAccount(keypair.publicKey())
.then(account => {
    console.log(account.balances)
    console.log("MUR Balance for " + account.account_id + ": " + getBalance(account, 'MUR'))
    console.log("XLM Balance for " + account.account_id + ": " + getBalance(account, 'XLM'))
})
