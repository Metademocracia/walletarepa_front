<template>
  <v-form ref="form" v-model="validForm">
    <div id="send" class="d-flex flex-column">
      <ModalCryptos
        ref="cryptos"
        @on-selected-coin="coin => selectToken(coin)"
      ></ModalCryptos>

      <Header show-append>
      <template #prepend>
        <nuxt-link :to="localePath('/')">
          <img src="@/assets/sources/logos/logo.svg" alt="logo" style="--w: 34px">
        </nuxt-link>
      </template>
    </Header>

      <!--<aside class="d-flex" style="gap: 12px; margin-top: 26px;">
        <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);">
          ENVIAR
        </v-btn>

        <v-btn class="btn flex-grow-1">
          RECIBIR
        </v-btn>
      </aside>-->


      <section class="d-flex flex-column" style="height: 248px;">
        <v-text-field
          v-model="amount"
          placeholder="0.0"
          type="number"
          :rules="required"
          required
        ></v-text-field>

        <v-btn
          class="btn-outlined mx-auto"
          style="--bg: var(--secondary); --b-color: var(--primary); --c: var(--primary); --fs: 12px; --fw: 700; --ls: 0.36px; --h: 34px; width: 121px;"
          @click="maxBalance()"
        >USAR MÁXIMO</v-btn>
      </section>


      <section class="d-flex flex-column" style="gap: 14px;">
        <!--<v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >-->
        <v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >
          <h5 class="mb-0">SELECCIONAR RECURSO</h5>
          
          <div class="center" style="gap: 6px;">
            <img :src="tokenImg" alt="near icon" style="width: 29px;">
            <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ tokenSymbol }}</span>
            <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
          </div>
        </v-card>

        <v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
        >
          <h5 class="mb-0">DISPONIBLE PARA ENVIAR</h5>
          
          <span style="--fs: 12px; --ls: normal">{{ balance }} {{ tokenSymbol }}</span>
        </v-card>

        <aside class="d-flex" style="gap: 12px">
          <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);" @click="$router.go(-1)">
            CANCELAR
          </v-btn>

          <v-btn
            class="btn flex-grow-1"
            @click="next()"
          >
            CONTINUAR
          </v-btn>
        </aside>
      </section>
      
      <!-- <img src="@/assets/sources/logos/logotype.svg" alt="logo icon" class="mx-auto mt-16 mb-8" style="width: 200px"> -->

      <v-card class="card-outline pa-4 mt-16 d-flex flex-column justify-center align-center" style="--bg: var(--card-2)">
        <p class="text-center" style="--fs: 9px; width: min(100%, 192px)">PARA RETIRAR HACIA BANCO TRADICIONAL</p>
        <!-- <v-select
          v-model="selectedFiat"
          :items="listFiats"
          label="RETIRAR FIAT"
          item-text="fiat_method"
          item-value="fiat_method"
          solo
          :menu-props="{ contentClass: 'menu__content_v2' }"
          class="mt-0 mb-0"
          @change="selectFiat"
        >
          <template #item="{ item }">
            <div class="d-flex">
              <img :src="item.flagcdn" alt="flag" height="20px" class="mr-2">
              <span id="text-inside">{{ item.fiat_method.trim() }}</span>
            </div>
          </template>
        </v-select> -->
        <v-btn
          :loading="loading"
          class="btn-outlined flex-grow-1"
          style="--h: 34px; width: min(100%, 192px)"
          @click="$router.push('/withdraw'), loading = true"
        >
          <span style="color: #000 !important">RETIRAR A BANCO</span>
        </v-btn>
      </v-card>
    </div>
  </v-form>
</template>

<script>
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
// import walletUtils from '@/services/wallet';
import wallet from '@/services/local-storage-user';
import tokensServices from "@/services/tokens";

export default {
  name: "SendPage",
  data() {
    return {
      selectedFiat: null,
      validForm: true,
      amount: "",
      tokenImg: "data:image/svg+xml,%3Csvg width='111' height='90' viewBox='0 0 111 90' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24.4825 0.862305H88.0496C89.5663 0.862305 90.9675 1.64827 91.7239 2.92338L110.244 34.1419C111.204 35.7609 110.919 37.8043 109.549 39.1171L58.5729 87.9703C56.9216 89.5528 54.2652 89.5528 52.6139 87.9703L1.70699 39.1831C0.305262 37.8398 0.0427812 35.7367 1.07354 34.1077L20.8696 2.82322C21.6406 1.60483 23.0087 0.862305 24.4825 0.862305ZM79.8419 14.8003V23.5597H61.7343V29.6329C74.4518 30.2819 83.9934 32.9475 84.0642 36.1425L84.0638 42.803C83.993 45.998 74.4518 48.6635 61.7343 49.3125V64.2168H49.7105V49.3125C36.9929 48.6635 27.4513 45.998 27.3805 42.803L27.381 36.1425C27.4517 32.9475 36.9929 30.2819 49.7105 29.6329V23.5597H31.6028V14.8003H79.8419ZM55.7224 44.7367C69.2943 44.7367 80.6382 42.4827 83.4143 39.4727C81.0601 36.9202 72.5448 34.9114 61.7343 34.3597V40.7183C59.7966 40.8172 57.7852 40.8693 55.7224 40.8693C53.6595 40.8693 51.6481 40.8172 49.7105 40.7183V34.3597C38.8999 34.9114 30.3846 36.9202 28.0304 39.4727C30.8066 42.4827 42.1504 44.7367 55.7224 44.7367Z' fill='%23009393'/%3E%3C/svg%3E", // require('@/assets/sources/logos/near-icon.svg'),
      tokenSymbol: "USDT",
      balance: 0.0,
      required: [(v) => !!v || "Campo requerido", (v) => Number(v) <= Number(this.balance) || "Saldo insuficiente" ],
      dataToken: null,
      listFiats: [],
      loading: false,
      data: [],
      poolOrders: null,
    }
  },
  head() {
    const title = 'Send';
    return {
      title,
    }
  },

  beforeDestroy() {
    if(this.poolOrders) {
  		this.poolOrders.unsubscribe();
    }
	},
  mounted() {
    this.getBalance();
    this.selects();
    // If not session storage with data orden will verify
    this.getOrders();
  },

  methods: {
    next() {
      if(this.$refs.form.validate()) {
        const json = JSON.stringify({
          amount: this.amount,
          dataToken: this.dataToken,
        })
        sessionStorage.setItem("send-json", json);
        this.$router.push({ path: "/send-details" });
      }
    },

    async getBalance() {
      const list = await tokensServices.getListTokensBalance();
      const tokenSelect  = list.fts.find((item) => item.symbol.toLocaleLowerCase() === "USDT".toLocaleLowerCase())
      this.balance = tokenSelect?.balance_usd || 0.0;
      this.dataToken = tokenSelect;

      /* let balanceNear = 0.00;

      const { near } = await walletUtils.getBalance();

      if(near) {
        balanceNear = near;
      }

      this.balance = balanceNear.toFixed(5); */

    },

    maxBalance() {
      this.amount = this.balance;
    },

    selectToken(token) {
      this.balance = Number(token.balance);
      this.tokenImg = token.icon;
      this.tokenSymbol = token.symbol;
      this.dataToken = token.name !== "NEAR" ? token : null;
    },

    selectFiat(fiat) {
      const selectedFiat = this.listFiats.find(item => item.fiat_method === fiat);
      if (selectedFiat) {
        sessionStorage.setItem('selectedFiat', selectedFiat.id);
      } else {
        console.error('Fiat not found');
      }
    },

    async selects() {
      const selects = gql`
        query MyQuery {
          fiatmethods(orderBy: id) {
            id
            flagcdn
            fiat_method
          }
        }
      `;

     await this.$apollo
        .mutate({
          mutation: selects,
        })
        .then((response) => {
          for (let i = 0; i < response.data.fiatmethods.length; i++) {
						this.listFiats.push(response.data.fiatmethods[i]);
					}
          this.listFiats.sort((a, b) =>
						a.fiat_method > b.fiat_method ? 1 : -1
					);
        })
        .catch((err) => {
          console.log("Error", err);
        });
    },
    async getOrders() {
      const selects = gql`
        query MyQuery( $address : String) {
          ordersells(
            where: {signer_id: $address}
          orderBy: id
          orderDirection: desc
          first: 1
          ) {
          id
          amount_delivered
          asset
          exchange_rate
          fee_deducted
          fiat_method
          owner_id
          payment_method
          signer_id
          terms_conditions
          time
          operation_amount
          order_id
        }

        orderbuys(
            where: {signer_id: $address}
          orderBy: id
          orderDirection: desc
          first: 1
          ) {
          id
          amount_delivered
          asset
          exchange_rate
          fee_deducted
          fiat_method
          owner_id
          payment_method
          signer_id
          terms_conditions
          time
          operation_amount
          order_id
        }
      }
      `;    
      this.poolOrders = await this.$apollo
          .watchQuery({
            query: selects,
            // fetchPolicy: 'network-only',
            pollInterval: 5000,
            variables: {
              address: wallet.getCurrentAccount().address // localStorage.getItem("address"),
            }
          })
          .subscribe(( response ) => {

            if(!response.data?.ordersells || !response.data?.orderbuys) return

            const orderBuys = response.data.orderbuys;
            const orderSells = response.data.ordersells;
            const data = orderSells.length > 0 ? orderSells :  orderBuys;
            this.operation = orderSells.length > 0 ? "SELL" : "BUY";
            localStorage.setItem('operation', this.operation);
            if(data.length <= 0) return;

              Object.entries(data).forEach(([key, value]) => {
                this.data = [];
                this.data.push(value);
                sessionStorage.setItem('data', this.data.length);
                this.orderId = this.data[0].order_id;
                sessionStorage.setItem('data', this.data.length);
                localStorage.setItem('emailCounter', 'true');
                sessionStorage.setItem('orderId', this.data[0].order_id);
              });
          });
    },
    // async orderBuy() {
    //   const selects = gql`
    //     query MyQuery( $address : String) {
    //       orderbuys(
    //         where: {signer_id: $address}
    //       orderBy: id
    //       orderDirection: desc
    //       first: 1
    //       ) {
    //       id
    //       amount_delivered
    //       asset
    //       exchange_rate
    //       fee_deducted
    //       fiat_method
    //       owner_id
    //       payment_method
    //       signer_id
    //       terms_conditions
    //       time
    //       operation_amount
    //       order_id
    //     }
    //   }
    //   `;    
    //   await this.$apollo
    //       .watchQuery({
    //         query: selects,
    //         fetchPolicy: 'network-only',
    //         pollInterval: 5000,
    //         variables: {
    //           address: wallet.getCurrentAccount().address,
    //         }
    //       })
    //       .subscribe(({ data }) => {
    //         if (data.orderbuys.length > 0) {
    //           Object.entries(data.orderbuys).forEach(([key, value]) => {
    //             this.data = [];
    //             this.data.push(value);
    //             sessionStorage.setItem('data', this.data.length);
    //             this.orderId = this.data[0].order_id;
    //             sessionStorage.setItem('data', this.data.length);
    //             localStorage.setItem('emailCounter', 'true');
    //             localStorage.setItem('orderId', this.data[0].order_id);
    //           });
    //         }
    //       });
    // },
  },
}
</script>

<style src="@/assets/styles/pages/send.scss" lang="scss"></style>
