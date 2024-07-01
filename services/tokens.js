// import axios from 'axios';
// import { utils } from "near-api-js";
// import * as nearAPI from "near-api-js";
// import utils from './utils';
import walletUtils from '@/services/wallet'
import localStorageUser from '~/services/local-storage-user';
// const { connect } = nearAPI;


/**
 * Retrieves a list of contract tokens based on the provided address.
 *
 * @param {string} address - The address to retrieve contract tokens for.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of contract IDs.
 */
/* function getListContractToken(address) {
  // https://api.kitwallet.app/account//likelyTokensFromBlock
  if(process.env.Network === "mainnet" ){
    return axios.get(`https://api.fastnear.com/v1/account/${address}/ft`)
      .then(response => {
        const tokens = response.data.tokens
        return tokens.map(token => token.contract_id)
      }).catch(error => {return error}
    );
  } else {
    const network = !process.env.Network ? "-testnet" : process.env.Network === "mainnet" ? "" : "-testnet";
    return axios.get(`https://api${network}.nearblocks.io/v1/kitwallet/account/${address}/likelyTokensFromBlock?fromBlockTimestamp=0`)
      .then(response => {
        if(!response.data?.list) throw new Error("no existe likelyTokensFromBlock");
        return response.data.list
      }).catch(error => {return error}
    );
  }
  } */

// Caching mechanism for token price
const tokenPriceCache = new Map();

// Caching mechanism for token balance
const tokenBalanceCache = new Map();

async function getTokenBalance({ contract, address, symbol }) {
  // Check if token price is cached
  let priceToken; // = tokenPriceCache.get(symbol);
  // if (!priceToken) {
      const getPrice = await walletUtils.getPrice("USD", symbol);
      if (getPrice) {
          priceToken = getPrice;
          tokenPriceCache.set(symbol, priceToken);
      }
  // }

  // Check if token balance is cached
  const balanceKey = `${contract}-${address}`;
  let balanceData;/* tokenBalanceCache.get(balanceKey);
  if (balanceData) {
      return balanceData;
  } */

  const account = await walletUtils.nearConnection();
  try {
      const response = await account.viewFunctionV1(contract, 'ft_balance_of', { account_id: address });
      balanceData = {
          balance: response,
          price: priceToken
      };
      // Cache token balance
      tokenBalanceCache.set(balanceKey, balanceData);
      return balanceData;
  } catch (error) {
      return { error };
  }
}

async function getPriceToken({ symbol }) {
  // Check if token price is cached
  let priceToken; // = tokenPriceCache.get(symbol);
  // if (!priceToken) {
      const getPrice = await walletUtils.getPrice("USD", symbol);
      if (getPrice) {
          priceToken = getPrice;
          tokenPriceCache.set(symbol, priceToken);
      }
  // }    
  return priceToken;
}

async function getTokenMetadata(contract) {
  const account = await walletUtils.nearConnection();
  return account.viewFunctionV1(
    contract,
    'ft_metadata',
  );
}

// Function to clear session storage when the user reloads the browser
window.addEventListener("beforeunload", () => {
  sessionStorage.clear();
});

async function getBalanceInitNear(_address) {
  const balanceNear = await walletUtils.getBalance();
  return balanceNear.near ? String((balanceNear.near * balanceNear.price).toFixed(2)) : 0;
}


/**
 * Retrieves a list of token balances for a given user's address.
 * @returns {Promise<Object>} The list of token balances, categorized as fungible tokens (fts) and non-fungible tokens (nfts).
 * @throws {Error} If an error occurs while retrieving the token balances.
 */
async function getListTokensBalance() {
    /* function deley() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
    } */
    try {
      const address = localStorageUser.getCurrentAccount().address;
      // const contractFromBlock = await getListContractToken(address);
      // await deley()
      const contractFromBlock = await walletUtils.getPikespeak(`/account/balance/${address}`) // .catch(error => { console.log("error api pikespeak: ", error) });
      /* await deley()
      const metadataFt = await walletUtils.getPikespeak(`/money/ft-list`) // .catch(error => { console.log("error api pikespeak: ", error) });
      console.log("metadataFt: ", metadataFt);
      console.log("contractFromBlock: ", contractFromBlock);

      const datafinal = !contractFromBlock ? [] : contractFromBlock.data.filter((item) => item.contract.toLowerCase() !== 'near');

      const listaFt = await datafinal.map(async (element) => {
        let price = 0 ;
         
        const decimals = metadataFt.data.find((item) => item.token_account_id === element.contract)?.decimals;
        const priceToken = await getPriceToken({ symbol: element.symbol });
        if (priceToken) {
          price = priceToken;
        }

        
          const balanceUsd = (Number(element.amount) * Number(price)).toFixed(2);
          let balanceofi = element.amount

          if (balanceofi.toString().includes('.')) {
            const parts = balanceofi.toString().split('.');
            if (parts[1].length > 14) {
              balanceofi = parseFloat(parts[0] + '.' + parts[1].slice(0, 14));
            }
          }
          const tokenBalanceData = {
            contract: element.contract,
            balance: Number(element.amount), // walletUtils.formatTokenAmount(balance, decimals, 5),
            balanceTotal: String(balanceofi),
            name: element.symbol,
            symbol: element.symbol,
            decimals,
            icon: element.symbol === 'Wrapped Ether' 
              ? "https://assets.ref.finance/images/2396.png" 
              : element.symbol === 'wNEAR' 
                ? require('@/assets/sources/logos/near-icon.svg') 
                : element.icon,
            balance_usd: isNaN(balanceUsd) ? 0.00 : balanceUsd,
            price
          };

        
        return tokenBalanceData;
      });

      console.log("listaFt: ", listaFt); */


      // if (!contractFromBlock) return;
      const listContract = contractFromBlock ? contractFromBlock.data.filter((item) => item.contract.toLowerCase() !== 'near').map((element) => { return element.contract }) : [];
      console.log("listContract: ", listContract);
      const list = {
        fts: [],
        nfts: [],
      };

      const allTokenBalances = [];


      /**
       * Retrieves the NEAR balance data from session storage or fetches it from the walletUtils.getBalance() function.
       * If the balance data is found in session storage, it is returned. Otherwise, the balance data is fetched,
       * stored in session storage, added to the allTokenBalances array, and then returned.
       * @returns {Promise<Object>} The NEAR balance data object.
       */
      const nearBalancePromise = async () => {
        // let nearBalanceData = sessionStorage.getItem('NEAR');
        /* if (nearBalanceData) {
          return JSON.parse(nearBalanceData);
        } else { */
          const balanceNear = await walletUtils.getBalance();
          const nearBalanceData = {
            contract: "NEAR",
            balance: balanceNear.near.toFixed(5),
            balanceTotal: String(balanceNear.near),
            name: "NEAR",
            symbol: "NEAR",
            decimals: 24,
            icon: require('@/assets/sources/logos/near-icon.svg'),
            balance_usd: balanceNear.usd.toFixed(2),
            price: balanceNear.price
          };
          // sessionStorage.setItem('NEAR', JSON.stringify(nearBalanceData));
          allTokenBalances.push(nearBalanceData);
          return nearBalanceData;
        // }
      };

      /**
       * Array of promises that fetches token balances for each contract in the list.
       * @type {Promise<Array<Object>>}
       */
      const tokenBalancesPromises = listContract.map(async (contract) => {
        /* let tokenBalanceData = sessionStorage.getItem(contract);
        if (tokenBalanceData) {
          return JSON.parse(tokenBalanceData);
        } else { */
          try {
            const metadata = await getTokenMetadata(contract);
            let { balance, price } = { balance: 0, price: 0 };
            
            const getBalance = await getTokenBalance({ contract, address, symbol: metadata.symbol });
            if (getBalance) {
              balance = getBalance.balance;
              price = getBalance.price;
            }

            if (Number(balance) > 0) {
              const balanceUsd = (Number(walletUtils.formatTokenAmount(balance, metadata.decimals, 5)) * Number(price)).toFixed(2);
              let balanceofi = balance / Math.pow(10, metadata.decimals);

              if (balanceofi.toString().includes('.')) {
                const parts = balanceofi.toString().split('.');
                if (parts[1].length > 14) {
                  balanceofi = parseFloat(parts[0] + '.' + parts[1].slice(0, 14));
                }
              }

              const tokenBalanceData = {
                contract,
                balance: walletUtils.formatTokenAmount(balance, metadata.decimals, 5),
                balanceTotal: String(balanceofi),
                name: metadata.name,
                symbol: metadata.symbol,
                decimals: metadata.decimals,
                icon: metadata.name === 'Wrapped Ether' 
                  ? "https://assets.ref.finance/images/2396.png" 
                  : metadata.name === 'Wrapped NEAR fungible token' 
                    ? require('@/assets/sources/logos/near-icon.svg') 
                    : metadata.icon,
                balance_usd: isNaN(balanceUsd) ? 0.00 : balanceUsd,
                price
              };
              // sessionStorage.setItem(contract, JSON.stringify(tokenBalanceData));
              allTokenBalances.push(tokenBalanceData);
              return tokenBalanceData;
            }
          } catch (error) {
            // Handle errors if needed
          }
        // }
      });

      const [nearBalance, ...tokenBalances] = await Promise.all([nearBalancePromise(), ...tokenBalancesPromises]);

      list.fts.push(nearBalance);
      list.fts.push(...tokenBalances.filter(Boolean));

      sessionStorage.setItem('allTokenBalances', JSON.stringify(allTokenBalances));

      

      return list;
    } catch (error) {
      // Handle errors if needed
    }
  }


/* async function getInventoryUser() {
  const address = localStorageUser.getCurrentAccount().address;
  const list = {
    fts: [],
    nfts: [],
  };

  const balanceNear = await walletUtils.getBalance();

  list.fts.push({
    contract: "NEAR",
    balance: balanceNear.near.toFixed(5),
    name: "NEAR",
    symbol: "NEAR",
    decimals: 24,
    icon: require('@/assets/sources/logos/near-icon.svg'),
    balance_usd: balanceNear.usd.toFixed(2),
    price: balanceNear.price
  });

  await axios.get(`${process.env.URL_API_INDEXER}/account/${address}/inventory`)
  .then(response => {
    const data = response.data?.inventory;

    if(!data) throw new Error("no existe inventory");

    list.nfts = data.nfts

    list.fts = list.fts.concat(data.fts.map((item) => {
        const price = !item.ft_metas.price ? 0 : item.ft_metas.price;
        const balance = Number(walletUtils.formatTokenAmount(item.amount, item.ft_metas.decimals, 5));
        const balanceUsd = (balance * Number(price)).toFixed(2)
        return {
          contract: item.contract,
          balance: balance.toFixed(5),
          name: item.ft_metas.name,
          symbol: item.ft_metas.symbol,
          decimals: item.ft_metas.decimals,
          icon: item.ft_metas.icon,
          balance_usd: balanceUsd, // isNaN(balanceUsd) ? 0.00 : balanceUsd,
          price
        }
      })
    )
  }).catch(error => {
    console.log("error api nearblocks inventory: ", error)
  });

  return list
} */


async function updateBalanceLocalStorage() {
  const inventory = await getListTokensBalance();

  if (!inventory) {
    this.loading = false;
    return;
  }

  // Sort the inventory array based on token values from more to less
  inventory.fts.sort((a, b) => {
    // Compare the balance_usd property of each token object
    return b.balance_usd - a.balance_usd;
  });

  // Sum all balances
  const tokensData = inventory.fts;
  let totalBalance = 0;
  for (const token of tokensData) {
    totalBalance += Number(token.balance_usd);
  }

  // Store the total balance in session storage
  sessionStorage.setItem('balance', totalBalance.toFixed(2));
  
  return inventory;
}



export default {
  getTokenBalance,
  getTokenMetadata,
  getListTokensBalance,
  // getInventoryUser,
  getBalanceInitNear,
  updateBalanceLocalStorage
}