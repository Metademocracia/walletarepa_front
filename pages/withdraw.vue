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
              @click="selectPaymentDialog(payment.payment_method)">
              {{ payment.payment_method }}
              <img 
              v-if="selectedPayment == payment.payment_method" src="@/assets/sources/icons/checked.svg"
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
      @click="$router.replace('/withdraw')"
    >
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
import * as nearAPI from "near-api-js";
// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import { createTransaction, functionCall } from "near-api-js/lib/transaction";
// eslint-disable-next-line camelcase
import { base_decode } from "near-api-js/lib/utils/serialize";
import { PublicKey } from "near-api-js/lib/utils";
import moment from "moment";
import walletUtils from "@/services/wallet";
import { configNear } from '~/services/nearConfig';
const { keyStores, Near, Contract, WalletConnection } = nearAPI;

export default {
  name: "DepositPage",
  data() {
    return {
      filter: ["usdt", "near", "arp"],
      selectedPayment: "",
      payments: ["Pago Móvil", "Zelle", "Banesco"],
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

      this.otherPayments = this.originalPayments.filter(
        (item) => !this.payments.includes(item.payment_method)
      );
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
    },

    debouncePreviewWithdraw() {
      this.disabledContinue();
      // clearTimeout(this.timer)
      // this.timer = setTimeout(this.previewWithdraw, 1000)
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

      this.$apollo
        .mutate({
          mutation: selects,
        })
        .then((response) => {
          const paymentmethods = response.data.paymentmethods;

          if (!paymentmethods) {
            return;
          }
          this.otherPayments = paymentmethods.filter(
            (item) => !this.payments.includes(item.payment_method)
          );
          this.originalPayments = paymentmethods;
        })
        .catch((err) => {
          console.log("Error", err);
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
    /**
     * Creates a transaction for withdrawing funds.
     * 
     * @param {string} receiverId - The ID of the receiver account.
     * @param {Array} actions - The actions to be performed in the transaction.
     * @returns {Promise} - A promise that resolves to the created transaction.
     * @throws {Error} - If there is no active wallet or NEAR connection, or if a matching key for the transaction cannot be found, or if a block cannot be found for the transaction.
     */
    async createTransactionFn(receiverId, actions) {
      const keyStore = new keyStores.InMemoryKeyStore()
      const near = new Near(configNear(keyStore))
      const wallet = new WalletConnection(near);

      if (!wallet || !near) {
        throw new Error(`No active wallet or NEAR connection.`);
      }

      const localKey = await near?.connection.signer.getPublicKey(
        wallet?.account().accountId,
        near.connection.networkId
      );

      const accessKey = await wallet
        ?.account()
        .accessKeyForTransaction(receiverId, actions, localKey);

      if (!accessKey) {
        throw new Error(
          `Cannot find matching key for transaction sent to ${receiverId}`
        );
      }

      const block = await near?.connection.provider.block({
        finality: "final"
      });

      if (!block) {
        throw new Error(
          `Cannot find block for transaction sent to ${receiverId}`
        );
      }

      const blockHash = base_decode(block?.header?.hash);
      // const blockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);

      const publicKey = PublicKey.from(accessKey.public_key);
      // const nonce = accessKey.access_key.nonce + nonceOffset
      const nonce = ++accessKey.access_key.nonce;

      return createTransaction(
        wallet?.account().accountId,
        publicKey,
        receiverId,
        nonce,
        actions,
        blockHash
      );
    },
    /**
     * Executes a batch transaction using the provided transactions and options.
     * @param {Array} transactions - An array of transactions to be executed.
     * @param {Object} options - Additional options for the batch transaction.
     * @param {string} options.callbackUrl - The callback URL for the transaction.
     * @param {Object} options.meta - Additional metadata for the transaction.
     * @returns {Promise<void>} - A promise that resolves when the batch transaction is executed.
     */
    async batchTransaction(transactions, options) {
      const keyStore = new keyStores.InMemoryKeyStore();
      const near = new Near(configNear(keyStore));
      const wallet = new WalletConnection(near);
      const nearTransactions = await Promise.all(
        transactions.map(async (tx) => {
          return await this.createTransactionFn(
            tx.receiverId,
            tx.functionCalls.map((fc) => {
              return functionCall(fc.methodName, fc.args, fc.gas, fc.deposit);
            })
          );
        })
      );
      wallet.requestSignTransactions({
        transactions: nearTransactions,
        callbackUrl: options?.callbackUrl,
        meta: options?.meta,
      });
    },
    async initContract() {
      await this.initContractUSDT();
    },
    async initContractUSDT() {
      this.btnLoading = true;
      const txs = [];
      // const account = await walletUtils.nearConnection();
      const CONTRACT_NAME = process.env.VUE_APP_CONTRACT_NAME;
      const CONTRACT_NAME_USDT = process.env.VUE_APP_CONTRACT_NAME_USDT;
      const keyStore = new keyStores.InMemoryKeyStore()
      const near = new Near(configNear(keyStore))
      const wallet = new WalletConnection(near);
      const contract = new Contract(wallet.account(), CONTRACT_NAME, {
        viewMethods: ["get_token_activo"],
        changeMethods: [""],
        sender: wallet.account()
      });
      const getTokenActivo = await contract.get_token_activo({
        user_id: this.address.split(".")[0] + "." + CONTRACT_NAME,
        ft_token: "USDT"
      });

      let vldeposit = "100000000000000000000000";

      if (getTokenActivo === true) {
					vldeposit = "1";
				} else {
          vldeposit = "100000000000000000000000";
					txs.push({
						receiverId: CONTRACT_NAME,
						functionCalls: [
							{
								methodName: "activar_subcuenta_ft",
								receiverId: CONTRACT_NAME,
								gas: "80000000000000",
								args: {subaccount_id: this.address.split(".")[0] + "." + CONTRACT_NAME,
                       asset: "USDT"
                      },
								deposit: "100000000000000000000000"
							}
							]
						});
				}
        const now = moment()
					.format("YYYY-MM-DD HH:mm:ss")
					.toString();
          if (this.subcontract === false) {
					txs.push(
						{
							// Deploy contract
							receiverId: CONTRACT_NAME,
							functionCalls: [
								{
									methodName: "create_subcontract_user",
									receiverId: CONTRACT_NAME,
									gas: "80000000000000",
									args: {},
									deposit: vldeposit
								}
							]
						});
						txs.push({
							// Send Near
							receiverId: CONTRACT_NAME_USDT,
							functionCalls: [
								{
									methodName: "ft_transfer",
									receiverId: CONTRACT_NAME_USDT,
									gas: "80000000000000",
									args: {
										receiver_id: this.address.split(".")[0] + "." + CONTRACT_NAME,
											// this.userInfo.split(".")[0] + "." + CONTRACT_NAME,
											
										amount: (this.amount * 1e6).toString()
									},
									deposit: 1
								}
							]
						});
						txs.push({
							// Accept Order
							receiverId: CONTRACT_NAME,
							functionCalls: [
								{
									methodName: "accept_offer",
									receiverId: CONTRACT_NAME,
									gas: "300000000000000",
									args: {
										offer_type: 1,
										offer_id: 4,
										amount: (this.amount * 1e6).toString(),
										payment_method: 1,
										datetime: now,
										rate: 39.60
									},
									deposit: "1"
								}
							]
						});
					
				}
        else if (this.subcontract === true) 
				{
					txs.push(
						{
							// Send Near
							receiverId: CONTRACT_NAME_USDT,
							functionCalls: [
								{
									methodName: "ft_transfer",
									receiverId: CONTRACT_NAME_USDT,
									gas: "80000000000000",
									args: {
										receiver_id:
                    this.address.split(".")[0] + "." + CONTRACT_NAME,
										amount: (this.amount * 1e6).toString()
									},
									deposit: "1"
								}
							]
						});
						txs.push({
							// Accept Order
							receiverId: CONTRACT_NAME,
							functionCalls: [
								{
									methodName: "accept_offer",
									receiverId: CONTRACT_NAME,
									gas: "300000000000000",
									args: {
										offer_type: 1,
										offer_id: 4,
										amount: (this.amount * 1e6).toString(),
										payment_method: 1,
										datetime: now,
										rate: 39.60
									},
									deposit: "1"
								}
							]
						});
				}  
        else 
				{
					txs.push(
						{
							// Accept Order
							receiverId: CONTRACT_NAME,
							functionCalls: [
								{
									methodName: "accept_offer",
									receiverId: CONTRACT_NAME,
									gas: "300000000000000",
									args: {
										offer_type: 1,
										offer_id: 4,
										amount: (this.amount * 1e6).toString(),
										payment_method: 1,
										datetime: now,
										rate: 39.60
									},
									deposit: "1"
								}
							]
						});
				}
				// console.log(txs)
				this.batchTransaction(txs, { meta: "USDT" }) 
    },
  },
};
</script>

<style src="@/assets/styles/pages/deposit.scss" lang="scss"></style>
