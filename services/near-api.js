import * as nearAPI from 'near-api-js'
import Vue from 'vue'

export default async function NearApi() {
  const
    { connect, keyStores, WalletConnection } = nearAPI,
    keyStore = new keyStores.BrowserLocalStorageKeyStore(),
    config = {
      networkId: process.env.Network,
      keyStore, 
      nodeUrl: process.env.Network === "testnet" ? "https://rpc.testnet.near.org" : "https://rpc.mainnet.near.org",
      // nodeUrl: process.env.Network === "testnet" ? "https://rpc.testnet.near.org" : "https://rpc.mainnet.pagoda.co",
      walletUrl: localStorage.getItem("walletUrl"),
      helperUrl: process.env.Network === "testnet" ? "https://helper.testnet.near.org" : "https://helper.mainnet.near.org",
      explorerUrl: process.env.Network === "testnet" ? "https://explorer.testnet.near.org" : "https://explorer.mainnet.near.org",
    },
    // connect to NEAR
    near = await connect(config),
    // create wallet connection
    wallet = new WalletConnection(near, "arepa-wallet");

  Vue.prototype.$wallet = wallet
  Vue.prototype.$near = near
}

/*   when need buy
// create contract connection
const contract = new Contract(wallet.account(), item.contract_market, {
  changeMethods: ["buy"],
  sender: wallet.account(),
})
*/
