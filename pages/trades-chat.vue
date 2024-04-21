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

      <v-textarea
        placeholder="COLOQUE AQUÍ LA DENUNCIA HACIA LA CONTRAPARTE"
        hide-details solo
        class="flex-grow-0"
        style="--br: 10px; --c-place: #000 !important"
      ></v-textarea>

      <v-btn class="btn mt-2 mb-8">
        COLOCAR MOTIVO Y ABORTAR
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
        class="btn"
        style="--bg: var(--card-2); --br: 10px; --f: none; box-shadow: none;"
        @click="$refs.warningModal.model = true"
      >
        <span style="color: var(--primary) !important">REPORTAR</span>
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


    <p2p-chat
    ></p2p-chat>

    <v-btn
      :loading="btnLoading" 
      class="btn mt-2 mb-4"
      style="--bg: var(--primary); --br: 30px"
      @click="aprove"
    >MARCAR PAGO REALIZADO</v-btn>

    <h6 style="--ff: var(--font2); --fw: 700; --fs: 10px; --lh: 1ch">
      APENAS TERMINE DE TRANSFERIR PUEDE HACER  CLICK

      <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px" @click="dialog2 = true">
    </h6>
  </div>
</template>


<script>
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import walletUtils from "@/services/wallet";

export default {
  name: "TradesChatPage",
  data() {
    return {
      address: localStorage.getItem("address"),
      data: [],
      terms: "",
      receiveAmount: 0,
      tokenSymbol: "",
      tokenImage: "",
      fiatSymbol: "",
      crypto: "",
      exchangeRate: 0,
      operationAmount: 0,
      orderId: 0,
      dialog2: false,
      btnLoading: false,
    }
  },
  head() {
    const title = 'Trades Chat';
    return {
      title,
    }
  },
  mounted() {
    const time = sessionStorage.getItem('traderName') ? 100 : 3000;
    let counter = 0;
    const maxAttempts = 3;
    // Info from trader
    const intervalId = setInterval(() => {
      this.selects();
      let selectedToken = localStorage.getItem("selectedCoin");
      if (selectedToken) {
        selectedToken = JSON.parse(selectedToken);
        this.tokenSymbol = selectedToken.symbol;
        this.tokenImage = selectedToken.icon;
      }
      this.fiatSymbol = localStorage.getItem("selectedFiat") === "1" ? "Bs." : "$" ;
      this.crypto = localStorage.getItem("selectedFiat") === "1" ? "VES" : "USD" ;

      counter++;

      if (this.data.length > 0 || sessionStorage.getItem('traderName')) {
        clearInterval(intervalId);
      } else if (counter >= maxAttempts) {
        clearInterval(intervalId);
        this.$router.push('/');
      }
    }, time);
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
      if (sessionStorage.getItem('terms') && sessionStorage.getItem('exchangeRate') && sessionStorage.getItem('receiveAmount') && sessionStorage.getItem('operationAmount') && sessionStorage.getItem('orderId')) {
        this.terms = sessionStorage.getItem('terms');
        this.exchangeRate = sessionStorage.getItem('exchangeRate');
        this.receiveAmount = sessionStorage.getItem('receiveAmount');
        this.operationAmount = sessionStorage.getItem('operationAmount');
        this.orderId = sessionStorage.getItem('orderId');
      } else {
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
                this.terms = this.data[0].terms_conditions;
                sessionStorage.setItem('terms', this.terms);
                walletUtils.getPrice(this.crypto, this.tokenSymbol).then(price => {
                   this.exchangeRate = this.data[0].exchange_rate * price;
                   sessionStorage.setItem('exchangeRate', this.exchangeRate);
                   this.receiveAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) * this.exchangeRate: (this.data[0].operation_amount / 1e6) * this.exchangeRate;     
                   sessionStorage.setItem('receiveAmount', this.receiveAmount);
                }); 
                this.operationAmount = this.tokenSymbol === "NEAR" ? (this.data[0].operation_amount / 1e24) : (this.data[0].operation_amount / 1e6);               
						    sessionStorage.setItem('operationAmount', this.operationAmount);
                this.orderId = this.data[0].order_id;   
                sessionStorage.setItem('orderId', this.orderId); 
            });
        });
      }
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
        args: { offer_type: 1, order_id: parseInt(sessionStorage.getItem('orderId')) },
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
      sessionStorage.clear(); // Clear all data from sessionStorage
      localStorage.removeItem('endTime');
      this.btnLoading = false;
      // this.sendMail();
      this.$router.push({ path: "/tx-executed" });
    },
  }
};
</script>

<style src="~/assets/styles/pages/trades-chat.scss" lang="scss" />
