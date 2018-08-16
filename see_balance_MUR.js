//Stellar JS SDK view balance.

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');

// This solution checks for both the asset_code and the asset_issuer of the token/asset being checked (MUR).
// For general accounts you may need to verify the issuing account id: b.asset_issuer
var issuerPublicKey = "GDRZOGXOBRGWN7WG5MG3LI3PFJCVWB7XCAIHUEVFHFSE3TMCKWH4YJG7";
const getBalance = (account, currency) => {
    let balance = 0;
    if (currency == 'XLM') {
        balance = Number.parseFloat(account.balances.find(b => b.asset_type == 'native').balance);
    } else {
        balance = Number.parseFloat(account.balances.find(b => b.asset_code == currency && b.asset_issuer == issuerPublicKey ).balance);
    }
    return balance;
}

//account to be checked
const keypair = StellarSdk.Keypair.fromPublicKey('GCXJI4VX3KOVCERMLRZWSL5OJZGBANRXY7MIDHLBDMCJKN6IW7GRQRAB') //MUR buyer 3 from notes.txt

server.loadAccount(keypair.publicKey())
.then(account => {
    console.log(account.balances)
    console.log("MUR Balance for " + account.account_id + ": " + getBalance(account, 'MUR'))
    console.log("MUR2 Balance for " + account.account_id + ": " + getBalance(account, 'MUR2'))
    console.log("MUR3 Balance for " + account.account_id + ": " + getBalance(account, 'MUR3'))
    console.log("XLM Balance for " + account.account_id + ": " + getBalance(account, 'XLM'))
})
