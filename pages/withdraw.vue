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
          <v-list>
            <v-list-item 
            v-for="(payment, i) in otherPayments" :key="i"
              class="font-weight-bold"
              @click="selectPaymentDialog(payment)">
              {{ payment }}
              <img 
              v-if="selectedPayment == payment" src="@/assets/sources/icons/checked.svg"
                alt="checked icon" />
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

    <Header hide-navbar top-text="RETIRAR" bottom-text="FONDOS" description="MONTO QUE DESEAS RETIRAR HACIA FIAT">
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

      <v-list>
        <v-list-item v-for="(payment, i) in payments" :key="i" @click="selectPayment(payment)">
          {{ payment }}
          <img v-if="selectedPayment == payment" src="@/assets/sources/icons/checked.svg" alt="checked icon" />
          <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon" />
        </v-list-item>
      </v-list>

      <v-card 
      class="btn-outlined space" style="--bg: var(--secondary); --b-color: #d1c4e8; padding: 0 23px"
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
        <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--card-2)" @click="$router.back()">
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
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import moment from "moment";
import walletUtils from "@/services/wallet";

export default {
  name: "DepositPage",
  data() {
    return {
      filter: ["usdt", "near", "arp"],
      selectedPayment: "",
      payments: [],
      btnContinue: true,
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
      address: localStorage.getItem("address"),
      subcontract: false,
      listOffers: [],
    };
  },
  head() {
    const title = "Withdraw";
    return {
      title,
    };
  },
  mounted() {
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
    selects() {
      const selects = gql`
      query MyQuery( $fiat_method: String, $token: String, $address: String ) {
        offerssells(
          where: {fiat_method: $fiat_method, asset_contains: $token, owner_id_not: $address}
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
      const selectedFiat = localStorage.getItem('selectedFiat');
      // const eltoken = this.selectToken;
      let paymentMethods = new Set();
      this.listOffers = [];
      this.$apollo
        .watchQuery({
          query: selects,
          variables: {
            fiat_method: selectedFiat,
            token: this.tokenSymbol,
            address: localStorage.getItem("address"),
          },
        })
        .subscribe(({ data }) => {
          data.offerssells.forEach(offer => {
              offer.payment_method.forEach(method => {
                paymentMethods.add(method.payment_method);
              });
          });
          Object.entries(data.offerssells).forEach(
								([key, value]) => {
                  this.listOffers.push(value);
								}
							);
          paymentMethods = Array.from(paymentMethods);
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
    sendMail() {
      const passphrase = process.env.VUE_APP_PASSPHRASE;
      const BASE_URL_MAIL = process.env.VUE_APP_API_MAIL_URL;
      const MAIL = `${BASE_URL_MAIL}admin@nearp2p.com/`;
      if (this.$session.get("user_mail") != null) {
        // localStorage.setItem('acceptOrder', MAIL + CryptoJS.AES.decrypt(this.$session.get("user_mail"), passphrase).toString(CryptoJS.enc.Utf8) + "/0/" + this.$session.get("mail_info"));
        const request = new XMLHttpRequest();
        request.open(
          "GET",
          MAIL +
          this.$CryptoJS.AES.decrypt(
            this.$session.get("user_mail"),
            passphrase
          ).toString(this.$CryptoJS.enc.Utf8) +
          "/0/buy"
        );
        request.send();
      }
    },
    async initContract() {
      await this.initContractUSDT();
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
      const orderAmount = this.tokenSymbol === "NEAR" ? (this.amount * 1e24).toString(): (this.amount * 1e6).toString();

      // Filtering the list by payment method and the highest exchange rate
      // and the remaining amount is greater than the order amount
      this.filteredOffers = this.listOffers
      .filter(offer => offer.payment_method.some(method => method.payment_method === this.selectedPayment))
      .filter(offer => parseFloat(offer.remaining_amount) >= orderAmount)
      .sort((a, b) => b.exchange_rate - a.exchange_rate)
      .find(() => true);
      // Filter paymet method as per selected payment
      const filteredPaymentMethod = this.filteredOffers.payment_method.find(method => method.payment_method === this.selectedPayment);

      const account = await walletUtils.nearConnection();

      const getTokenActivo = await account.viewFunctionV1(
        CONTRACT_NAME,
        "get_token_activo",
        { user_id: this.address, ft_token: "USDT" }
      );

      this.subcontract = await account.viewFunctionV1(
        CONTRACT_NAME,
        "get_subcontract",
        { user_id: this.address }
      );

      let vldeposit = "100000000000000000000000";

      if (getTokenActivo) {
        vldeposit = "1";
      } else {
        vldeposit = "100000000000000000000000";
        const activarSubcuenta = await account.functionCall({
          contractId: CONTRACT_NAME,
          methodName: "activar_subcuenta_ft",
          args: { subaccount_id: this.address, asset: "USDT" },
          attachedDeposit: vldeposit
        });

        if (!activarSubcuenta || !activarSubcuenta.status.SuccessValue !== "") {
          console.log("Subcuenta ya activa, procede con el siguiente paso");
        }
      }
      const now = moment()
        .format("YYYY-MM-DD HH:mm:ss")
        .toString();
      if (!this.subcontract) {
        try {
          const createSubCobtractUser = await account.functionCall({
            contractId: CONTRACT_NAME,
            methodName: "create_subcontract_user",
            gas: "80000000000000",
            args: { subaccount_id: this.address.split(".")[0] + "." + CONTRACT_NAME, asset: "USDT" },
            attachedDeposit: vldeposit
          });

          if (!createSubCobtractUser || !createSubCobtractUser.status.SuccessValue !== "") {
            console.log("error al crear subcontrato");
            this.btnLoading = false;
            return
          }

          const ftTransfer = await account.functionCall({
            contractId: CONTRACT_NAME_USDT,
            methodName: "ft_transfer",
            gas: "80000000000000",
            args: { receiver_id: this.address.split(".")[0] + "." + CONTRACT_NAME, amount: orderAmount },
            attachedDeposit: vldeposit
          });

          if (!ftTransfer || ftTransfer.status.SuccessValue !== "") {
            console.log("error al transferir token");
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
      }
      else if (this.subcontract) {
        try {
          const ftTransfer = await account.functionCall({
            contractId: CONTRACT_NAME_USDT,
            methodName: "ft_transfer",
            gas: "80000000000000",
            args: { receiver_id: this.address.split(".")[0] + "." + CONTRACT_NAME, amount: orderAmount },
            attachedDeposit: vldeposit
          });

          if (!ftTransfer || ftTransfer.status.SuccessValue !== "") {
            console.log("error al transferir token", ftTransfer);
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
      }
      else {
        try {
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
              rate: parseFloat(this.filteredOffers.exchange_rate)
            },
            attachedDeposit: "1"
          });

          if (!acceptOffer || !acceptOffer.status.SuccessValue !== "") {
            console.log("error al aceptar la oferta", acceptOffer);
            this.btnLoading = false;
            return
          }
        } catch (error) {
          console.error(error.message);
          return;
        }
      }
      this.btnLoading = false;
      // this.sendMail();
      this.$router.push({ path: "/trades-pending" });
    },
  },
};
</script>

<style src="@/assets/styles/pages/deposit.scss" lang="scss"></style>
