<template>
  <v-dialog
    v-model="model"
    max-width="max-content"
    :overlay-opacity=".9"
    content-class="modal-cryptos"
  >
    <aside class="d-flex justify-end mb-5">
      <v-text-field
        v-model="search"
        hide-details solo
      >
        <template #append>
          <img src="@/assets/sources/icons/magnify.svg" alt="search icon">
        </template>
      </v-text-field>
    </aside>


    <v-card class="cryptos-card">
      <div
        v-if="loading"
        class="cryptos-card__wrapper"
        style="text-align: center;"
      >
      Cargando....
      </div>
      <div
        v-else
        class="cryptos-card__wrapper"
      >
        <v-card
          v-for="(item, i) in dataTokensFinal" :key="i"
          color="transparent"
          class="cryptos-card-coin space"
          @click="onSelected(item)"
        >
          <div class="center" style="gap: 14px;">
            <v-img-load
              :src="item.icon"
              :alt="`${item.name}s' coin`"
              sizes="29px"
              cover
            />

            <h5 class="mb-0">{{ item.name }}</h5>
          </div>

          <div class="d-flex flex-column">
            <span>{{ item.balance }} {{ item.coin }}</span>
            <span>${{ item.balance_usd }}</span>
          </div>
        </v-card>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import tokens from '@/services/tokens';

export default {
  name: "ModalCryptos",
  props: {
    dataTokens: {
      type: Array,
      default: undefined,
    },
    filter: {
      type: Array,
      default: undefined,
    }
  },
  data() {
    return {
      model: false,
      search: '',
      refreshTokens: this.loadTokens,
      selectedCoin: undefined,
      loading: false,
      tokensData: [],
      dataTokensFinal: [
        // // {
        // //   contract: ,
        // //   balance: walletUtils.formatTokenAmount(balance, metadata.decimals, 5),
        // //   name: metadata.name,
        // //   symbol: metadata.symbol,
        // //   decimals: metadata.decimals,
        // //   icon: metadata.icon,
        // //   balance_usd: Number(walletUtils.formatTokenAmount(balance, metadata.decimals, 5)) * Number(price),
        // //   price
        // // }*
        // {
        //   icon: require('@/assets/sources/tokens/btc.svg'),
        //   coin: "ETH",
        //   name: "ETHEREUM",
        //   amount: "59.744",
        //   balance_usd: "79.379"
        // },
        // {
        //   icon: require('@/assets/sources/tokens/dai.svg'),
        //   coin: "ETH",
        //   name: "ETHEREUM",
        //   amount: "59.744",
        //   balance_usd: "79.379"
        // },
        // {
        //   icon: require('@/assets/sources/tokens/klay.svg'),
        //   coin: "ETH",
        //   name: "ETHEREUM",
        //   amount: "59.744",
        //   balance_usd: "79.379"
        // },
        // {
        //   icon: require('@/assets/sources/tokens/matic.svg'),
        //   coin: "ETH",
        //   name: "ETHEREUM",
        //   amount: "59.744",
        //   balance_usd: "79.379"
        // },
        // {
        //   icon: require('@/assets/sources/tokens/shib.svg'),
        //   coin: "ETH",
        //   name: "ETHEREUM",
        //   amount: "59.744",
        //   balance_usd: "79.379"
        // },
      ]
    }
  },
  watch: {
    model(value) {
      if (!value) this.search = ''
    },
    search(value) {
      if(this.dataTokensFinal.length <= 0) return
      if(!this.dataTokensFinal[0]?.name) return

      if (!value){
        this.dataTokensFinal = [].concat(this.tokensData); // Set sorted inventory data
      } else {
        this.dataTokensFinal = this.tokensData.filter((item) => item?.name.toLowerCase().includes(value))
      }
    }
    
  },

  mounted() {
    this.loadTokens();
  },

  methods: {
    async getContractIds(wallet) {
      if (process.env.Network === "mainnet") {
        const serviceUrl = `https://api.fastnear.com/v0/account/${wallet}/ft`;

        const result = await axios.get(serviceUrl);

        return result.data.contract_ids
      } else {
        const serviceUrl = `https://api-testnet.nearblocks.io/v1/account/${wallet}/tokens`;

        const result = await axios.get(serviceUrl);

        return result.data.tokens.fts
      }
    },
    /**
     * Loads tokens data from session storage or API, sorts the inventory based on token values,
     * calculates the total balance, and stores it in session storage.
     * @returns {Promise<void>} A promise that resolves when the tokens data is loaded and processed.
     */
    async loadTokens() {
      this.loading = true;
      // console.log('Loading data...');

      // Check if data exists in session storage
      // const storedTokenBalances = JSON.parse(sessionStorage.getItem('allTokenBalances'));

      const inventory = await tokens.updateBalanceLocalStorage();
      /* // console.log('Stored data:', storedTokenBalances);
      if (storedTokenBalances) {
        // If session storage data exists, use it as the inventory
        inventory = { fts: storedTokenBalances };
        // console.log('Loaded data from session storage:', inventory);
      } else {
        // Otherwise, fetch the inventory from the API
        inventory = await tokens.updateBalanceLocalStorage(); // await tokens.getListTokensBalance();
        // console.log('Fetched data from API:', inventory);
      } */

      if (!inventory) {
        this.loading = false;
        return;
      }

      // Sort the inventory array based on token values from more to less
      /* inventory.fts.sort((a, b) => {
        // Compare the balance_usd property of each token object
        return b.balance_usd - a.balance_usd;
      }); */
      this.tokensData = inventory.fts;

      const usdtExists = this.tokensData.some(token => token.name === 'Tether USD');

      // If USDT does not exist, add it manually
      if (!usdtExists) {
        const usdtData = {
          contract: process.env.VUE_APP_CONTRACT_NAME_USDT,
          balance: "0.00000",
          balanceTotal: "0",
          name: "Tether USD",
          symbol: "USDt",
          decimals: 6,
          icon: "data:image/svg+xml,%3Csvg width='111' height='90' viewBox='0 0 111 90' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24.4825 0.862305H88.0496C89.5663 0.862305 90.9675 1.64827 91.7239 2.92338L110.244 34.1419C111.204 35.7609 110.919 37.8043 109.549 39.1171L58.5729 87.9703C56.9216 89.5528 54.2652 89.5528 52.6139 87.9703L1.70699 39.1831C0.305262 37.8398 0.0427812 35.7367 1.07354 34.1077L20.8696 2.82322C21.6406 1.60483 23.0087 0.862305 24.4825 0.862305ZM79.8419 14.8003V23.5597H61.7343V29.6329C74.4518 30.2819 83.9934 32.9475 84.0642 36.1425L84.0638 42.803C83.993 45.998 74.4518 48.6635 61.7343 49.3125V64.2168H49.7105V49.3125C36.9929 48.6635 27.4513 45.998 27.3805 42.803L27.381 36.1425C27.4517 32.9475 36.9929 30.2819 49.7105 29.6329V23.5597H31.6028V14.8003H79.8419ZM55.7224 44.7367C69.2943 44.7367 80.6382 42.4827 83.4143 39.4727C81.0601 36.9202 72.5448 34.9114 61.7343 34.3597V40.7183C59.7966 40.8172 57.7852 40.8693 55.7224 40.8693C53.6595 40.8693 51.6481 40.8172 49.7105 40.7183V34.3597C38.8999 34.9114 30.3846 36.9202 28.0304 39.4727C30.8066 42.4827 42.1504 44.7367 55.7224 44.7367Z' fill='%23009393'/%3E%3C/svg%3E",
          balance_usd: "0.00",
          price: 1
        };

        this.tokensData.push(usdtData);
      }

      if (this.filter) {
        this.tokensData = this.tokensData.filter((item) => this.filter.includes(item?.symbol.toLowerCase()))
      }
      
      // console.log('Sorted data:', this.tokensData);

      // Sum all balances
      /* let totalBalance = 0;
      for (const token of this.tokensData) {
        totalBalance += Number(token.balance_usd);
      } */
      // console.log('Total balance:', totalBalance);

      // Store the total balance in session storage
      // sessionStorage.setItem('balance', totalBalance.toFixed(2));
      // console.log('Stored total balance in session storage:', totalBalance);

      this.loading = false;
      this.dataTokensFinal = [].concat(this.tokensData); // Set sorted inventory data
      // this.dataTokensFinal.find(token => token.symbol.toLocaleLowerCase() === 'USDT'.toLocaleLowerCase())
      // console.log('Final data:', this.dataTokensFinal);
      this.dataTokensFinal.sort((a, b) => {
        if (a.name === 'USDT') return -1;
        if (b.name === 'USDT') return 1;
        return 0;
      });
    },
    onGetUsdt() {
      this.model = false;
    },
    onSelected(item) {
      this.model = false;
      this.$emit('on-selected-coin', item)
      localStorage.setItem('selectedCoin', JSON.stringify(item));
    }
  },

}
</script>

<style lang="scss">
.modal-cryptos {

  .v-input {
    flex-grow: 1;
    transform-origin: right;
    max-width: 31px !important;

    transition: .3s cubic-bezier(0.86, 0, 0.07, 1);

    &__slot {
      min-height: 31px !important;
      outline: none !important;
    }

    .v-input__append-inner img {
      transform: translateX(-8px);
      transition: transform .3s ease;
    }

    &--is-focused {
      max-width: 100% !important;
      
      .v-input__append-inner img { transform: translateX(0) }
    }
  }


  .cryptos-card {
    --height: 600px;
    --padding-block: 29px;

    width: 317px;
    max-height: var(--height);
    border-radius: 20px;
    border: 1px solid #000;
    background-color: #F6F6F7 !important;
    padding-block: var(--padding-block);
    padding-right: 2px;

    .cryptos-card__wrapper {
      display: flex;
      flex-direction: column;
      scrollbar-gutter: stable;
      max-height: calc(var(--height) - var(--padding-block) * 2);
      padding-left: 10px;
      border-radius: 0 !important;
      overflow-y: auto;
    }

    
    &-coin {
      --padding-inline: 20px;

      padding-inline: var(--padding-inline);
      padding-block: 16px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        margin-inline: auto;
        height: 1px;
        width: calc(100% - var(--padding-inline) * 2);
        background-color: var(--secondary);
      }

      /* &.active {
        background-color: hsl(216 99% 52% / .7) !important;
        &::after { background-color: #333 !important }

        * { color: #fff !important }
      } */
    }

    
    h5 {
      --fw: 700;
      --fs: 12px;
      color: #000;
      font-family: var(--font2);
      line-height: normal;
    }

    span:first-child {
      --fw: 700;
      color: #000;
      text-align: right;
      font-size: 12px;
      font-family: var(--font2);
      line-height: normal;

      + span {
        --fw: 400;
        color: #333;
        text-align: right;
        font-family: var(--font2);
        font-size: 10px;
        line-height: normal;
      }
    }
  }
}
</style>
