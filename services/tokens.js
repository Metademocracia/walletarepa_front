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
  if(process.env.NETWORK === "mainnet" ){
    return axios.get(`https://api.fastnear.com/v1/account/${address}/ft`)
      .then(response => {
        const tokens = response.data.tokens
        return tokens.map(token => token.contract_id)
      }).catch(error => {return error}
    );
  } else {
    const network = !process.env.NETWORK ? "-testnet" : process.env.NETWORK === "mainnet" ? "" : "-testnet";
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

/* async function getPriceToken({ symbol }) {
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
} */

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
    try {
      const address = localStorageUser.getCurrentAccount().address;
      const contractFromBlock = await walletUtils.getPikespeak(`/account/balance/${address}`);
      // console.log("contractFromBlock: ", contractFromBlock);

      const listContract = contractFromBlock ? contractFromBlock.data.filter((item) => item.contract.toLowerCase() !== 'near').map((element) => { return element }) : [];
      // console.log("listContract: ", listContract);
      
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
        allTokenBalances.push(nearBalanceData);
        return nearBalanceData;
      };

      /**
       * Process token balances from the API response
       */
      const processTokenBalances = () => {
        return listContract.map((token) => {
          try {
            const amount = Number(token.amount);
            
            if (amount > 0) {
              // Use default decimals for common tokens, or extract from symbol if available
              let decimals = 24; // Default for NEAR tokens
              const price = 0; // You might want to get this from your price API
              
              // Extract decimals from symbol if available (e.g., "NEAR [Storage]" might indicate different decimals)
              if (token.symbol.includes('[') && token.symbol.includes(']')) {
                // Handle special tokens like storage tokens
                decimals = 24; // Adjust based on your token standards
              } else if (token.contract.includes('usdt') || token.symbol.includes('USDt')) {
                decimals = 6; // USDT typically has 6 decimals
              }
              
              const balanceUsd = (amount * price).toFixed(2);
              let balanceofi = amount;

              if (balanceofi.toString().includes('.')) {
                const parts = balanceofi.toString().split('.');
                if (parts[1].length > 14) {
                  balanceofi = parseFloat(parts[0] + '.' + parts[1].slice(0, 14));
                }
              }

              const tokenBalanceData = {
                contract: token.contract,
                balance: walletUtils.formatTokenAmount(amount * Math.pow(10, decimals), decimals, 5),
                balanceTotal: String(balanceofi),
                name: token.symbol,
                symbol: token.symbol,
                decimals,
                icon: token.icon || (token.symbol === 'Wrapped Ether' 
                  ? "https://assets.ref.finance/images/2396.png" 
                  : token.symbol === 'wNEAR' 
                    ? require('@/assets/sources/logos/near-icon.svg') 
                    : null),
                balance_usd: isNaN(balanceUsd) ? 0.00 : balanceUsd,
                price
              };
              
              allTokenBalances.push(tokenBalanceData);
              return tokenBalanceData;
            }
            return null; // Added return for map callback
          } catch (error) {
            console.error("Error processing token:", token.contract, error);
            return null;
          }
        }).filter(Boolean);
      };

      const [nearBalance, ...tokenBalances] = await Promise.all([
        nearBalancePromise(), 
        ...processTokenBalances()
      ]);

      list.fts.push(nearBalance);
      list.fts.push(...tokenBalances);

      sessionStorage.setItem('allTokenBalances', JSON.stringify(allTokenBalances));

      return list;
    } catch (error) {
      console.error("Error in getListTokensBalance:", error);
      throw error;
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