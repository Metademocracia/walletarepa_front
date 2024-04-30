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

      <v-card class="payment-card">
        <div class="payment-card__wrapper">
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

    <Header hide-navbar top-text="DEPOSITAR" bottom-text="FONDOS" description="MONTO QUE DESEAS RECARGAR EN LA BILLETERA">
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
      @click="$router.replace('/withdraw')">
      <img src="@/assets/sources/icons/swap-vertical.svg" alt="swap icon">
    </v-btn>


    <section class="d-flex flex-column mb-auto" style="gap: 14px">
      <v-card 
      class="btn-outlined space" style="--bg: var(--secondary); --b-color: #d1c4e8; padding: 0 23px"
        @click="$refs.cryptos.model = true">
        <h5 class="mb-0">MONEDA A ADQUIRIR</h5>

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

      <v-list>
        <v-list-item v-for="(payment, i) in payments" :key="i" @click="selectPayment(payment)">
          {{ payment }}
          <img v-if="selectedPayment == payment" src="@/assets/sources/icons/checked.svg" alt="checked icon" />
          <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon" />
        </v-list-item>
      </v-list>
      <h5 v-if="modalNoOffers" style="color: red !important;">{{ modalNoMessage }}</h5>
      <v-card 
       v-if="moreBanks" class="btn-outlined space" style="--bg: var(--secondary); --b-color: #d1c4e8; padding: 0 23px"
        @click="modelPayments = true">
        <h5 class="mb-0">BUSCAR OTRO MÉTODO</h5>

        <div class="center" style="gap: 6px">
          <v-btn class="btn-icon" style="--b: 1px solid var(--primary)">
            <img src="@/assets/sources/icons/magnify.svg" alt="search icon" />
          </v-btn>
          <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right" />
        </div>
      </v-card>

      <div class="d-flex mt-4" style="gap: 10px">
        <v-btn class="btn-outlined flex-grow-1" :loading="btnLoading" style="--bg: var(--card-2)" @click="$router.back()">
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
// import axios from 'axios'
import * as nearAPI from "near-api-js";
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import moment from "moment";
import walletUtils from "@/services/wallet";
import wallet from '@/services/local-storage-user'
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
      originalPayments: [],
      required: [
        (v) => !!v || "Campo requerido",
        (v) => Number(v) <= Number(this.balance) || "Saldo insuficiente",
      ],
      model: false,
      modelPayments: false,
      validForm: true,
      amount: null,
      balance: 0.0,
      tokenImg: require("@/assets/sources/logos/near-icon.svg"),
      tokenSymbol: "NEAR",
      btnLoading: false,
      search: "",
      address: wallet.getCurrentAccount().address,
      subcontract: false,
      listOffers: [],
      minLimit : 0,
      modalNoOffers: false,
      modalNoMessage: false,
      poolOrders: null,
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
    if(sessionStorage.getItem("flags")) {
      this.listFlags = JSON.parse(sessionStorage.getItem("flags"));
    } else {
      this.flagscdn();
    }
    this.getBalance();
    this.selects();
  },

  methods: {
    searchPayments(search) {
      this.otherPayments = this.originalPayments.filter((item) =>
        item.payment_method.toLowerCase().includes(search.toLowerCase())
      );
    },
    selectPayment(payment) {
      this.selectedPayment = payment;
      this.disabledContinue();
    },
    selectPaymentDialog(payment) {
      this.selectedPayment = payment;
      this.payments[2] = payment;
      this.otherPayments = this.originalPayments.filter(item => !this.payments.includes(item));
      // this.otherPayments = this.originalPayments.filter(
      //   (item) => !this.payments.includes(item.payment_method)
      // );
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
      let balanceNear = 0.0;

      const { near } = await walletUtils.getBalance();

      if (near) {
        balanceNear = near;
      }

      this.balance = balanceNear.toFixed(5);
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
      query MyQuery( $fiat_method: String, $token: String, $address: String ) {
        offersbuys(
          where: {fiat_method: $fiat_method, asset_contains: $token, owner_id_not: $address, is_pause: false}
          orderBy: exchange_rate
          orderDirection: desc
          first: 1
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
      const selectedFiat = sessionStorage.getItem('selectedFiat');
      // const eltoken = this.selectToken;
      let paymentMethods = new Set();
      this.listOffers = [];
      this.poolOrders = this.$apollo
        .watchQuery({
          query: selects,
          // fetchPolicy: 'network-only',
          pollInterval: 5000,
          variables: {
            fiat_method: selectedFiat,
            token: this.tokenSymbol,
            address: wallet.getCurrentAccount().address,
          },
        })
        .subscribe(({ data }) => {
          data.offersbuys.forEach(offer => {
              offer.payment_method.forEach(method => {
                paymentMethods.add(method.payment_method);
              });
          });
          Object.entries(data.offersbuys).forEach(
								([key, value]) => {
                  this.listOffers.push(value);
								}
							);
          paymentMethods = Array.from(paymentMethods);
          paymentMethods.length > 3 ? this.moreBanks = true : this.moreBanks = false;
          /**
           * If the paymentMethods array includes "Pago Móvil",
           * this code filters out "Pago Móvil" from the array
           * and adds it back to the beginning of the array.
           */
          if (paymentMethods.includes("Pago Móvil")) {
            paymentMethods = paymentMethods.filter(method => method !== "Pago Móvil");
            paymentMethods.unshift("Pago Móvil");
          }
          this.payments = paymentMethods.slice(0, 3);
          

          this.otherPayments = paymentMethods.filter(item => !this.payments.includes(item));
          this.originalPayments = paymentMethods;
        });
    },
    async initContract() {
      this.btnLoading = true;
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      /**
       * Converts the withdrawal amount to the appropriate format based on the token symbol.
       * If the token symbol is "NEAR", the amount is multiplied by 1e24.
       * If the token symbol is not "NEAR", the amount is multiplied by 1e6.
       */
      const orderAmount = this.tokenSymbol === "NEAR" ? this.NEARyoctoNEAR(this.amount): (this.amount * 1e6).toString();
      // console.log("orderAmount", orderAmount);
      // console.log("tokenSymbol", this.tokenSymbol);
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
        this.modalNoMessage = "No hay ofertas disponibles, busque un monto superior a " + lowestMinAmountFormated
        this.modalNoOffers = true;
        this.btnLoading = false;
        return;
      }
      // Filter paymet method as per selected payment
      const filteredPaymentMethod = this.filteredOffers.payment_method.find(method => method.payment_method === this.selectedPayment);

      const account = await walletUtils.nearConnection();

      const now = moment()
        .format("YYYY-MM-DD HH:mm:ss")
        .toString();
        try {
          const acceptOffer = await account.functionCall({
            contractId: CONTRACT_NAME,
            methodName: "accept_offer",
            gas: "300000000000000",
            args: {
              offer_type: 2,
              offer_id: parseInt(this.filteredOffers.id),
              amount: orderAmount,
              payment_method: parseInt(filteredPaymentMethod.payment_method_id),
              datetime: now,
              rate: parseFloat(this.filteredOffers.exchange_rate)
            },
            attachedDeposit: "1"
          });

          if (!acceptOffer || acceptOffer.status.SuccessValue !== "") {
            console.log("error al aceptar la oferta", acceptOffer);
            this.btnLoading = false;
            return
          }
        } catch (error) {
          console.error(error.message);
          return;
        }
      this.btnLoading = false;
      // this.sendMail();
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
