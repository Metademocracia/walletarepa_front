import axios from 'axios';
import * as nearAPI from "near-api-js";
import Big from 'big.js';
// import { accountsByPublicKey } from '@mintbase-js/data';
import moment from 'moment';
import utils from './utils';
import { configNear } from "@/services/nearConfig";
import localStorageUser from '~/services/local-storage-user';


const { connect } = nearAPI;

const formatTokenAmount = (value, decimals = 18, precision = 2) => value && Big(value).div(Big(10).pow(decimals)).toFixed(precision);
const parseTokenAmount = (value, decimals = 18) => value && Big(value).times(Big(10).pow(decimals)).toFixed();

function shortenAddress(address) {
  const addresFinal = address === undefined ? "" : address.length > 25 ? address.substring(0,9)+"..."+address.substring((address.length - process.env.NETWORK.length - 7), address.length) : address;
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
  await myKeyStore.setKey(process.env.NETWORK, address, keyPair);
  const nearConnection = await connect(configNear(myKeyStore));
  const account = await nearConnection.account(address);
  return account

  
}

/* async function getNearId(_publicKey) {
  let nearId;
  let error = ""
  
  if(process.env.NETWORK === "testnet") {
    const params = {
      "query":"\n  query mintbase_js_data__accountsByPublicKey(\n    $publicKey: String!\n  ) {\n    accounts: access_keys(\n  where: {\n  public_key: { _eq: $publicKey }\n removed_at: { _is_null: true }\n      }\n    ) {\n      id: account_id\n    }\n  }\n",
      "variables":{"publicKey": _publicKey},
      "operationName":"mintbase_js_data__accountsByPublicKey"
    }

    await axios.post(`https://interop-${process.env.NETWORK}.hasura.app/v1/graphql`,  params)
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

    const network = process.env.NETWORK === "testnet" ? 'testnet' : 'mainnet';

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

function getPikespeak(ruta="") {
  return axios.get(`https://api.pikespeak.ai${ruta}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VUE_API_KEY_PIKESPEAK,
    },
  });
}


async function getRecentActivity(filter) {
  function deley() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
  let resultDataActivity = [];
  const cacheDataActivity = sessionStorage.getItem('recentActivity');

  if(cacheDataActivity && !filter) {
    resultDataActivity = JSON.parse(cacheDataActivity);
    return resultDataActivity;
  }

  const wallet = localStorageUser.getCurrentAccount().address; // "yonaikergarcia.near" // this.address;

  await deley();
  // .catch(error => { console.log("error api pikespeak: ", error) });
  
  // await axios.get(`${process.env.URL_API_INDEXER}/account/${wallet}/txns?order=desc&page=1&per_page=25`)
  // .then(async (response) => {
    try {
      let result = [];
      
      await deley()
      
      if(filter) {
        const tokenType = filter.token ? `${filter.token?.symbol}` : "all"
        const tokenFilterList = [
          {token: "NEAR", value: "|near"},
          {token: "all", value: "|all"},
        ]
        const tokenTxTypeFilter = ['envio', 'recibo'].includes(filter.txType) ? tokenFilterList.find((item) => item.token === tokenType)?.value || '|token' : '';
        
        const optionTxType = [
          {txType: "metademocracia", value: `&contractFilter=${process.env.VUE_APP_CONTRACT_NAME_DAO_METADEMOCRACIA}`},
          {txType: "p2p", value: `&contractFilter=${process.env.VUE_APP_CONTRACT_NAME}`},
          {txType: "envio|all", value: `&filters=SEND_RECEIVE,FT_TRANSFER,FT_TRANSFER_FROM_AURORA,NEAR_TRANSFER`},
          {txType: "envio|near", value: `&filters=NEAR_TRANSFER`},
          {txType: "envio|token", value: `&contractFilter=${filter.token?.contract}&filters=SEND_RECEIVE,FT_TRANSFER,FT_TRANSFER_FROM_AURORA`},
          {txType: "recibo|all", value: `&filters=SEND_RECEIVE,FT_TRANSFER,FT_TRANSFER_FROM_AURORA,NEAR_TRANSFER`},
          {txType: "recibo|near", value: `&filters=NEAR_TRANSFER`},
          {txType: "recibo|token", value: `&contractFilter=${filter.token?.contract}&filters=SEND_RECEIVE,FT_TRANSFER,FT_TRANSFER_FROM_AURORA`},
          
        ]
        
        let filterOptions = optionTxType.find((element) => element.txType === `${filter.txType}${tokenTxTypeFilter}`)?.value 
        if(!filterOptions) { 
          filterOptions = tokenType === "NEAR" ? "&filters=NEAR_TRANSFER" : tokenType !== "all" ? `&contractFilter=${filter.token?.contract}` : "";
        }

        let transferList =  await getPikespeak(`/event-historic/${wallet}?timestampStart=${filter.dates[0]}&timestampEnd=${filter.dates[1]}${filterOptions}`); // .catch(error => { console.log("error api pikespeak: ", error) });
        
        if(!transferList) transferList = [];

        switch (filter.txType) {
          case "envio":
            transferList.data = transferList.data.filter((item) => item.direction === "send");    
            break;
          case "recibo":
            transferList.data = transferList.data.filter((item) => item.direction === "receive");
            break;
        }
        

        result = transferList.data.map((items) => { 
          const typeList = [
            {type: "FT_TRANSFER", value: "transfer"},
            {type: "NEAR_TRANSFER", value: "transfer"},
          ]
          const type = typeList.find((element) => element.type === items.type)?.value;

          return {
            id: items.transaction_id,
            transaction_timestamp: Number(items.timestamp),
            first_action_type:  type || "functionCall" ,
            method_name: items.transaction_view?.method_name || items.type.toLowerCase(),
            receiver: items.receiver,
            signer: items.sender,
            direction: items?.direction || "",
            amount: items?.amount || "",
            coin: items.type === "FT_TRANSFER" ? items?.token : "NEAR",
          }
        })
        
      } else {
        await getPikespeak(`/account/transactions/${wallet}?limit=25`).then(async (response) => {
          const data = response?.data || [];
          
          await deley()

          let transferList =  await getPikespeak(`/event-historic/${wallet}?limit=25`);
          if(!transferList) transferList = [];

          result = data.map((item) => {
            const dataTransfer = !transferList ? [] : transferList?.data.find((element) => element.transaction_id === item.id);
            const direction = dataTransfer?.direction || "";
            const amount = dataTransfer?.amount || "";
            const coin = dataTransfer?.type === "FT_TRANSFER" ? dataTransfer?.token : dataTransfer?.type === "NEAR_TRANSFER" ? "NEAR" : "";
            
            const typeList = [
              {type: "FT_TRANSFER", value: "transfer"},
            ]
            const type = typeList.find((element) => element.type === dataTransfer?.type)?.value;
            const typeFinal = type || item.first_action_type;

            return {
              id: item.id,
              transaction_timestamp: item.transaction_timestamp / 1000000,
              first_action_type:  typeFinal,
              method_name: item.method_name,
              receiver: typeFinal === "transfer" ? dataTransfer.receiver : item.receiver,
              signer: typeFinal === "transfer" ? dataTransfer.sender : item.signer,
              direction,
              amount,
              coin,
            }
          });

        }).catch(error => { console.log("error api pikespeak: ", error) });
      }

      await deley()
    
      let parseExecution =  await getPikespeak(`/tx/parsed-execution-by-contract?contract=yonaikergarcia.near`);
      if(!parseExecution) parseExecution = [];

      moment.locale('es');


      // const dataActivity = data.filter((item) => item.predecessor_account_id !== "system").map((items) => {
      const dataActivity = result.map((items) => {
        const res = {
          hash: items?.id,
          date: moment(items.transaction_timestamp).fromNow(),
          /* type: typeParam,
          account: walletUtils.shortenAddress(accountParam),
          coin: coinParam,
          amount: amountParam,
          date: moment(items.transaction_timestamp/1000000).fromNow(), // moment(items.block_timestamp/1000000).fromNow(),
          text2,
          hash: items?.id // items.transaction_hash */
        }

        // if(items.actions.length === 1) {
          // switch (items.actions[0].action) {
          switch (items.first_action_type) {
            case "transfer": // "TRANSFER":
              res.type = items.direction; // items.predecessor_account_id === wallet ? "sent" : "receive";
              res.account = items.direction === "send" ? items.receiver : items.signer;
              res.amount = (items.direction === "send" ? "-" : "+")+Number(items.amount).toFixed(5);
              res.coin = items.coin;
              break;
            case "createAccount": // "CREATE_ACCOUNT":
              res.type = "account";
              res.account = shortenAddress(items.receiver); // items.receiver_account_id;
              break;
            case "addKey": // "ADD_KEY":
              res.type = "access";
              res.account = shortenAddress(items.receiver); // items.receiver_account_id;
              break;
            case "functionCall": // "FUNCTION_CALL":
              if(items.receiver === "v4.nearp2pdex.near" && ["accept_offer", "order_confirmation"].includes(items.method_name)) {
                res.type = "p2p";
                res.text2 = items.method_name; // items.actions[0].method;
                switch (items.method_name) {
                  case "accept_offer": {
                    const dataExecution = parseExecution?.data.find((element) => element?.tx?.hash === items.id);
                    const logSell = dataExecution?.receipts.find((element) => element?.actions[0]?.method_name === "on_accept_offer_sell")?.logs
                    const logBuy = dataExecution?.receipts[0]?.logs
                    const logs = logSell ? JSON.parse(logSell) : JSON.parse(logBuy);
                    
                    res.desc = "intercambio p2p";
                    res.account = logs?.params.owner_id; // items.receiver_account_id;
                    const amount = Number(logs?.params.operation_amount);
                    res.amount = logs?.params.asset.toUpperCase() === "NEAR" ? amount / Math.pow(10, 24) : amount / Math.pow(10, 6);
                    res.coin = logs?.params.asset
                  }
                  break;
                  case "order_confirmation": {
                    const dataExecution = parseExecution?.data.find((element) => element?.tx?.hash === items.id);
                    const logTxt = dataExecution?.receipts.find((element) => element?.actions[0]?.method_name === "on_confirmation")?.logs
                    const logs = logTxt ? JSON.parse(logTxt) : {};
                    const amount = Number(logs?.params.operation_amount);

                    res.desc = logs?.params.status === "2" ? "culminado p2p" : "error culminar p2p";
                    res.account = logs?.params.owner_id // logs?.params.owner_id; // items.receiver_account_id;
                    res.amount = "-" + (logs?.params.asset.toUpperCase() === "NEAR" ? amount / Math.pow(10, 24) : amount / Math.pow(10, 6)).toString();
                    res.coin = logs?.params.asset
                    
                  }
                  break;
                }
                
              } else {
                res.type = "function";
                res.account = shortenAddress(items.receiver); // items.receiver_account_id;
                res.text2 = items.method_name; // items.actions[0].method;
              }
              break;
            default:
              res.type = "access";
              res.account = shortenAddress(items.receiver); // items.receiver_account_id;
              break;
          }
        /* } else {
          typeParam = "batch";
          res.account = items.receiver; // items.receiver_account_id
        } */

       

        return res
      })

      resultDataActivity = dataActivity.slice(0, 7);

    } catch (error) {
      console.log("error a mapear lista de actividades recientes: ", error)
    }

  

  if(!filter) {
    sessionStorage.setItem('recentActivity', JSON.stringify(resultDataActivity))
  }

  return resultDataActivity;
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
  verifyWallet,
  getPikespeak,
  getRecentActivity
}