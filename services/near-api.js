import * as nearAPI from 'near-api-js'
import Vue from 'vue'

export default async function NearApi() {
  const
    { connect, keyStores, WalletConnection } = nearAPI,
    keyStore = new keyStores.BrowserLocalStorageKeyStore(),
    config = {
      networkId: process.env.NETWORK,
      keyStore, 
  // Prefer an explicit ROUTER_RPC env var (set at build or runtime). Fall back to the standard NEAR RPCs.
  nodeUrl: process.env.ROUTER_RPC || (process.env.NETWORK === "testnet" ? "https://rpc.testnet.near.org" :  "https://free.rpc.fastnear.com"),
      walletUrl: localStorage.getItem("walletUrl"),
      helperUrl: process.env.NETWORK === "testnet" ? "https://helper.testnet.near.org" : "https://helper.mainnet.near.org",
      explorerUrl: process.env.NETWORK === "testnet" ? "https://explorer.testnet.near.org" : "https://explorer.mainnet.near.org",
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
