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
        <v-select
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
        </v-select>
        <v-btn
          :disabled="!selectedFiat"
          :loading="loading"
          class="btn-outlined flex-grow-1"
          style="--h: 34px; width: min(100%, 192px)"
          @click="$router.push('/withdraw'), loading = true"
        >
          <span style="color: #000 !important">RETIRAR FIAT</span>
        </v-btn>
      </v-card>
    </div>
  </v-form>
</template>

<script>
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import walletUtils from '@/services/wallet';
import wallet from '@/services/local-storage-user';

export default {
  name: "SendPage",
  data() {
    return {
      selectedFiat: null,
      validForm: true,
      amount: "",
      tokenImg: require('@/assets/sources/logos/near-icon.svg'),
      tokenSymbol: "NEAR",
      balance: 0.00,
      required: [(v) => !!v || "Campo requerido", (v) => Number(v) <= Number(this.balance) || "Saldo insuficiente" ],
      dataToken: null,
      listFiats: [],
      loading: false,
      data: [],
    }
  },
  head() {
    const title = 'Send';
    return {
      title,
    }
  },

  mounted() {
    this.getBalance();
    this.selects();
    // If not session storage with data orden will verify
    this.orderSell();
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
      let balanceNear = 0.00;

      const { near } = await walletUtils.getBalance();

      if(near) {
        balanceNear = near;
      }

      this.balance = balanceNear.toFixed(5);

    },

    maxBalance() {
      this.amount = this.balance.toFixed(5);
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

    selects() {
      const selects = gql`
        query MyQuery {
          fiatmethods(orderBy: id) {
            id
            flagcdn
            fiat_method
          }
        }
      `;

      this.$apollo
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
    orderSell() {
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
      }
      `;    
       this.$apollo
          .watchQuery({
            query: selects,
            variables: {
              address: wallet.getCurrentAccount().address // localStorage.getItem("address"),
            }, pollInterval: 3000
          })
          .subscribe(({ data }) => {
            if (data.ordersells.length > 0) {
              Object.entries(data.ordersells).forEach(([key, value]) => {
                this.data = [];
                this.data.push(value);
                sessionStorage.setItem('data', this.data.length);
                this.orderId = this.data[0].order_id;
                sessionStorage.setItem('data', this.data.length);
                localStorage.setItem('emailCounter', 'true');
                localStorage.setItem('orderId', this.data[0].order_id);
              });
            } else {
              this.orderBuy();
            }
          });
    },
    orderBuy() {
      const selects = gql`
        query MyQuery( $address : String) {
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
       this.$apollo
          .watchQuery({
            query: selects,
            variables: {
              address: wallet.getCurrentAccount().address,
            }, pollInterval: 3000
          })
          .subscribe(({ data }) => {
            if (data.orderbuys.length > 0) {
              Object.entries(data.orderbuys).forEach(([key, value]) => {
                this.data = [];
                this.data.push(value);
                sessionStorage.setItem('data', this.data.length);
                this.orderId = this.data[0].order_id;
                sessionStorage.setItem('data', this.data.length);
                localStorage.setItem('emailCounter', 'true');
                localStorage.setItem('orderId', this.data[0].order_id);
              });
            }
          });
    },
  },
}
</script>

<style src="@/assets/styles/pages/send.scss" lang="scss"></style>
