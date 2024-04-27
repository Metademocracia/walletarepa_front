<template>
  <div id="trades-chat" class="d-flex flex-column">
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
          <p style="font-size: 14px!important; text-align: justify;" >Pulse el botón "MARCAR PAGO REALIZADO" para culminar la transacción. <br/><br/> Si considera alguna actividad inusual o no ha podido culminar la operación, puede iniciar un proceso de disputa pulsando el botón reportar.</p>
        </div>
          </v-card>
        </div>
      </v-card>
    </v-dialog>

    <modal-warning
      ref="aproveModal"
    >
      <template #action>
        <v-btn class="btn-outlined-2 mt-6" @click="$refs.aproveModal.model = false">
          VOLVER
        </v-btn>
      </template>

      <p>
        USTED ESTA A PUNTO APROBAR EL INTERCAMBIO, ESTÁ DE ACUERDO CON LA TRANSACCIÓN
      </p>

      <!-- <v-textarea
        placeholder="COLOQUE AQUÍ LA DENUNCIA HACIA LA CONTRAPARTE"
        hide-details solo
        class="flex-grow-0"
        style="--br: 10px; --c-place: #000 !important"
      ></v-textarea> -->

      <v-btn  class="btn mt-2 mb-8" :loading="btnLoading"  @click="aprove" >
        MARCAR PAGO COMO REALIZADO
      </v-btn>

    </modal-warning>
    

    <modal-warning
      ref="warningModal"
    >
      <template #action>
        <v-btn class="btn-outlined-2 mt-6" @click="$refs.warningModal.model = false">
          VOLVER
        </v-btn>
      </template>

      <p>
        USTED ESTA A PUNTO CANCELAR EL INTERCAMBIO DEBIDO A UN COMPORTAMIENTO INUSUAL EN LA CONTRAPARTE
      </p>

      <!-- <v-textarea
        placeholder="COLOQUE AQUÍ LA DENUNCIA HACIA LA CONTRAPARTE"
        hide-details solo
        class="flex-grow-0"
        style="--br: 10px; --c-place: #000 !important"
      ></v-textarea> -->

      <v-btn  class="btn mt-2 mb-8" :loading="btnLoading"  @click="dispute" >
        INICIAR DISPUTA
      </v-btn>
    </modal-warning>

    <Header hide-append class="mb-4">
      <template #prepend>
        <v-btn class="btn-icon-shadow ml-auto" @click="$router.back()">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>

    <div class="d-flex mb-4" style="gap: 10px;">
      <v-card class="card d-flex align-center px-4 flex-grow-1" style="--bg: var(--card-2)">
        <profile-avatar
          show-name
          :profile="{
            name: 'Iniciar Trade',
            avatar: require('@/assets/sources/avatars/avatar.png'),
            verified: true,
          }"
        ></profile-avatar>
      </v-card>

      <v-btn
        :disabled="disputeDiabled"
        class="btn"
        style="--bg: var(--card-2); --br: 10px; --f: none; box-shadow: none;"
        @click="$refs.warningModal.model = true"
      >
        <span style="color: var(--primary) !important">DISPUTA</span>
      </v-btn>
    </div>


    <v-card class="card mb-4 px-4 py-2 d-flex justify-space-between" style="--bg: var(--card-2); --br: 10px">
      <h6 class="mb-0" style="--ff: var(--font3); --fs: 16px; translate: 0 2px">MONTO A ENVIAR</h6>
      <span style="font-family: var(--font2); font-weight: 700 !important; font-size: 11px !important; color: #333 !important">
        {{ operationAmount }} {{ tokenSymbol }}
      </span>
    </v-card>
    
    <v-card class="card mb-4 px-4 py-2 d-flex justify-space-between" style="--bg: #BFFBFA; --br: 10px">
      <h6 class="mb-0" style="--ff: var(--font3); --fs: 16px; translate: 0 2px">MONTO A RECIBIR</h6>
      <span style="font-family: var(--font2); font-weight: 700 !important; font-size: 11px !important; color: #333 !important">
        {{ fiatSymbol }} {{ formatNumber(receiveAmount) }}
      </span>
    </v-card>


    <p2p-chat-trade class="mb-5"
    ></p2p-chat-trade>

    <v-btn
      :loading="btnLoading" 
      class="btn mt-3 mb-4"
      style="--bg: var(--primary); --br: 30px"
      @click="$refs.aproveModal.model = true"
    >MARCAR PAGO REALIZADO</v-btn>

    <!--<v-btn
      :loading="btnLoading" 
      class="btn mt-2 mb-4"
      style="--bg: var(--primary); --br: 30px"
      @click="sendMailDispute"
    >MARCAR PAGO REALIZADO</v-btn>-->

    <v-btn
      v-if="cancelVisible"
      :loading="btnLoading" 
      class="btn-outlined mb-4"
      style="--bg: var(--card-2); --br: 30px"
      @click="cancel"
    >CANCELAR ORDEN</v-btn>

    <h6 style="--ff: var(--font2); --fw: 700; --fs: 10px; --lh: 1ch">
      APENAS TERMINE DE TRANSFERIR PUEDE HACER  CLICK

      <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px" @click="dialog2 = true">
    </h6>
  </div>
</template>


<script>
import axios from 'axios';
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import encrypDecript from "@/services/encryp";
import wallet from '@/services/local-storage-user'
import walletUtils from "@/services/wallet";

export default {
  name: "TradesChatPage",
  data() {
    return {
      address: localStorage.getItem("address"),
      data: [],
      dataTrader: [],
      dataCancel: [],
      terms: "",
      receiveAmount: 0,
      tokenSymbol: "",
      tokenImage: "",
      fiatSymbol: "",
      crypto: "",
      exchangeRate: 0,
      operationAmount: 0,
      dialog2: false,
      btnLoading: false,
      orderId: "",
      polling: null,
      cancelVisible: false,
      disputeDiabled: false,
      operation: "",
    }
  },
  head() {
    const title = 'Trades Chat';
    return {
      title,
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
      // if (sessionStorage.getItem('traderName')) {
      //   this.traderName = sessionStorage.getItem('traderName');
      // } else {
      await this.$apollo
        .watchQuery({
          query: selects,
          variables: {
            address: ownerId,
          },
        })
        .subscribe(({ data }) => {
						Object.entries(data.datausers).forEach(([key, value]) => {
            this.dataTrader.push(value);
            this.traderName = this.dataTrader.length > 0 ? this.dataTrader[0].name + ' ' + this.dataTrader[0].last_name : ownerId;
            sessionStorage.setItem('traderName', this.traderName);
          });
        });
      // }
    },
    orderSell() {
      this.operation = "SELL";
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
            address: wallet.getCurrentAccount().address,
          },
        })
        .subscribe(({ data }) => {
            if (data && data.ordersells) {
              this.data = [];
              Object.entries(data.ordersells).forEach(([key, value]) => {
                  this.data.push(value); 
                  this.trader(this.data[0].owner_id);
                  this.terms = this.data[0].terms_conditions;
                  sessionStorage.setItem('terms', this.terms);
                  walletUtils.getPrice(this.crypto, this.tokenSymbol).then(price => {
                    this.exchangeRate = this.data[0].exchange_rate * price;
                    this.receiveAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) * this.exchangeRate: (this.data[0].operation_amount / 1e6) * this.exchangeRate;     
                  }); 
                  this.operationAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) : (this.data[0].operation_amount / 1e6);               
                  this.orderId = this.data[0].order_id;
                  localStorage.setItem('orderId', this.orderId)
                  /// //////////////////////////////////////
                  this.tokenSymbol = this.data[0].asset;
                  this.tokenImage = this.data[0].asset === "USDT" ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMicgaGVpZ2h0PSczMic+PGcgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScxNicgY3k9JzE2JyByPScxNicgZmlsbD0nIzI2QTE3QicvPjxwYXRoIGZpbGw9JyNGRkYnIGQ9J00xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTcnLz48L2c+PC9zdmc+" : "/wallet-arepa/wallet-arepa/assets/sources/logos/near-icon.svg";
                  // this.tokenImage = selectedToken.icon;
                  this.fiatSymbol = this.data[0].fiat_method === "1" ? "Bs." : "$" ;
                  this.crypto = this.data[0].fiat_method === "1" ? "VES" : "USD" ;

                  this.operation === "SELL" ? this.cancelVisible = false : this.cancelVisible = true;
                  this.operation === "true" ? this.disputeDiabled = true : this.disputeDiabled = false;

                  this.pollData();
              });
            } else {
              this.orderBuy();
            }
        });
    },
    orderBuy() {
      this.operation = "BUY";
      const selects = gql`
        query MyQuery( $address : String) {
          ordersbuys(
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
            address: wallet.getCurrentAccount().address,
          },
        })
        .subscribe(({ data }) => {
          // Check if data and data.ordersells exist
          if (data && data.orderbuys) {
            this.data = [];
						Object.entries(data.orderbuys).forEach(([key, value]) => {
								this.data.push(value); 
                this.trader(this.data[0].owner_id);
                this.terms = this.data[0].terms_conditions;
                walletUtils.getPrice(this.crypto, this.tokenSymbol).then(price => {
                   this.exchangeRate = this.data[0].exchange_rate * price;
                   this.receiveAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) * this.exchangeRate: (this.data[0].operation_amount / 1e6) * this.exchangeRate;     
                }); 
                this.operationAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) : (this.data[0].operation_amount / 1e6);               
                this.orderId = this.data[0].order_id;
                localStorage.setItem('orderId', this.orderId)
                /// //////////////////////////////////////
                this.tokenSymbol = this.data[0].asset;
                this.tokenImage = this.data[0].asset === "USDT" ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMicgaGVpZ2h0PSczMic+PGcgZmlsbD0nbm9uZScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScxNicgY3k9JzE2JyByPScxNicgZmlsbD0nIzI2QTE3QicvPjxwYXRoIGZpbGw9JyNGRkYnIGQ9J00xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTcnLz48L2c+PC9zdmc+" : "/wallet-arepa/wallet-arepa/assets/sources/logos/near-icon.svg";
                // this.tokenImage = selectedToken.icon;
                this.fiatSymbol = this.data[0].fiat_method === "1" ? "Bs." : "$" ;
                this.crypto = this.data[0].fiat_method === "1" ? "VES" : "USD" ;

                this.operation === "SELL" ? this.cancelVisible = false : this.cancelVisible = true;
                this.operation === "true" ? this.disputeDiabled = true : this.disputeDiabled = false;

                this.pollData();
            });
          } else {
            this.orderHistorySell();
          }
        });
    },
    formatNumber(number) {
      return new Intl.NumberFormat('es-VE', { 
        style: 'decimal', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(number);
    },
    async aprove() {
      this.btnLoading = true;
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      const account = await walletUtils.nearConnection();
      const orderConfirmation = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: "order_confirmation",
        gas: "300000000000000",
        args: { offer_type: 1, order_id: parseInt(this.order_id) },
        attachedDeposit: "3"
      });
      // console.log("orderConfirmation", orderConfirmation)
      if (!orderConfirmation || orderConfirmation.status.SuccessValue !== "") {
        console.log("Error confirmando la orden");
        return
      }
      // console.log("orderConfirmation", orderConfirmation)

      const deleteContract = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: "delete_contract",
        gas: "300000000000000",
        args: {},     
      });

      // console.log("deleteContract", deleteContract)

      if (!deleteContract || deleteContract.status.SuccessValue !== "") {
        console.log("Error borrando el contrato");
      }
      this.sendMail('sell', this.order_id);
      sessionStorage.clear(); // Clear all data from sessionStorage
      localStorage.removeItem('orderId')
      this.btnLoading = false;
      this.$router.push({ path: "/tx-executed" });
    },
    async cancel() {
      this.btnLoading = true;
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      const account = await walletUtils.nearConnection();

      const orderConfirmation = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: "cancel_order",
        gas: "300000000000000",
        args: { offer_type: 2, order_id: parseInt(this.order_id) },
        attachedDeposit: "3"
      });
      // console.log("orderConfirmation", orderConfirmation)
      if (!orderConfirmation || orderConfirmation.status.SuccessValue !== "") {
        console.log("Error cancelando la orden");
        return
      }
      // console.log("orderConfirmation", orderConfirmation)
      this.sendMailCancel(this.order_id);
      this.orderHistorySell();
      sessionStorage.clear(); // Clear all data from sessionStorage
      localStorage.removeItem('orderId')
      this.btnLoading = false;
      // this.sendMail();
      this.$router.push({ path: "/tx-canceled" });
    },
    async dispute() {
      this.btnLoading = true;
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      const account = await walletUtils.nearConnection();
      const type = this.operation === "SELL" ? 1 : 2;
      const orderConfirmation = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: "order_dispute",
        gas: "300000000000000",
        args: { offer_type: type, order_id: parseInt(this.order_id) },
        attachedDeposit: "3"
      });
      // console.log("orderConfirmation", orderConfirmation)
      if (!orderConfirmation || orderConfirmation.status.SuccessValue !== "") {
        console.log("Error cancelando la orden");
        return
      }
      // console.log("orderConfirmation", orderConfirmation)
      this.sendMailDispute(this.order_id);
      this.btnLoading = false;
      // this.sendMail();
      this.$router.push({ path: "/tx-disputed" });
    },
    orderHistorySell() {
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
        this.$apollo
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
    orderHistoryBuy() {
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
        this.$apollo
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
             } 
          });
    },
    async sendMailCancel(order) { 
        const data = await walletUtils.verifyWallet();
        const email = data?.data?.email;
        if(this.dataTrader.length>0){
          const emailTrader = await encrypDecript.decryp(this.dataTrader[0].email);
          const BASE_URL_MAIL = process.env.VUE_APP_API_MAIL_URL;
          const MAILCANCEL = `${BASE_URL_MAIL}cancel/`;
          const serviceUrl = `${MAILCANCEL}admin@nearp2p.com/${emailTrader},${email}/${order}`;
          if(emailTrader){   
           await axios.get(serviceUrl);
          }
       }
		},
    async sendMailDispute(order) { 
        const data = await walletUtils.verifyWallet();
        const email = data?.data?.email;
        if(this.dataTrader.length>0){
          const emailTrader = await encrypDecript.decryp(this.dataTrader[0].email);
          const BASE_URL_MAIL = process.env.VUE_APP_API_MAIL_URL;
          const MAILDISPUTE = `${BASE_URL_MAIL}dispute/`;
          const serviceUrl = `${MAILDISPUTE}admin@nearp2p.com/${emailTrader},${email}/${order}/sell`;
          if(emailTrader){   
            await axios.get(serviceUrl);
          }
       }
		},
    async sendMail(typeOffer, order) { 
        const data = await walletUtils.verifyWallet();
        const email = data?.data?.email;
        if(this.dataTrader.length>0){
          const emailTrader = await encrypDecript.decryp(this.dataTrader[0].email);
          const BASE_URL_MAIL = process.env.VUE_APP_API_MAIL_URL;
          const MAIL = `${BASE_URL_MAIL}admin@nearp2p.com/`;
          const serviceUrlTrader = `${MAIL}${emailTrader}/${order}/${typeOffer.toString()}`;
          const serviceUrlCustomer = `${MAIL}${email}/${order}/${typeOffer.toString()}`;
          // console.log(serviceUrl);
          if(emailTrader){   
            await axios.get(serviceUrlTrader);
            await axios.get(serviceUrlCustomer);
          }
       }
		},
  }
};
</script>

<style src="~/assets/styles/pages/trades-chat.scss" lang="scss" />
