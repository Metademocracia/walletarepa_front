<template>
  <div id="trades-pending" class="d-flex flex-column">
    <v-dialog
    v-model="dialog"
    max-width="max-content"
    :overlay-opacity=".9"
    content-class="modal-cryptos"
  >
    <v-card class="cryptos-card">
      <div
        class="cryptos-card__wrapper"
      >
        <v-card
          color="transparent"
          class="cryptos-card-coin space"
          @click="onSelected(item)"
        >
        <div class="center" style="gap: 14px;">
        <p style="font-size: 25px!important" v-html="terms"></p>
      </div>
        </v-card>
      </div>
    </v-card>
  </v-dialog>

    <Header top-text="EN ESPERA DE" bottom-text="CONFIRMACIÓN" bottom-text-dir="ltr" hide-prepend class="mb-4">
      <template #prepend>
        <v-btn class="btn-icon-shadow ml-auto" @click="$router.back()">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>

    <aside
      style="display: grid; grid-template-columns: repeat(5, 1fr) 35px; grid-template-rows: repeat(2, 1fr) 35px; gap: 15px;">
      <v-card 
      class="card pa-4 px-6 d-flex"
        style="--bg: var(--card-2); grid-column: span 4; grid-row: span 2; gap: 5px;">
        <div>
          <p class="mb-0" style="font-family: var(--font3) !important; --fs: 12px">
            Tiempo estimado para la confirmación del pago:
          </p>

          <span 
          style="font-family: var(--font3) !important; font-size: 24px !important;"
            v-text="formattedTime(seconds)" />
        </div>

        <img src="@/assets/sources/icons/reloj.svg" alt="clock icon">
      </v-card>

      <v-card class="card clock pa-4" style="--bg: var(--card-2); grid-column: span 2; grid-row: span 2;">
        {{ formattedTime(secondsEstimated) }}
      </v-card>

      <v-card class="card px-4 d-flex align-center justify-space-between" style="--bg: #D6DAE2; grid-column: span 5">
        <profile-avatar 
        show-name :profile="{
          name: 'Iniciar Intercambio',
          avatar: require('@/assets/sources/avatars/avatar.png'),
          verified: true,
        }" />

        <v-icon color="var(--primary)">mdi-chevron-right</v-icon>
      </v-card>

      <v-badge offset-x="10px" offset-y="10px" :value="true" content="3" style="--c: #fff">
        <v-btn class="btn-icon" style="--bg: #000; --size: 35px; --br: 10px" @click="$router.push('/trades-chat')">
          <img src="@/assets/sources/icons/live-chat.svg" alt="chat icon">
        </v-btn>
      </v-badge>
    </aside>


    <aside 
    class="my-4"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 151px), 1fr)); grid-auto-rows: 111px; gap: 15px;">
      <v-card class="card-outline flex-grow-1 d-flex flex-column pa-4">
        <p class="mb-1">Nombre de comprador</p>
        <span 
        class="d-flex"
          style="font-family: var(--font3) !important; font-size: 13px; line-height: 2ch !important;">
          {{ traderName }}
          </span>

        <a class="mt-auto ml-auto d-flex align-center" style="font-size: 11px; --fw: 700">
          <img src="@/assets/sources/icons/info.svg" alt="info icon" class="mr-2">
          <span 
          class="d-flex"
            style="--c: #000; font-weight: 400 !important; font-size: 9px !important; line-height: normal !important;"
            @click="goToSupport">Atención
            al cliente 24/7 de NEAR P2P</span>
          <v-icon size="18">mdi-chevron-right</v-icon>
        </a>
      </v-card>

      <v-card class="card flex-grow-1 d-flex flex-column pa-4" style="--bg: var(--card-2)">
        <p class="mb-2">Términos del anunciante</p>

        <p class="mb-0" v-html="terms.slice(0, 58) + '...'"></p>

        <a 
        class="mt-auto ml-auto d-flex align-center" style="font-size: 11px; --fw: 700"
          @click="dialog = true">
          VER MÁS
          <v-icon size="18">mdi-chevron-right</v-icon>
        </a>
      </v-card>
    </aside>

    <v-card class="card-outline pa-4">
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0" style="font-weight: 700 !important;">VENDER {{ tokenSymbol }}</p>
        <img :src="tokenImage" alt="crypto coin" style="width: 20px;">
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0">Monto a recibir</p>
        <span class="mb-0" style="font-weight: 700 !important; font-size: 16px !important">{{ fiatSymbol }} {{ formatNumber(receiveAmount) }}</span>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <p class="mb-0">Price:</p>
        <p class="mb-0" style="font-weight: 700 !important;">{{ fiatSymbol }} {{ formatNumber(exchangeRate) }}</p>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <p class="mb-0">Crypto Amount:</p>
        <p class="mb-0" style="font-weight: 700 !important;">{{ operationAmount }} {{ tokenSymbol }}</p>
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0">Orden número:</p>
        <p class="mb-0">{{ orderId }}</p>
      </div>
    </v-card>

    <v-btn class="btn-outlined mb-4 mt-8" style="--bg: var(--card-2)" @click="$router.push('/trades-chat')">VOLVER AL CHAT</v-btn>

    <v-btn class="btn" @click="$router.push('/')" >IR A LA BILLETERA</v-btn>

    <h6 class="d-flex mt-8" style="--ff: var(--font2); --fw: 700; --fs: 10px; --lh: normal">
      PUEDE SEGUIR HACIENDO OTRAS TAREAS<br><br><br>
      PARA VOLVER AQUÍ PUEDE DAR CLIC EN ACTIVIDADES RECIENTES, EN LA ZONA INFERIOR DE LA VENTANA PRINCIPAL

      <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px">
    </h6>
  </div>
</template>


<script>
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import { formattedTime } from '@/plugins/functions'
import walletUtils from "@/services/wallet";

export default {
  name: "TradesPendingPage",
  data() {
    return {
      formattedTime,
      startTime: null,
      seconds: 0,
      secondsEstimated: 300,
      address: localStorage.getItem("address"),
      data: [],
      dataTrader: [],
      traderName: "",
      terms: "",
      dialog: false,
      receiveAmount: 0,
      tokenSymbol: "",
      tokenImage: "",
      fiatSymbol: "",
      crypto: "",
      exchangeRate: 0,
      operationAmount: 0,
      orderId: 0
    }
  },
  head() {
    const title = 'Trades Pending';
    return {
      title,
    }
  },
  watch: {
    seconds: {
    handler(value) {
      if (value > 0) {
        let endTime = localStorage.getItem('endTime');
        if (!endTime) {
          endTime = Date.now() + value * 1000;
          localStorage.setItem('endTime', endTime);
        }
        this.startCountdown();
      }
      },
      immediate: true
    },
    secondsEstimated: {
      handler(value) {
        if (value > 0) setTimeout(() => { this.secondsEstimated-- }, 1000);
      },
      immediate: true
    }
  },
  created() {
    const endTime = localStorage.getItem('endTime');
    if (endTime) {
      const secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
      if (secondsLeft > 0) {
        this.seconds = secondsLeft;
        this.startCountdown();
      } else {
        this.seconds = 0;
      }
    }
  },
  mounted() {
    // Info from trader
    this.selects();
    let selectedToken = localStorage.getItem("selectedCoin");
    if (selectedToken) {
      selectedToken = JSON.parse(selectedToken);
      this.tokenSymbol = selectedToken.symbol;
      this.tokenImage = selectedToken.icon;
    }
    this.fiatSymbol = localStorage.getItem("selectedFiat") === "1" ? "Bs." : "$" ;
    this.crypto = localStorage.getItem("selectedFiat") === "1" ? "VES" : "USD" ;
  },
  methods: {
    selects() {
      const selects = gql`
        query MyQuery( $address : String) {
          ordersells(
            where: {signer_id: $address}
          orderBy: id
          orderDirection: desc
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
            address: localStorage.getItem("address"),
          },
        })
        .subscribe(({ data }) => {
            this.data = [];
						Object.entries(data.ordersells).forEach(([key, value]) => {
								this.data.push(value);
                this.trader( this.data[0].owner_id );   
                this.terms = this.data[0].terms_conditions;
                walletUtils.getPrice(this.crypto, this.tokenSymbol).then(price => {
                   this.exchangeRate = this.data[0].exchange_rate * price;
                   this.receiveAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) * this.exchangeRate: (this.data[0].operation_amount / 1e6) * this.exchangeRate;     
                }); 
                this.operationAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) : (this.data[0].operation_amount / 1e6);               
						    this.orderId = this.data[0].order_id;    
                this.seconds = this.data[0].time * 1000;
            });
        });
        
    },
    trader( ownerId ) {
      const selects = gql`
        query MyQuery( $address : String) {
          datausers(where: {user_id: $address}) {
          name
          last_name
        }
      }
      `;
      this.$apollo
        .watchQuery({
          query: selects,
          variables: {
            address: ownerId,
          },
        })
        .subscribe(({ data }) => {
            this.dataTrader = [];
						Object.entries(data.datausers).forEach(([key, value]) => {
								this.dataTrader.push(value);
                this.traderName = this.dataTrader.length > 0 ? this.dataTrader[0].name + ' ' + this.dataTrader[0].last_name : ownerId;
						});
        });
        
    },
    goToSupport() {
      window.open('https://t.me/nearp2p', '_blank');
    },
    formatNumber(number) {
      return new Intl.NumberFormat('es-VE', {  currency: 'VES' }).format(number);
    },
    startCountdown() {
      const intervalId = setInterval(() => {
        const endTime = localStorage.getItem('endTime');
        if (endTime) {
          const secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
          if (secondsLeft > 0) {
            this.seconds = secondsLeft;
          } else {
            this.seconds = 0;
            localStorage.setItem('endTime', '0'); // Set endTime in localStorage to 0
            clearInterval(intervalId);
          }
        } else {
          clearInterval(intervalId);
        }
      }, 1000);
    },
    
  }
};
</script>

<style src="~/assets/styles/pages/trades-pending.scss" lang="scss" />
