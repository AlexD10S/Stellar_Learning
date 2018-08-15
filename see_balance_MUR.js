//Stellar JS SDK view balance.

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork(); // StellarSdk.Network.usePublicNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org'); // const server = new StellarSdk.Server('https://horizon.stellar.org');

// Note: this solution trusts the accounts asset codes alone.
// For general accounts you may need to verify the issuing account id: b.asset_issuer
const getBalance = (account, currency) => {
    let balance = 0;
    if (currency == 'XLM') {
        balance = Number.parseFloat(account.balances.find(b => b.asset_type == 'native').balance);
    } else {
        balance = Number.parseFloat(account.balances.find(b => b.asset_code == currency).balance);
    }
    return balance;
}

// const keypair = StellarSdk.Keypair.fromSecret('SAAMZYIS6X44TEUFEU7SHL64O2AXAYWB6LAJTP2GOJILVOZ7OGWT5J5Y')
const keypair = StellarSdk.Keypair.fromPublicKey('GCXYQK65HXITPWSTEP5Y4JUEVD2SU2XT45NU5ALIO3LXRENZA2XH3XN6')


server.loadAccount(keypair.publicKey())
.then(account => {
    console.log(account.balances)
    console.log("MUR Balance for " + account.account_id + ": " + getBalance(account, 'MUR'))
    console.log("XLM Balance for " + account.account_id + ": " + getBalance(account, 'XLM'))
})