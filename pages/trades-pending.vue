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

  <v-dialog
    v-model="dialog2"
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
        <p style="font-size: 14px!important; text-align: justify;" >En la pantalla principal podrá visualizar si tiene una orden pendiente, para que pueda seguir operando con su wallet. <br/><br/> Al culminar el tiempo de la orden, si no ha finalizado la transacción siempre visualizará la pantalla de trasacciones pendientes hasta culminarla</p>
      </div>
        </v-card>
      </div>
    </v-card>
  </v-dialog>

    <Header :top-text="topText" :bottom-text="topBottom" bottom-text-dir="ltr" hide-prepend class="mb-4">
      <template #prepend>
        <v-btn class="btn-icon-shadow ml-auto" @click="$router.back()">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>

    <aside
      style="display: grid; grid-template-columns: repeat(5, 1fr) 35px; grid-template-rows: repeat(2, 1fr) 35px; gap: 15px;">
      <v-card 
      class="card pa-4 px- d-flex"
        style="--bg: var(--card-2); grid-column: span 6; grid-row: span 2; gap: 5px;">
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

     

      <v-card class="card px-4 d-flex align-center justify-space-between" style="--bg: #D6DAE2; grid-column: span 5">
        <profile-avatar 
        show-name :profile="{
          name: 'Iniciar Intercambio',
          avatar: require('@/assets/sources/avatars/avatar.png'),
          verified: true,
        }" />

        <v-icon color="var(--primary)">mdi-chevron-right</v-icon>
      </v-card>

      <v-badge offset-x="10px" offset-y="10px" :value="unreadMessagesActive" :content="unreadMessagesCount" style="--c: #fff">
        <v-btn class="btn-icon" style="--bg: #000; --size: 35px; --br: 10px" @click="$router.push('/trades-chat')">
          <img src="@/assets/sources/icons/live-chat.svg" alt="chat icon">
        </v-btn>
      </v-badge>
    </aside>


    <aside 
    class="my-4"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 151px), 1fr)); grid-auto-rows: 111px; gap: 15px;">
      <v-card class="card-outline flex-grow-1 d-flex flex-column pa-4">
        <p class="mb-1">{{ traderNameTitle }}</p>
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
        <p class="mb-0" style="font-weight: 700 !important;">{{ typeOffer }} {{ tokenSymbol }}</p>
        <img :src="tokenImage" alt="c" style="width: 20px;">
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0">{{ amountTittle }}</p>
        <span class="mb-0" style="font-weight: 700 !important; font-size: 16px !important">{{ fiatSymbol }} {{ formatNumber(receiveAmount) }}</span>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <p class="mb-0">Precio:</p>
        <p class="mb-0" style="font-weight: 700 !important;">{{ fiatSymbol }} {{ formatNumber(exchangeRate) }}</p>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <p class="mb-0">{{ cryptoTittle }}</p>
        <p class="mb-0" style="font-weight: 700 !important;">{{ operationAmount }} {{ tokenSymbol }}</p>
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0">Orden Número:</p>
        <p class="mb-0">{{ orderId }}</p>
      </div>
    </v-card>

    <v-btn class="btn-outlined mb-4 mt-8" style="--bg: var(--card-2)" @click="$router.push('/trades-chat')">VOLVER AL CHAT</v-btn>
    <!-- <v-btn class="btn-outlined mb-4 mt-8" style="--bg: var(--card-2)" @click="sendMail('buy')">VOLVER AL CHAT</v-btn> -->

    <v-btn class="btn" @click="$router.push('/')" >IR A LA BILLETERA</v-btn>

    <h6 class="d-flex mt-8" style="--ff: var(--font2); --fw: 700; --fs: 10px; --lh: normal">
      PUEDE SEGUIR HACIENDO OTRAS TAREAS<br><br><br>
      PARA VOLVER AQUÍ PUEDE DAR CLIC EN ACTIVIDADES RECIENTES, EN LA ZONA INFERIOR DE LA VENTANA PRINCIPAL

      <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px" @click="dialog2 = true">
    </h6>
  </div>
</template>


<script>
import * as nearAPI from "near-api-js";
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import axios from 'axios';
import encrypDecript from "@/services/encryp";
import { formattedTime } from '@/plugins/functions'
import wallet from '@/services/local-storage-user'
import walletUtils from "@/services/wallet";
import { db } from "@/plugins/firebase";
const { utils } = nearAPI;

export default {
  name: "TradesPendingPage",
  data() {
    return {
      formattedTime,
      startTime: null,
      seconds: 0,
      secondsEstimated: 300,
      address: wallet.getCurrentAccount().address,
      data: [],
      dataCancel: [],
      dataTrader: [],
      traderName: "",
      traderNameTitle: "",
      terms: "",
      dialog: false,
      dialog2: false,
      receiveAmount: 0,
      tokenSymbol: "",
      tokenImage: "",
      fiatSymbol: "",
      crypto: "",
      exchangeRate: 0,
      operationAmount: 0,
      orderId: 0,
      typeOffer: "",
      amountTittle: "",
      cryptoTittle: "",
      polling: null,
      topText: "EN ESPERA DE",
      topBottom: "CONFIRMACIÓN",
      intervalId: null,
      secondsLeft: 0,
      unreadMessagesCount: 0,
      unreadMessagesActive: false,
      operation: "",
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
    // this.getUnreadMessagesCount();
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
  beforeDestroy() {
		clearInterval(this.polling);
	},
  mounted() {
    this.orderSell();
    this.orderHistorySell();
  },
  methods: {
    getUnreadMessagesCount(porderid, poperation) {
      try {
        const operation = poperation;
        const orderId = porderid;

        if(!operation || !orderId) return;

        // console.log(operation, `${operation}${orderId}`)
        db
          .collection(process.env.VUE_APP_CHAT_FIREBASE)
          .doc(`${operation}${orderId}`)
          .collection("MESSAGES")
          .where("readed", "==", false)
          .onSnapshot((snapshot) => {
            
            this.unreadMessagesCount = snapshot.size;
            this.unreadMessagesActive = snapshot.size > 0;
          });
      } catch (error) {
        console.error("Failed to get unread messages count:", error);
      }
    },
    async orderSell() {
      this.operation = "SELL";
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
          status
        }
      }
      `;    
        await this.$apollo
          .watchQuery({
            query: selects,
            variables: {
              address: wallet.getCurrentAccount().address,
            }, pollInterval: 3000
          })
          .subscribe(({ data }) => {
            // Check if data and data.ordersells exist
            if (data && data.ordersells) {
              // this.data = [];
              Object.entries(data.ordersells).forEach(([key, value]) => {
                this.data = [];
                this.data.push(value);
                this.trader(this.data[0].owner_id);
                this.terms = this.data[0].terms_conditions;
                walletUtils.getPrice(this.crypto, this.tokenSymbol).then(price => {
                  this.exchangeRate = this.data[0].exchange_rate * price;
                  this.receiveAmount = this.tokenSymbol === "NEAR" ? this.yoctoNEARNEAR(this.data[0].operation_amount) * this.exchangeRate: (this.data[0].operation_amount / 1e6) * this.exchangeRate;
                });
                this.operationAmount = this.tokenSymbol === "NEAR" ? this.yoctoNEARNEAR(this.data[0].operation_amount) : (this.data[0].operation_amount / 1e6);
                sessionStorage.setItem('operationAmount', this.operationAmount);
                this.orderId = this.data[0].order_id;
                localStorage.setItem('orderId', this.orderId)
                this.seconds = this.data[0].time * 1000;
                /// //////////////////////////////////////
                this.tokenSymbol = this.data[0].asset;
                this.tokenImage = this.data[0].asset === "USDT" ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMicgaGVpZ2h0PSczMic+PGcgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScxNicgY3k9JzE2JyByPScxNicgZmlsbD0nIzI2QTE3QicvPjxwYXRoIGZpbGw9JyNGRkYnIGQ9J00xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTcnLz48L2c+PC9zdmc+" : "/wallet-arepa/wallet-arepa/assets/sources/logos/near-icon.svg";
                // this.tokenImage = selectedToken.icon;
                this.fiatSymbol = this.data[0].fiat_method === "1" ? "Bs." : "$" ;
                this.crypto = this.data[0].fiat_method === "1" ? "VES" : "USD" ;

                if(this.data[0].status === 3){
                   this.topText = "TRANSACCIÓN MARCADA PARA";
                   this.topBottom = "DISPUTA";
                   this.stopCountdown();
                   this.seconds = 0;
                   localStorage.removeItem('endTime');
                   localStorage.removeItem('startTime');
                }  
                this.pollData();

                if(this.operation === "SELL"){
                   this.traderNameTitle = "Nombre de comprador:";
                   this.typeOffer = "VENDER"
                   this.amountTittle = "Monto a Recibir:";
                   this.cryptoTittle = "Crypto a Vender:";
                } else {
                   this.traderNameTitle = "Nombre de vendedor:";
                   this.typeOffer = "COMPRAR";
                   this.amountTittle = "Monto a Pagar:";
                   this.cryptoTittle = "Crypto a Recibir:";
                }
                this.getUnreadMessagesCount(this.data[0].order_id, this.operation);
                this.sendMail();

              });
            } else {
              this.orderBuy();
            }
          });
    },
    async orderBuy() {
      this.operation = "BUY";
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
        await this.$apollo
          .watchQuery({
            query: selects,
            variables: {
              address: wallet.getCurrentAccount().address,
            }, pollInterval: 3000
          })
          .subscribe(({ data }) => {
            if (data && data.orderbuys) {
              Object.entries(data.orderbuys).forEach(([key, value]) => {
                this.data = [];
                this.data.push(value);
                this.trader(this.data[0].owner_id);
                this.terms = this.data[0].terms_conditions;
                walletUtils.getPrice(this.crypto, this.tokenSymbol).then(price => {
                  this.exchangeRate = this.data[0].exchange_rate * price;
                  sessionStorage.setItem('exchangeRate', this.exchangeRate);
                  this.receiveAmount = this.tokenSymbol === "NEAR" ? this.yoctoNEARNEAR(this.data[0].operation_amount) * this.exchangeRate: (this.data[0].operation_amount / 1e6) * this.exchangeRate;
                });
                this.operationAmount = this.tokenSymbol === "NEAR" ? this.yoctoNEARNEAR(this.data[0].operation_amount) : (this.data[0].operation_amount / 1e6);
                this.orderId = this.data[0].order_id;
                localStorage.setItem('orderId', this.orderId)
                this.seconds = this.data[0].time * 1000;

                /// //////////////////////////////////////
                this.tokenSymbol = this.data[0].asset;
                this.tokenImage = this.data[0].asset === "USDT" ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMicgaGVpZ2h0PSczMic+PGcgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScxNicgY3k9JzE2JyByPScxNicgZmlsbD0nIzI2QTE3QicvPjxwYXRoIGZpbGw9JyNGRkYnIGQ9J00xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTcnLz48L2c+PC9zdmc+" : "/wallet-arepa/wallet-arepa/assets/sources/logos/near-icon.svg";
                
                this.fiatSymbol = this.data[0].fiat_method === "1" ? "Bs." : "$" ;
                this.crypto = this.data[0].fiat_method === "1" ? "VES" : "USD" ;

                if(this.data[0].status === 3){
                   this.topText = "TRANSACCIÓN MARCADA PARA";
                   this.topBottom = "DISPUTA";
                   this.stopCountdown();
                   this.seconds = 0;
                   localStorage.removeItem('endTime');
                   localStorage.removeItem('startTime');
                }  
                this.pollData();

                if(this.operation === "SELL"){
                   this.traderNameTitle = "Nombre de comprador:";
                   this.typeOffer = "VENDER"
                   this.amountTittle = "Monto a Recibir:";
                   this.cryptoTittle = "Crypto a Vender:";
                } else {
                   this.traderNameTitle = "Nombre de vendedor:";
                   this.typeOffer = "COMPRAR";
                   this.amountTittle = "Monto a Pagar:";
                   this.cryptoTittle = "Crypto a Recibir:";
                }
                this.getUnreadMessagesCount(this.data[0].order_id, this.operation);
                this.sendMail();
              });
           }
          });
    },
    async orderHistorySell() {
      const val = this.operation === "SELL" ? "1" : "2";
      const selects = gql`
        query MyQuery( $id : String) {
          orderhistorysells(
            where: {id: $id}
          ) {
          status
        }
      }
      `;    
        await this.$apollo
          .watchQuery({
            query: selects,
            variables: {
              id: localStorage.getItem('orderId') + '|' + val,
            }, pollInterval: 3000
          })
          .subscribe(({ data }) => {
            if (data && data.ordersells) {
              this.dataCancel = [];
              Object.entries(data.orderhistorysells).forEach(([key, value]) => {
                this.dataCancel.push(value);
                if(this.dataCancel[0].status === 4){
                  sessionStorage.clear(); // Clear all data from sessionStorage
                  this.localStorage.removeItem('emailCounter')
                  this.localStorage.removeItem('orddderId')
                  this.$router.push('/tx-canceled');
                }
              });
            } else {
               this.orderHistoryBuy();
            }  
          });
    },
    async orderHistoryBuy() {
      const val = this.operation === "SELL" ? "1" : "2";
      const selects = gql`
        query MyQuery( $id : String) {
          orderhistorybuys(
            where: {id: $id}
          ) {
          status
        }
      }
      `;    
        await this.$apollo
          .watchQuery({
            query: selects,
            variables: {
              id: localStorage.getItem('orderId') + '|' + val,
            }, pollInterval: 3000
          })
          .subscribe(({ data }) => {
            if (data && data.orderhistorybuys) {
              this.dataCancel = [];
              Object.entries(data.orderhistorybuys).forEach(([key, value]) => {
                this.dataCancel.push(value);
                if(this.dataCancel[0].status === 4){
                  sessionStorage.clear(); // Clear all data from sessionStorage
                  this.localStorage.removeItem('emailCounter')
                  this.localStorage.removeItem('orderId')
                  this.$router.push('/tx-canceled');
                }
              });
            } else {
              this.orderHistorySell();
            }
          });
    },
    async trader( ownerId ) {
      const selects = gql`
        query MyQuery( $address : String) {
          datausers(where: {user_id: $address}) {
          name
          last_name
          email
        }
      }
      `;
      await this.$apollo
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
      // }
    },
    goToSupport() {
      window.open('https://t.me/nearp2p', '_blank');
    },
    formatNumber(number) {
      return new Intl.NumberFormat('es-VE', { 
        style: 'decimal', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(number);
    },
    startCountdown() {
      this.intervalId = setInterval(() => {
        const endTime = localStorage.getItem('endTime');
        if (endTime) {
           this.secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
          if (this.secondsLeft > 0) {
            this.seconds = this.secondsLeft;
          } else {
            this.seconds = 0;
            this.secondsLeft = 0;
            localStorage.removeItem('endTime');
            localStorage.removeItem('startTime');
            this.stopCountdown();
          }
        } else {
          this.stopCountdown();
        }
      }, 1000);
    },
    stopCountdown() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        localStorage.removeItem('endTime');
      }
    },
    yoctoNEARNEAR(yoctoNEAR) {
				const amountInNEAR = utils.format.formatNearAmount(yoctoNEAR);
				// console.log(amountInNEAR);
				return amountInNEAR.toString();
			},
		NEARyoctoNEAR(NEARyocto) {
				const amountInYocto = utils.format.parseNearAmount(NEARyocto);
				// console.log('',amountInYocto);
				return amountInYocto.toString();
			},
    async sendMail() { 
        const data = await walletUtils.verifyWallet();
        const email = data?.data?.email;
        if(this.dataTrader.length>0){
          const emailTrader = await encrypDecript.decryp(this.dataTrader[0].email);
          const BASE_URL_MAIL = process.env.VUE_APP_API_MAIL_URL;
          const MAIL = `${BASE_URL_MAIL}admin@nearp2p.com/`;
          const serviceUrlTrader = `${MAIL}${emailTrader}/0/nueva`;
          const serviceUrlCustomer = `${MAIL}${email}/0/nueva`;
          //  console.log(serviceUrlTrader, serviceUrlCustomer);
          if(emailTrader && (!localStorage.getItem('emailCounter') || localStorage.getItem('emailCounter') !== 'true')){   
            await axios.get(serviceUrlTrader);
            await axios.get(serviceUrlCustomer);
            localStorage.setItem('emailCounter', "true");
          }
       }
		},
    
  }
};
</script>

<style src="~/assets/styles/pages/trades-pending.scss" lang="scss" />
