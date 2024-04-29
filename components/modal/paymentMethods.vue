<template>
  <v-dialog
    v-model="model"
    max-width="max-content"
    :overlay-opacity=".9"
    content-class="modal-payments"
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


    <v-card class="payment-card">
      <div
        v-if="loading"
        class="payment-card__wrapper"
        style="text-align: center;"
      >
      Cargando....
      </div>
      <div
        v-else
        class="payment-card__wrapper"
      >
        <v-list>
          <v-list-item
            v-for="(payment, i) in dataPayments" :key="i"
            @click="selectedPayment = payment.payment_method"
          >
            {{ payment.payment_method }}
            <img v-if="selectedPayment == payment.payment_method" src="@/assets/sources/icons/checked.svg" alt="checked icon">
            <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon">
          </v-list-item>
        </v-list>
        <!-- <v-card
          v-for="(item, i) in dataPayments" :key="i"
          color="transparent"
          class="payment-card-coin space"
          @click="onSelected(item)"
        > -->
          <!-- <div class="center" style="gap: 14px;">
            <h5 class="mb-0">{{ item.payment_method }}</h5>
          </div> -->

          <!-- <div class="d-flex flex-column">
            <span>{{ item.balance }} {{ item.coin }}</span>
            <span>${{ item.balance_usd }}</span>
          </div> -->
        <!-- </v-card> -->
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import tokens from '@/services/tokens';

export default {
  name: "ModalPayment",
  props: {
    dataPayments: {
      type: Array,
      default: undefined,
    }
  },
  data() {
    return {
      model: false,
      search: '',
      selectedCoin: undefined,
      loading: false,
      selectedPayment: "",
      tokensData: [],
      dataTokensFinal: [
        // {
        //   contract: ,
        //   balance: walletUtils.formatTokenAmount(balance, metadata.decimals, 5),
        //   name: metadata.name,
        //   symbol: metadata.symbol,
        //   decimals: metadata.decimals,
        //   icon: metadata.icon,
        //   balance_usd: Number(walletUtils.formatTokenAmount(balance, metadata.decimals, 5)) * Number(price),
        //   price
        // }*
        {
          icon: require('@/assets/sources/countries/usa.svg'),
          coin: "USD",
          name: "PAYPAL",
          balance: "50,000",
          balance_usd: "0.98 USD/USDT"
        },
        {
          icon: require('@/assets/sources/countries/vnzla.svg'),
          coin: "VES",
          name: "PAGO MOVIL",
          balance: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/countries/arg.svg'),
          coin: "ARS",
          name: "MERCADO PAGO",
          balance: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/countries/eur.svg'),
          coin: "EUR",
          name: "BIZUM",
          balance: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/countries/ngn.svg'),
          coin: "NGN",
          name: "TRANSFERENCIA (NGN)",
          balance: "59.744",
          balance_usd: "79.379"
        },
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
      const storedTokenBalances = JSON.parse(sessionStorage.getItem('allTokenBalances'));

      let inventory;
      // console.log('Stored data:', storedTokenBalances);
      if (storedTokenBalances) {
        // If session storage data exists, use it as the inventory
        inventory = { fts: storedTokenBalances };
        // console.log('Loaded data from session storage:', inventory);
      } else {
        // Otherwise, fetch the inventory from the API
        inventory = await tokens.updateBalanceLocalStorage(); // await tokens.getListTokensBalance();
        // console.log('Fetched data from API:', inventory);
      }

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
      // console.log('Final data:', this.dataTokensFinal);
    },
    onSelected(item) {
      this.model = false;
      this.$emit('on-selected-coin', item)
    }
  },

}
</script>

<style lang="scss" src="@/assets/styles/components/payments.scss"></style>
