<template>
  <v-form id="withdraw" ref="form" v-model="validForm" class="d-flex flex-column">
    <ModalCryptos ref="cryptos" :filter="filter" @on-selected-coin="(coin) => selectToken(coin)"></ModalCryptos>

    <!-- <ModalPaymentMethods
      ref="paymentMethods"
      :data-payments=otherPayments
      @on-selected-coin="coin => selectToken(coin)"
    ></ModalPaymentMethods> -->

    <v-dialog v-model="modelPayments" max-width="max-content" :overlay-opacity="0.9" content-class="modal-payments">
      <aside class="d-flex justify-end mb-5">
        <v-text-field 
        v-model="search" hide-details solo @input="searchPayments(search)"
          @change="searchPayments(search)">
          <template #append>
            <img src="@/assets/sources/icons/magnify.svg" alt="search icon" />
          </template>
        </v-text-field>
      </aside>

      <v-dialog v-model="modelError"  max-width="max-content" :overlay-opacity="0.9" content-class="modal-payments">
        <aside class="d-flex justify-end mb-5">
          <v-text>
            Error
          </v-text>
        </aside>
       </v-dialog> 

      <v-card class="payment-card">
        <div class="payment-card__wrapper" >
          <v-list class="grid-list">
            <v-list-item 
            v-for="(payment, i) in otherPayments" :key="i" class="payment-card-coin space"
              @click="selectPaymentDialog(payment)">
              <div style="display: flex; align-items: center;">
                <img :src="getFlag(payment)" alt="checked icon" style="margin-right: 10px; height: 14px;" />
                <span class="font-weight-bold">{{ payment }}</span>
              </div>
              <img v-if="selectedPayment == payment" src="@/assets/sources/icons/checked.svg" alt="checked icon" />
              <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon" />
            </v-list-item>
          </v-list>
          <!-- <v-card
            v-for="(item, i) in otherPayments" :key="i"
            color="transparent"
            class="payment-card-coin space"
            @click="selectPaymentDialog(item)"
          > 
          <div class="center" style="gap: 14px;">
            <img :src="getFlag(item)" alt="checked icon" style="margin-right: 10px; height: 14px;" />
              <h5 class="mb-0">{{ item }}</h5>
          </div> 

           <div class="d-flex flex-column">
              <span>{{ item.balance }} {{ item.coin }}</span>
              <span>${{ item.balance_usd }}</span>
            </div> -->
          <!--</v-card>  -->
        </div>
      </v-card>
    </v-dialog>

    <Header hide-navbar top-text="RETIRAR" bottom-text="FONDOS" description="MONTO QUE DESEAS RETIRAR HACIA BOLIVARES">
    </Header>

    <section class="d-flex flex-column" style="height: 208px; translate: 0 -30px">
      <v-text-field 
      v-model="amount" placeholder="0.0" type="number" :rules="required"
        @input="debouncePreviewWithdraw()"></v-text-field>

      <v-btn 
      class="btn-outlined mx-auto" style="
          --bg: var(--secondary);
          --b-color: var(--primary);
          --c: var(--primary);
          --fs: 12px;
          --fw: 700;
          --ls: 0.36px;
          --h: 34px;
          width: 121px;
        " @click="maxBalance()">USAR MÁXIMO</v-btn>
    </section>


    <v-btn 
    class="btn-icon mx-auto"
      style="translate: 0 -30px; --bg: #DEE6EA; box-shadow: none; --b: 1px solid var(--primary); --br: 13px"
      @click="$router.replace('/deposit')">
      <img src="@/assets/sources/icons/swap-vertical.svg" alt="swap icon">
    </v-btn>


    <section class="d-flex flex-column mb-auto" style="gap: 14px">
      <v-card 
      class="btn-outlined space" style="--bg: var(--secondary); --b-color: #d1c4e8; padding: 0 23px"
        @click="$refs.cryptos.model = true">
        <h5 class="mb-0">TOKEN A VENDER</h5>

        <div class="center" style="gap: 6px">
          <img :src="tokenImg" alt="near icon" style="width: 29px" />
          <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{
            tokenSymbol
            }}</span>
          <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right" />
        </div>
      </v-card>

      <v-card class="btn-outlined space" style="--bg: var(--secondary); --b-color: #d1c4e8; padding: 0 23px">
        <h5 class="mb-0">DISPONIBLE PARA ENVIAR</h5>

        <span style="--fs: 12px; --ls: normal">{{ balance }} {{ tokenSymbol }}</span>
      </v-card>

      <v-list class="payment-list">
        <v-list-item v-for="(payment, i) in payments" :key="i" class="payment-item" @click="selectPayment(payment)">
          <div class="payment-details">
            <div class="ml-2 payment-name">{{ payment.name }}</div>
            <div class="mr-2 payment-info">
              <span class="payment-rate">{{ (payment.rate * price).toFixed(2) }} VES/USDT</span>
              <img v-if="selectedPayment === payment" src="@/assets/sources/icons/checked.svg" alt="checked icon" />
              <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon" />
            </div>
          </div>
          <div v-if="i < payments.length - 1" class="divider"></div>
        </v-list-item>
      </v-list>
      <h5 v-if="modalNoOffers" style="color: red !important;">{{ modalNoMessage }}</h5>
      <v-card 
      v-if="moreBanks" class="btn-outlined space"
        style="--bg: var(--secondary); --b-color: #d1c4e8; padding: 0 23px" @click="modelPayments = true">
        <h5 class="mb-0">BUSCAR OTRO MÉTODO</h5>

        <div class="center" style="gap: 6px">
          <v-btn class="btn-icon" style="--b: 1px solid var(--primary)">
            <img src="@/assets/sources/icons/magnify.svg" alt="search icon" />
          </v-btn>
          <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right" />
        </div>
      </v-card>

      <div class="d-flex mt-4" style="gap: 10px">
        <v-btn class="btn-outlined flex-grow-1" :loading="btnLoading" style="--bg: var(--card-2)" @click="$router.push('/')">
          CANCELAR
        </v-btn>

        <v-btn class="btn flex-grow-1" :loading="btnLoading" :disabled="btnContinue" @click="initContract">
          CONTINUAR
        </v-btn>
      </div>

      <h6 
      style="
          font-size: 9px !important;
          --ff: var(--font2);
          --fw: 600;
          --fs: 10px;
          --lh: 1ch;
        ">
        LOS USUARIOS DEBEN RETIRAR HACIA CUENTAS PROPIAS

        <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px" />
      </h6>
    </section>
  </v-form>
  
</template>

<script>
import '@/assets/styles/components/payments.scss';
// import axios from 'axios'
import * as nearAPI from "near-api-js";
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import moment from "moment";
import wallet from '@/services/local-storage-user'
import tokensServices from "@/services/tokens";
import walletUtils from "@/services/wallet";
const { utils } = nearAPI;

export default {
  name: "DepositPage",
  middleware: ["verify-wallet"],
  data() {
    return {
      filter: ["usdt", "near", "arp"],
      selectedPayment: "",
      payments: [],
      btnContinue: true,
      moreBanks: false,
      otherPayments: [],
      price: 0,
      originalPayments: [],
      listFlags: [],
      required: [
        (v) => !!v || "Campo requerido",
        (v) => Number(v) <= Number(this.balance) || "Saldo insuficiente",
      ],
      model: false,
      modelPayments: false,
      modelError: false,
      validForm: true,
      amount: null,
      balance: 0.0,
      tokenImg: "data:image/svg+xml,%3Csvg width='111' height='90' viewBox='0 0 111 90' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24.4825 0.862305H88.0496C89.5663 0.862305 90.9675 1.64827 91.7239 2.92338L110.244 34.1419C111.204 35.7609 110.919 37.8043 109.549 39.1171L58.5729 87.9703C56.9216 89.5528 54.2652 89.5528 52.6139 87.9703L1.70699 39.1831C0.305262 37.8398 0.0427812 35.7367 1.07354 34.1077L20.8696 2.82322C21.6406 1.60483 23.0087 0.862305 24.4825 0.862305ZM79.8419 14.8003V23.5597H61.7343V29.6329C74.4518 30.2819 83.9934 32.9475 84.0642 36.1425L84.0638 42.803C83.993 45.998 74.4518 48.6635 61.7343 49.3125V64.2168H49.7105V49.3125C36.9929 48.6635 27.4513 45.998 27.3805 42.803L27.381 36.1425C27.4517 32.9475 36.9929 30.2819 49.7105 29.6329V23.5597H31.6028V14.8003H79.8419ZM55.7224 44.7367C69.2943 44.7367 80.6382 42.4827 83.4143 39.4727C81.0601 36.9202 72.5448 34.9114 61.7343 34.3597V40.7183C59.7966 40.8172 57.7852 40.8693 55.7224 40.8693C53.6595 40.8693 51.6481 40.8172 49.7105 40.7183V34.3597C38.8999 34.9114 30.3846 36.9202 28.0304 39.4727C30.8066 42.4827 42.1504 44.7367 55.7224 44.7367Z' fill='%23009393'/%3E%3C/svg%3E",
      tokenSymbol: "USDT",
      btnLoading: false,
      search: "",
      address: wallet.getCurrentAccount().address,
      subcontract: {},
      listOffers: [],
      minLimit: 0,
      modalNoOffers: false,
      modalNoMessage: false,
      poolOrders: null,
      nearBalanceObject: 0.0,
      paymentMethods: new Map(), // Add paymentMethods as a data property
      nearToken: null
    };
  },
  head() {
    const title = "Withdraw";
    return {
      title,
    };
  },
  
  beforeDestroy() {
    if(this.poolOrders) {
  		this.poolOrders.unsubscribe();
    }
	},
  mounted() {
    this.getNearTokenBalance()
    if(this.nearToken < 0.05){
      this.modalNoMessage = "Saldo de NEAR insuficiente para operar " + this.nearToken + ". Recargue su wallet al menos con 0.05 NEAR"
      this.modalNoOffers = true;
      this.btnLoading = false;
    }

    if(sessionStorage.getItem("flags")) {
      this.listFlags = JSON.parse(sessionStorage.getItem("flags"));
    } else {
      this.flagscdn();
    }
    this.getBalance();
    walletUtils.getPrice("VES", "USDT").then(price => {
            this.price =  price;   
            }); 
    this.selects();
  },

  methods: {
    searchPayments(search) {
      this.otherPayments = this.originalPayments.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );
    },
    selectPayment(payment) {
      this.selectedPayment = payment;
      this.disabledContinue();
    },
    // selectPaymentDialog(payment) {
    //   this.selectedPayment = payment;
    //   this.payments[2] = payment;
    //   this.otherPayments = this.originalPayments.filter(item => !this.payments.includes(item));
    //   // this.otherPayments = this.originalPayments.filter(
    //   //   (item) => !this.payments.includes(item.payment_method)
    //   // );
    //   this.disabledContinue();
    //   this.modelPayments = false;
    // },
    selectPaymentDialog(payment) {
      this.selectedPayment = payment;
      this.payments[2] = {
        name: payment,
        rate: this.paymentMethods.get(payment) || null, // Reference the paymentMethods map
      };
      this.otherPayments = this.originalPayments.filter(item => !this.payments.some(payment => payment.name === item));
      this.disabledContinue();
      this.modelPayments = false;
    },
    disabledContinue() {
      if (
        this.amount > 0 &&
        this.selectedPayment &&
        this.$refs.form.validate()
      ) {
        this.btnContinue = false;
      } else {
        this.btnContinue = true;
      }
    },
    maxBalance() {
      this.amount = this.balance;
      this.disabledContinue();
    },
    
    async getBalance() {
      const storedTokenBalances = JSON.parse(sessionStorage.getItem('allTokenBalances'));
      // console.log(storedTokenBalances.find((item) => item.symbol.toLocaleLowerCase() === "USDT".toLocaleLowerCase()))
      if(storedTokenBalances) {
        const tokenSelect  = storedTokenBalances.find((item) => item.symbol.toLocaleLowerCase() === "USDT".toLocaleLowerCase())
        this.balance = tokenSelect?.balance || 0.0;
        this.nearBalanceObject = storedTokenBalances.find(item => item.contract === "NEAR").balance || 0.0;
      } else {
        const list = await tokensServices.getListTokensBalance();
        this.balance = list.fts.find((item) => item.symbol.toLocaleUpperCase() === "USDT".toUpperCase())?.balance_usd || 0.0;
        this.nearBalanceObject = list.fts.find(item => item.contract === "NEAR").balance || 0.0;
      }
      // console.log(list.fts)
      /* let balanceNear = 0.0;

      const { near } = await walletUtils.getBalance();

      if (near) {
        balanceNear = near;
      }

      this.balance = balanceNear.toFixed(5); */
    },

    getNearTokenBalance() {
      const allTokenBalances = JSON.parse(sessionStorage.getItem('allTokenBalances'));
      this.nearToken = allTokenBalances.find(item => item.contract === "NEAR").balance || 0.0;
      console.log(this.nearToken)
    },

    selectToken(token) {
      this.balance = Number(token.balance);
      this.tokenImg = token.icon;
      this.tokenSymbol = token.symbol;
      this.dataToken = token.name !== "NEAR" ? token : null;
      this.selects();
    },

    debouncePreviewWithdraw() {
      this.disabledContinue();
      // clearTimeout(this.timer)
      // this.timer = setTimeout(this.previewWithdraw, 1000)
    },
    getFlag(payment) {
      const flag = this.listFlags.find((item) => item.payment_method === payment);
      return flag.input1 === "" ?  "https://flagcdn.com/ve.svg" : flag.input1;
    },
    async flagscdn() {
      const selects = gql`
      query MyQuery {
        paymentmethods {
          payment_method
          input1
        }
      }
      `;
      await this.$apollo
        .watchQuery({
          query: selects,
          // fetchPolicy: 'network-only',
          pollInterval: 5000,
        })
        .subscribe(({ data }) => {
          this.listFlags = [];
          Object.entries(data.paymentmethods).forEach(
            ([key, value]) => {
              this.listFlags.push(value);
            }
          );
          sessionStorage.setItem("flags", JSON.stringify(this.listFlags));
        });
    },
    selects() {
      const selects = gql`
        query MyQuery($token: String, $address: String) {
          offerssells(
            where: { asset_contains: $token, owner_id_not: $address, is_pause: false, remaining_amount_gte: "1" }
            orderBy: exchange_rate
            orderDirection: desc
          ) {
            amount
            asset
            exchange_rate
            fiat_method
            id
            max_limit
            min_limit
            owner_id
            remaining_amount
            status
            terms_conditions
            time
            payment_method {
              payment_method
              payment_method_id
            }
          }
        }
      `;
      this.paymentMethods = new Map();
      this.listOffers = [];
      this.poolOrders = this.$apollo
        .watchQuery({
          query: selects,
          pollInterval: 5000,
          variables: {
            token: this.tokenSymbol.toLocaleUpperCase(),
            address: wallet.getCurrentAccount().address,
          }
        })
        .subscribe(({ data }) => {
          // Clear current payments array
          this.payments = [];
          
          // Process the offerssells data
          data.offerssells.forEach(offer => {
            offer.payment_method.forEach(method => {
              // Add method to the map with the corresponding exchange rate
              this.paymentMethods.set(method.payment_method, offer.exchange_rate);
            });
          });

          // Populate listOffers array
          Object.entries(data.offerssells).forEach(
            ([key, value]) => {
              this.listOffers.push(value);
            }
          );

          // Convert Map to Array and handle moreBanks logic
          let paymentMethodsArray = Array.from(this.paymentMethods.keys());
          paymentMethodsArray.length > 3 ? this.moreBanks = true : this.moreBanks = false;

          // Move "Pago Móvil" to the beginning if it exists
          if (paymentMethodsArray.includes("Pago Móvil")) {
            paymentMethodsArray = paymentMethodsArray.filter(method => method !== "Pago Móvil");
            paymentMethodsArray.unshift("Pago Móvil");
          }
          

          // Slice the first 3 methods and update the payments array
          this.payments = paymentMethodsArray.slice(0, 3).map(method => {
            return {
              name: method,
              rate: this.paymentMethods.get(method) || null, // Get the exchange rate from the map
            };
          });

          // Handle other payments
          this.otherPayments = paymentMethodsArray.filter(item => !this.payments.some(payment => payment.name === item));
          this.originalPayments = paymentMethodsArray;

        });
    },
    async initContract() {
      this.tokenSymbol === "NEAR" ? await this.initContractNEAR() : await this.initContractUSDT();
    },
    async initContractUSDT() {
      this.btnLoading = true;
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      const CONTRACT_NAME_USDT = process.env.VUE_APP_CONTRACT_NAME_USDT;
      /**
       * Converts the withdrawal amount to the appropriate format based on the token symbol.
       * If the token symbol is "NEAR", the amount is multiplied by 1e24.
       * If the token symbol is not "NEAR", the amount is multiplied by 1e6.
       */
      const orderAmount = this.tokenSymbol === "NEAR" ? this.NEARyoctoNEAR(this.amount) : (this.amount * 1e6).toString();
      // Filtering the list by payment method and the highest exchange rate
      // and the remaining amount is greater than the order amount
      // and the prder amount is greater than the min limit
      this.filteredOffers = this.listOffers
        .filter(offer => offer.payment_method.some(method => method.payment_method === this.selectedPayment))
        .filter(offer => parseFloat(offer.remaining_amount) >= parseFloat(orderAmount))
        .filter(offer => parseFloat(offer.min_limit) <= parseFloat(orderAmount))
        .sort((a, b) => b.exchange_rate - a.exchange_rate)
        .find(() => true);
      const lowestMinAmount = Math.min(...this.listOffers.map(offer => offer.min_limit));
      if (!this.filteredOffers) {
        const lowestMinAmountFormated = this.tokenSymbol === "NEAR" ? this.yoctoNEARNEAR(lowestMinAmount) : lowestMinAmount / 1e6;
        this.modalNoMessage = "No hay ofertas disponibles, busque un monto superior a " + lowestMinAmountFormated
        this.modalNoOffers = true;
        this.btnLoading = false;
        return;
      }
      // Filter paymet method as per selected payment
      const filteredPaymentMethod = this.filteredOffers.payment_method.find(method => method.payment_method === this.selectedPayment);

      try {
        const account = await walletUtils.nearConnection();

        const result = await account.viewFunction(CONTRACT_NAME_USDT, "storage_balance_of", { account_id: `${this.address.split(".")[0]}.${CONTRACT_NAME}` });
        
        if ( this.nearBalanceObject < 0.0126 && result == null ) {
          this.modalNoMessage = "Se requiere un balance mínimo de 0.0127 NEAR para iniciar por primera vez la transacción";
          this.modalNoOffers = true;
          this.btnLoading = false;
          return;
        }

        if ( this.nearBalanceObject < 0.0005) {
          this.modalNoMessage = "Deposite al menos 0.0005 NEAR para iniciar el P2P";
          this.modalNoOffers = true;
          this.btnLoading = false;
          return;
        }

        this.subcontract = await account.viewFunctionV1(
          CONTRACT_NAME,
          "get_subcontract",
          { user_id: this.address }
        );
        const now = moment()
          .format("YYYY-MM-DD HH:mm:ss")
          .toString();
        
        if (this.subcontract === null) {
          this.subcontract = { contract: `${this.address.split(".")[0]}.${CONTRACT_NAME}` };
          const createSubCobtractUser = await account.functionCall({
            contractId: CONTRACT_NAME,
            methodName: "create_subcontract_user",
            gas: "30000000000000",
            args: { subaccount_id: this.subcontract.contract, asset: "USDT" },
            attachedDeposit: "1"
          });
          console.log( "create_subcontract_user");
          console.log(createSubCobtractUser);
          // console.log(createSubCobtractUser)
          // if (!createSubCobtractUser || createSubCobtractUser.status.SuccessValue !== "") {
          //   console.log(createSubCobtractUser.status.SuccessValue);
          //   // this.btnLoading = false;
          //   // return
          //   console.log("Error en create_subcontract_user");
          // }
        }

        // console.log(result != null);

        // const getTokenActivo = await account.viewFunctionV1(
        //   CONTRACT_NAME,
        //   "get_token_activo",
        //   { user_id: this.subcontract.contract, ft_token: "USDT" }
        // );
        
        if (result == null) {
           const activarSubcuenta = await account.functionCall({
             contractId: CONTRACT_NAME_USDT,
             methodName: "storage_deposit",
             args: { account_id: this.subcontract.contract },
             gas: "30000000000000",
             attachedDeposit: "1250000000000000000000"
           });
           console.log( "storage_deposit");
           console.log(activarSubcuenta)

        //   // if (!activarSubcuenta || !activarSubcuenta.status.SuccessValue !== "") {
        //   //   console.log("Subcuenta ya activa, procede con el siguiente paso");
        //   //   console.log(activarSubcuenta.status.SuccessValue)
        //   // }
        }
        
        const ftTransfer = await account.functionCall({
          contractId: CONTRACT_NAME_USDT,
          methodName: "ft_transfer",
          gas: "15000000000000",
          args: { receiver_id: this.subcontract.contract, amount: orderAmount },
          attachedDeposit: "1"
        });
        console.log("ft_transfer");
        console.log(ftTransfer)
        // // if (!ftTransfer || ftTransfer.status.SuccessValue !== "") {
        // //   // console.log("error al transferir token");
        // //   // this.btnLoading = false;
        // //   console.log("Error en ft_transfer");
        // // }

        const acceptOffer = await account.functionCall({
          contractId: CONTRACT_NAME,
          methodName: "accept_offer",
          gas: "120000000000000",
          args: {
            offer_type: 1,
            offer_id: parseInt(this.filteredOffers.id),
            amount: orderAmount,
            payment_method: parseInt(filteredPaymentMethod.payment_method_id),
            datetime: now,
            rate: parseFloat(this.filteredOffers.exchange_rate),
            assosiated: "arepaWallet"
          },
          attachedDeposit: "1"
        });
        console.log( "accept_offer");
        console.log(acceptOffer)

        // if (!acceptOffer || acceptOffer.status.SuccessValue !== "") {
        //   // console.log("error al aceptar la oferta", acceptOffer);
        //   // this.btnLoading = false;
        //   // return\
        //   console.log(acceptOffer.status.SuccessValue)
        //   console.log("Error en accept_offer");
        // }
      } catch (error) {
        this.subcontract = {};
        this.btnLoading = false;
        this.modalNoMessage = error.message
        this.modalNoOffers = true;
        console.error(error.message);
        return;
      }


      this.btnLoading = false;
      this.$router.push({ path: "/trades-pending" });
    },
    async initContractNEAR() {
      this.btnLoading = true;
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      /**
       * Converts the withdrawal amount to the appropriate format based on the token symbol.
       * If the token symbol is "NEAR", the amount is multiplied by 1e24.
       * If the token symbol is not "NEAR", the amount is multiplied by 1e6.
       */
      const orderAmount = this.tokenSymbol === "NEAR" ? this.NEARyoctoNEAR(this.amount) : (this.amount * 1e6).toString();

      // Filtering the list by payment method and the highest exchange rate
      // and the remaining amount is greater than the order amount
      this.filteredOffers = this.listOffers
        .filter(offer => offer.payment_method.some(method => method.payment_method === this.selectedPayment))
        .filter(offer => parseFloat(offer.remaining_amount) >= parseFloat(orderAmount))
        .filter(offer => parseFloat(offer.min_limit) <= parseFloat(orderAmount))
        .sort((a, b) => b.exchange_rate - a.exchange_rate)
        .find(() => true);
      const lowestMinAmount = Math.min(...this.listOffers.map(offer => offer.min_limit));
      if (!this.filteredOffers) {
        const lowestMinAmountFormated = this.tokenSymbol === "NEAR" ? this.yoctoNEARNEAR(lowestMinAmount) : lowestMinAmount / 1e6;
        this.modalNoMessage = "No hay ofertas disponibles, busque un monto superior a " + lowestMinAmountFormated;
        this.modalNoOffers = true;
        this.btnLoading = false;
        return;
      }
      // Filter paymet method as per selected payment
      const filteredPaymentMethod = this.filteredOffers.payment_method.find(method => method.payment_method === this.selectedPayment);

      const account = await walletUtils.nearConnection();

      try {
        this.subcontract = await account.viewFunctionV1(
          CONTRACT_NAME,
          "get_subcontract",
          { user_id: this.address }
        );

        const vldeposit = "100000000000000000000000";

        const now = moment()
          .format("YYYY-MM-DD HH:mm:ss")
          .toString();
        if (this.subcontract === null) {
          this.subcontract = { contract: `${this.address.split(".")[0]}.${CONTRACT_NAME}` };;
          const createSubCobtractUser = await account.functionCall({
            contractId: CONTRACT_NAME,
            methodName: "create_subcontract_user",
            gas: "80000000000000",
            args: {},
            attachedDeposit: vldeposit
          });
          // console.log(createSubCobtractUser)
          if (!createSubCobtractUser || createSubCobtractUser.status.SuccessValue !== "") {
            // console.log("error al crear subcontrato");
            this.btnLoading = false;
            return
          }
        }


        const ftTransfer = await account.functionCall({
          contractId: CONTRACT_NAME,
          methodName: "deposit",
          gas: "300000000000000",
          args: { sub_contract: this.subcontract.contract },
          attachedDeposit: orderAmount
        });

        if (!ftTransfer || ftTransfer.status.SuccessValue !== "") {
          // console.log("error al transferir token");
          this.btnLoading = false;
          return
        }


        const acceptOffer = await account.functionCall({
          contractId: CONTRACT_NAME,
          methodName: "accept_offer",
          gas: "300000000000000",
          args: {
            offer_type: 1,
            offer_id: parseInt(this.filteredOffers.id),
            amount: orderAmount,
            payment_method: parseInt(filteredPaymentMethod.payment_method_id),
            datetime: now,
            rate: parseFloat(this.filteredOffers.exchange_rate),
            assosiated: "arepaWallet"
          },
          attachedDeposit: "1"
        });

        if (!acceptOffer || acceptOffer.status.SuccessValue !== "") {
          // console.log("error al aceptar la oferta", acceptOffer);
          // this.btnLoading = false;
          // return
          console.log("Error en accept_offer");
        }
      } catch (error) {
        this.subcontract = {};
        this.btnLoading = false;
        console.error(error.message);
        return;
      }
      this.btnLoading = false;
      this.$router.push({ path: "/trades-pending" });
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
    },
};
</script>

<style src="@/assets/styles/pages/deposit.scss" lang="scss"></style>
