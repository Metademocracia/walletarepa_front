import axios from 'axios';
import * as nearAPI from "near-api-js";
import Big from 'big.js';
// import { accountsByPublicKey } from '@mintbase-js/data';
import utils from './utils';
import { configNear } from "@/services/nearConfig";
import localStorageUser from '~/services/local-storage-user';

const { connect } = nearAPI;

const formatTokenAmount = (value, decimals = 18, precision = 2) => value && Big(value).div(Big(10).pow(decimals)).toFixed(precision);
const parseTokenAmount = (value, decimals = 18) => value && Big(value).times(Big(10).pow(decimals)).toFixed();

function shortenAddress(address) {
  const addresFinal = address === undefined ? "" : address.length > 25 ? address.substring(0,9)+"..."+address.substring((address.length - process.env.Network.length - 7), address.length) : address;
  return addresFinal
}

function executeQueryRpc(_method, _params) {
  const json = {
    "jsonrpc": "2.0",
    "id": "dontcare",
    "method": _method,
    "params": _params
  };

  console.log("params rpc: ", json);

  return axios.post(process.env.ROUTER_RPC,
    json, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
}

async function getBalance(_address) {
  const address = _address || localStorageUser.getCurrentAccount().address;
  
  const params = {
    account_id: address,
    finality: "optimistic",
    request_type: "view_account"
  };

  const item = await utils.executeQueryRpc("query", params);
  const amount = Number(item?.data?.result?.amount || 0);
  const storageUsage = Number(item?.data?.result?.storage_usage || 0);

  const balanceWallet = amount / 1e24;
  const reservedStorage = storageUsage / 1e5;
  const reservedTransaction = amount !== 0 ? Math.min(balanceWallet - reservedStorage, 0.05) : 0;
  const balanceAvalible = balanceWallet - reservedStorage - reservedTransaction;

  const response = await axios.post(process.env.URL_APIP_PRICE, { fiat: "USD", crypto: "NEAR" });
  const _price = Number(response.data[0].value);

  return { 
    near: balanceAvalible,
    usd: balanceAvalible * _price,
    price: _price,
    wallet: balanceWallet,
    storage: reservedStorage,
    transaction: reservedTransaction
  };
}


function getPrice(fiat, crypto) {
  const _fiat = !fiat ? "USD" : fiat;
  const _crypto = !crypto ? "NEAR" : crypto;
  
  return axios.post(process.env.URL_APIP_PRICE,
    {fiat: _fiat, crypto: _crypto})
  .then((response) => {
    return response.data[0].value

  }).catch((error) => {
    return error
  })
}

function getNfts(owner) {
  const _owner = owner;
  return axios.post(process.env.URL_API_NFT,
    {owner: _owner})
  .then((response) => {
    return response.data
  }).catch((error) => {
    return error
  })
}

async function nearConnection(accountId) {
  // const { address, privateKey } = localStorageUser.getCurrentAccount();
  const { address, privateKey } = !accountId ? localStorageUser.getCurrentAccount() : localStorageUser.getAccount(accountId);

  const { keyStores, KeyPair } = nearAPI;
  const myKeyStore = new keyStores.InMemoryKeyStore();
  const PRIVATE_KEY = privateKey;
  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  // adds the keyPair you created to keyStore
  await myKeyStore.setKey(process.env.Network, address, keyPair);
  const nearConnection = await connect(configNear(myKeyStore));
  const account = await nearConnection.account(address);
  return account

  
}

/* async function getNearId(_publicKey) {
  let nearId;
  let error = ""
  
  if(process.env.Network === "testnet") {
    const params = {
      "query":"\n  query mintbase_js_data__accountsByPublicKey(\n    $publicKey: String!\n  ) {\n    accounts: access_keys(\n  where: {\n  public_key: { _eq: $publicKey }\n removed_at: { _is_null: true }\n      }\n    ) {\n      id: account_id\n    }\n  }\n",
      "variables":{"publicKey": _publicKey},
      "operationName":"mintbase_js_data__accountsByPublicKey"
    }

    await axios.post(`https://interop-${process.env.Network}.hasura.app/v1/graphql`,  params)
      .then((response) => {
        if(response.data?.data?.accounts[0]) {
          nearId = response.data?.data?.accounts[0].id
        }
    }).catch((err) => {
      error = err
    })

    if(!nearId) throw new Error(error)
  } else {
    await axios.get(`https://api.fastnear.com/v0/public_key/${_publicKey}`)
    .then((response) => {
      const result = response.data?.account_ids;

      if(!result) throw new Error("near id no encontrado");

      if(result.length > 0) {
        nearId = result[0]
      }
    }).catch((err) => {
      error = err
    })
    
    if(!nearId) throw new Error(error)
    
  }
  
  
  return nearId
} */


async function getNearId(publicKey) {
  
    const masterController = new AbortController();

    const network = process.env.Network === "testnet" ? 'testnet' : 'mainnet';

    const INDEXERSERVICEURL = network === "testnet" ? 'https://api-testnet.nearblocks.io/v1/kitwallet' 
    : 'https://api3.nearblocks.io/v1/kitwallet';

    const INDEXERSERVICEURLv1 = network === "testnet" ? 'https://api-testnet.nearblocks.io/v1' 
    : 'https://api.nearblocks.io/v1';

    const INDEXERSERVICEURLv3 = network === "testnet" ? 'https://api-testnet.nearblocks.io/v3' 
    : 'https://api3.nearblocks.io/v3';

    
    // const IS_MAINNET =  // ["mainnet"].some((env:any) => env === process.env.NETWORK);

    const resultApis = [];

    // ---------------------
    // Nearblocks API3 kitwallet mock
    // ---------------------
    let resultApi1 = [];
    // await fetch(`${INDEXERSERVICEURL}/publicKey/${publicKey}/accounts`, {
    await axios.get(`${INDEXERSERVICEURL}/publicKey/${publicKey}/accounts`, {
        headers: {
              'X-requestor': 'near',
        },
        signal: masterController.signal,
    })
    .then((res) => {
      resultApi1 = res.data;
      res.data.forEach((item) => resultApis.push(item));
    })
    .catch((err) => {
        console.warn('kitwallet fetch error', err);
    });

    let resultApi2 = [];
    // await fetch(`${INDEXERSERVICEURLv1}/keys/${publicKey}`, {
    await axios.get(`${INDEXERSERVICEURLv1}/keys/${publicKey}`, {
        headers: {
              'X-requestor': 'near',
        },
        signal: masterController.signal,
    })
    .then((res) => {
      if(res.data?.keys && res.data?.keys instanceof Array && res.data?.keys.length > 0) {
        const resMap = res.data.keys.map((item) => item.account_id);
        resultApi2 = resMap
        resMap.forEach((item) => resultApis.push(item));
      }
      /* const result = res.json();
      if (result?.keys && result?.keys instanceof Array && result?.keys.length > 0) {
        return result.keys.map((item) => item.account_id)
      } else {
        return [];
      } */

    })
    .catch((err) => {
        console.warn('api v1 fetch error', err);
    });

    let resultApi3 = [];
    // await fetch(`${INDEXERSERVICEURLv3}/keys/${publicKey}`, {
    await axios.get(`${INDEXERSERVICEURLv3}/keys/${publicKey}`, {
        headers: {
              'X-requestor': 'near',
        },
        signal: masterController.signal,
    })
    .then((res) => {
      if(res.data?.keys && res.data?.keys instanceof Array && res.data?.keys.length > 0) {
        const resMap = res.data.keys.map((item) => item.account_id);
        resultApi3 = resMap;
        resMap.forEach((item) => resultApis.push(item));
      }
      /* const result = (await res.json());
      if (result.keys && result.keys instanceof Array && result.keys.length > 0) {
        return result.keys.map((item) => item.account_id)
      } else {
        return [];
      } */

    })
    .catch((err) => {
        console.warn('api v3 fetch error', err);
    });

          /* axios.get(`${CONFIG.INDEXER_SERVICE_URL}/publicKey/${publicKey}/accounts`)
          .then((response) => {
            response.json()
          }).catch((err) => {
            console.warn('kitwallet fetch error', err);
            return [];
          }), */
        
    // ---------------------
    // Mintbase API
    // ---------------------
    /* let resultApi4 = [];
    accountsByPublicKey(
        publicKey.toString(),
        network
    )
    .then((res) => {
      resultApi4 = res.data ?? []
    })
    .catch((err) => {
        console.warn('mintbase fetch error', err);
    }); */

    let resultApi4 = [];
    const params = {
      "query":"\n  query mintbase_js_data__accountsByPublicKey(\n    $publicKey: String!\n  ) {\n    accounts: access_keys(\n  where: {\n  public_key: { _eq: $publicKey }\n removed_at: { _is_null: true }\n      }\n    ) {\n      id: account_id\n    }\n  }\n",
      "variables":{publicKey},
      "operationName":"mintbase_js_data__accountsByPublicKey"
    }

    await axios.post(`https://interop-${network}.hasura.app/v1/graphql`,  params)
      .then((response) => {
        if(response.data?.data?.accounts && response.data?.data?.accounts.length > 0) { 
          const resMap = response.data?.data?.accounts.map((item) => item.id);
          resultApi4 = resMap;
          resMap.forEach((item) => resultApis.push(item));
        }
        /* if(response.data?.data?.accounts[0]) {
          nearId = response.data?.data?.accounts[0].id
        } */
    }).catch((err) => {
      console.log("error grahp consulta nickname: ", err)
    })
        
         
  
    let resultApi5 = [];
    if (network === "mainnet") {
        // ---------------------
        // Fastnear API
        // ---------------------
        /* fetch(
            `https://api.fastnear.com/v0/public_key/${publicKey}/all`,
            {
                signal: masterController.signal,
            }
        ) */
        await axios.get(`https://api.fastnear.com/v0/public_key/${publicKey}/all`)
        /* .then((res) => {
          resultApi5 = res.json();
          console.log("fast api 1: ", res.json())
        }) */
        .then((res) => {
          if(res?.data && res?.data?.account_ids) {
            resultApi5 = res.data.account_ids
            res.data.account_ids.forEach((item) => resultApis.push(item));
          }

        })
        .catch((err) => {
            console.warn('fastnear fetch error', err);
        })
    }

    console.log("resultApi1: ", resultApi1);
    console.log("resultApi2: ", resultApi2);
    console.log("resultApi3: ", resultApi3);
    console.log("resultApi4: ", resultApi4);
    console.log("resultApi5: ", resultApi5);
    
    return resultApis
}

async function verifyWallet() {
  try {
    const response = await axios.post(process.env.URL_BACKEND + '/wallet/verify-wallet', {
      walletname: localStorage.getItem('address')
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}


export default {
  formatTokenAmount,
  parseTokenAmount,
  shortenAddress,
  executeQueryRpc,
  getBalance,
  getPrice,
  nearConnection,
  getNearId,
  getNfts,
  verifyWallet
}