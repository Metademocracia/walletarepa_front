<template>
  <v-form id="withdraw" ref="form" v-model="validForm" class="d-flex flex-column">
    <ModalCryptos
        ref="cryptos"
        @on-selected-coin="coin => selectToken(coin)"
    ></ModalCryptos>
    

    <!-- <ModalPaymentMethods
      ref="paymentMethods"
      :data-payments=otherPayments
      @on-selected-coin="coin => selectToken(coin)"
    ></ModalPaymentMethods> -->

    <v-dialog
      v-model="modelPayments"
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
              v-for="(payment, i) in otherPayments" :key="i"
              @click="selectPayment(payment.payment_method)"
            >
              {{ payment.payment_method }}
              <img v-if="selectedPayment == payment.payment_method" src="@/assets/sources/icons/checked.svg" alt="checked icon">
              <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon">
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

    <Header
      hide-navbar
      top-text="RETIRAR"
      bottom-text="FONDOS"
      description="MONTO QUE DESEAS RETIRAR HACIA FIAT"
    ></Header>

    <section class="d-flex flex-column" style="height: 208px; translate: 0 -30px">
      <v-text-field
        v-model="amount"
        placeholder="0.0"
        type="number"
        :rules="required"
        @input="debouncePreviewWithdraw()"
      ></v-text-field>

      <v-btn
        class="btn-outlined mx-auto"
        style="--bg: var(--secondary); --b-color: var(--primary); --c: var(--primary); --fs: 12px; --fw: 700; --ls: 0.36px; --h: 34px; width: 121px;"
        @click="maxBalance()"
      >USAR MÁXIMO</v-btn>
    </section>


    <section class="d-flex flex-column mb-auto" style="gap: 14px;">
      <v-card
        class="btn-outlined space"
        style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
        @click="$refs.cryptos.model = true"
      >
        <h5 class="mb-0">TOKEN A VENDER</h5>
        
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

      <v-list>
        <v-list-item
          v-for="(payment, i) in payments" :key="i"
          @click="selectPayment(payment)"
        >
          {{ payment }}
          <img v-if="selectedPayment == payment" src="@/assets/sources/icons/checked.svg" alt="checked icon">
          <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon">
        </v-list-item>
      </v-list>

      <v-card
        class="btn-outlined space"
        style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
        @click="modelPayments = true"
      >
        <h5 class="mb-0">BUSCAR OTRO MÉTODO</h5>
        
        <div class="center" style="gap: 6px;">
          <v-btn class="btn-icon" style="--b: 1px solid var(--primary)">
            <img src="@/assets/sources/icons/magnify.svg" alt="search icon">
          </v-btn>
          <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
        </div>
      </v-card>


      <div class="d-flex mt-4" style="gap: 10px">
        <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--card-2)" @click="$router.back()">
          CANCELAR
        </v-btn>

        <v-btn class="btn flex-grow-1" :loading="btnLoading" :disabled="btnContinue" >
          CONTINUAR
        </v-btn>
      </div>


      <h6 style="font-size: 9px !important; --ff: var(--font2); --fw: 600; --fs: 10px; --lh: 1ch">
        LOS USUARIOS DEBEN RETIRAR HACIA CUENTAS PROPIAS

        <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px">
      </h6>
    </section>
  </v-form>
</template>

<script>
import * as cryptoJS from 'crypto-js';
// import axios from 'axios'
// import { utils } from "near-api-js";
// import tokens from '@/services/tokens';
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import walletUtils from '@/services/wallet';

export default {
  name: "DepositPage",
  data() {
    return {
      selectedPayment: "Pago Móvil",
      payments: [
        "Pago Móvil",
        "Zelle",
        "Banesco",
      ],
      btnContinue: true,
      otherPayments: [],
      required: [(v) => !!v || "Campo requerido", (v) => Number(v) <= Number(this.balance) || "Saldo insuficiente" ],
      amountReceive: 0,
      model: false,
      modelPayments: false,
      validForm: true,
      amount: null,
      balance: 0.00,
      tokenImg: require('@/assets/sources/logos/near-icon.svg'),
      tokenSymbol: "NEAR",
      btnLoading: false,
      fromToken: {
        icon: require('@/assets/sources/logos/near-icon.svg'),
        name: "Near",
        coin: "NEAR",
        decimals: 6,
        contract: "NEAR",
        balance: 0.00,
        balanceTotal: 0.00,
        balance_usd: 0.00
      },
      search: "",
    }
  },
  head() {
    const title = 'Withdraw';
    return {
      title,
    }
  },
  mounted(){
    this.getBalance()
    this.selects()
  },

  methods: {
    selectPayment(payment) {
      this.selectedPayment = payment
      this.disabledContinue()
    },
    disabledContinue() {
      if (this.amount > 0 && this.selectedPayment && this.$refs.form.validate()) {
        this.btnContinue = false
      } else {
        this.btnContinue = true
      }
    },
    getMethods() {
      console.log("HOLA")
      console.log(this.$apollo)
    },
    maxBalance() {
      this.amount = this.balance;
      this.disabledContinue()
    },
    async getBalance() {
      let balanceNear = 0.00;

      const { near } = await walletUtils.getBalance();

      if(near) {
        balanceNear = near;
      }

      this.balance = balanceNear.toFixed(5);

    },

    selectToken(token) {
      this.balance = Number(token.balance);
      this.tokenImg = token.icon;
      this.tokenSymbol = token.symbol;
      this.dataToken = token.name !== "NEAR" ? token : null;
    },

    debouncePreviewWithdraw () {
      this.disabledContinue()
      // clearTimeout(this.timer)
      // this.timer = setTimeout(this.previewWithdraw, 1000)
    },
    encrypt(text, secret) {
      const ciphertext = cryptoJS.AES.encrypt(JSON.stringify({ text }), secret).toString();
      return ciphertext
    },

    selects() {

      const selects = gql`
      query MyQuery {
          paymentmethods(orderBy: id) {
            id
            payment_method
          }
        }
      `;
      
      // const selects = gql`
      // query MyQuery {
      //     paymentmethods(orderBy: id) {
      //       id
      //       payment_method
      //     }
      //   }
      // `;

			this.$apollo
				.mutate({
					mutation: selects
				})
				.then(response => {
					console.log(response.data.paymentmethods)
          const paymentmethods = response.data.paymentmethods

          if (!paymentmethods) {return}
          this.otherPayments = paymentmethods.filter(item => !this.payments.includes(item.payment_method));
				})
				.catch(err => {
					console.log("Error", err);
				});
		},
  },
}
</script>

<style src="@/assets/styles/pages/deposit.scss" lang="scss"></style>
