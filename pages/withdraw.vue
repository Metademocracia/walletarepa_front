<template>
  <v-form id="withdraw" ref="form" v-model="validForm" class="d-flex flex-column">
    <ModalCryptos
      ref="cryptos"
      @on-selected-coin="coin => selectToken(coin)"
    ></ModalCryptos>

    <ModalPayments
      ref="payments"
      @on-selected-coin="coin => selectToken(coin)"
    ></ModalPayments>

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
        @click="maximo()"
      >USE MAX</v-btn>
    </section>


    <section class="d-flex flex-column mb-auto" style="gap: 14px;">
      <v-card
        class="btn-outlined space"
        style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
        @click="$refs.cryptos.model = true"
      >
        <h5 class="mb-0">TOKEN A VENDER</h5>
        
        <div class="center" style="gap: 6px;">
          <img :src="fromToken.icon" alt="near icon" style="width: 29px;">
          <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ fromToken.coin }}</span>
          <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
        </div>
      </v-card>

      <v-list>
        <v-list-item
          v-for="(payment, i) in payments" :key="i"
          @click="selectedPayment = payment"
        >
          {{ payment }}
          <img v-if="selectedPayment == payment" src="@/assets/sources/icons/checked.svg" alt="checked icon">
          <img v-else src="@/assets/sources/icons/circle.svg" alt="circle icon">
        </v-list-item>
      </v-list>

      <v-card
        class="btn-outlined space"
        style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
        @click="$refs.payments.model = true"
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

        <v-btn class="btn flex-grow-1" :loading="btnLoading" :disabled="amountReceive == 0" @click="sendWithdraw">
          CONTINUAR
        </v-btn>
      </div>


      <h6 style="font-size: 9px !important; --ff: var(--font2); --fw: 600; --fs: 10px; --lh: 1ch">
        LOS USUARIOS DEBEN RETIRAR HACIA CUENTAS PROPIAS

        <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px">
      </h6>
    </section>


    <Footer ref="footer">
      <span class="text tcenter" style="--text: var(--text2); font-size: 10px !important;">© 2023 Near p2p LLC. reservados todos los derechos.</span>
      <a class="text" style="font-size: 10px !important; --fw: 700; color: var(--primary) !important" href="#" target="_blank">
        Términos de política y privacidad del servicio
      </a>
    </Footer>
  </v-form>
</template>

<script>
import * as cryptoJS from 'crypto-js';
import axios from 'axios'
import { utils } from "near-api-js";
// import tokens from '@/services/tokens';
import walletUtils from '@/services/wallet';

export default {
  name: "DepositPage",
  data() {
    return {
      selectedPayment: "Pago Móvil",
      payments: [
        "Pago Móvil",
        "Zelle",
        "Paypal",
      ],
      required: [(v) => !!v || "Campo requerido", (v) => Number(v) <= Number(this.fromToken.balanceTotal) || "Saldo insuficiente" ],
      tokenSelected: null,
      dataWithdraw: {},
      priceRoute: null,
      amountReceive: 0,
      model: false,
      validForm: true,
      amount: null,
      balance: 0.00,
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
      toToken: {
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2326A17B'/%3E%3Cpath fill='%23FFF' d='M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117'/%3E%3C/g%3E%3C/svg%3E",
        name: "Tether USD",
        coin: "USDt",
        decimals: 6,
        contract: "usdt.tether-token.near",
        balance: 0.00,
        balanceTotal: 0.00,
        balance_usd: 0.00
      },
      dataTokens: [],
      listToken: [
        {
          icon: require('@/assets/sources/logos/near-icon.svg'),
          name: "Near",
          coin: "NEAR",
          decimals: 6,
          contract: "near",
          balance: 0.00,
          balanceTotal: 0.00,
          balance_usd: 0.00
        },
        {
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2326A17B'/%3E%3Cpath fill='%23FFF' d='M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117'/%3E%3C/g%3E%3C/svg%3E",
          name: "Tether USD",
          coin: "USDt",
          decimals: 6,
          contract: "usdt.tether-token.near",
          balance: 0.00,
          balanceTotal: 0.00,
          balance_usd: 0.00
        },
        {
          icon: "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle fill='%23201A2D' cx='16' cy='16' r='16'/%3E%3Cg fill='%23FFF'%3E%3Cpath d='M22.818 9.586l-.6.6a8.494 8.494 0 010 11.464l.6.6a9.352 9.352 0 000-12.678v.014zM10.2 9.638a8.494 8.494 0 0111.464 0l.6-.6a9.352 9.352 0 00-12.678 0l.614.6zm-.562 12.018a8.494 8.494 0 010-11.458l-.6-.6a9.352 9.352 0 000 12.678l.6-.62zm12.018.554a8.494 8.494 0 01-11.464 0l-.6.6a9.352 9.352 0 0012.678 0l-.614-.6zm-1.942-8.286c-.12-1.252-1.2-1.672-2.566-1.8V10.4h-1.056v1.692h-.844V10.4H14.2v1.736h-2.142v1.13s.78-.014.768 0a.546.546 0 01.6.464v4.752a.37.37 0 01-.128.258.366.366 0 01-.272.092c.014.012-.768 0-.768 0l-.2 1.262h2.122v1.764h1.056V20.12h.844v1.73h1.058v-1.744c1.784-.108 3.028-.548 3.184-2.218.126-1.344-.506-1.944-1.516-2.186.614-.302.994-.862.908-1.778zm-1.48 3.756c0 1.312-2.248 1.162-2.964 1.162v-2.328c.716.002 2.964-.204 2.964 1.166zm-.49-3.28c0 1.2-1.876 1.054-2.472 1.054v-2.116c.596 0 2.472-.188 2.472 1.062z'/%3E%3Cpath d='M15.924 26.852C9.89 26.851 5 21.959 5 15.925 5 9.892 9.892 5 15.925 5c6.034 0 10.926 4.89 10.927 10.924a10.926 10.926 0 01-10.928 10.928zm0-21c-5.559.004-10.062 4.513-10.06 10.072.002 5.559 4.51 10.064 10.068 10.064 5.559 0 10.066-4.505 10.068-10.064A10.068 10.068 0 0015.924 5.852z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
          name: "Wrapped BTC",
          coin: "WBTC",
          decimals: 8,
          contract: "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near",
          balance: 0.00,
          balanceTotal: 0.00,
          balance_usd: 0.00
        },
        {
          icon: "https://assets.ref.finance/images/2396.png",
          name: "Wrapped Ether",
          coin: "WETH",
          decimals: 18,
          contract: "c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.factory.bridge.near",
          balance: 0.00,
          balanceTotal: 0.00,
          balance_usd: 0.00
        },
        {
          icon: require('@/assets/sources/logos/near-icon.svg'),
          name: "Wrapped NEAR",
          coin: "wNEAR",
          decimals: 24,
          contract: "wrap.near",
          balance: 0.00,
          balanceTotal: 0.00,
          balance_usd: 0.00
        }
      ]
    }
  },
  head() {
    const title = 'Withdraw';
    return {
      title,
    }
  },
  mounted(){
    this.loadTokens()
  },

  methods: {
    maximo() {
      if (this.fromToken.contract === "near") {
        if (this.fromToken.balanceTotal > 0.2) {
          this.amount = this.fromToken.balanceTotal - 0.2
        } else {
          this.amount = 0
        }
      } else {
        this.amount = this.fromToken.balanceTotal
      }

      this.debouncePreviewWithdraw()
    },
    loadTokens() {
      // const inventory = await tokens.getInventoryUser();
      const storedTokenBalances = JSON.parse(sessionStorage.getItem('allTokenBalances'));
      const inventory = { fts: storedTokenBalances }; // await tokens.getListTokensBalance()

      if(!inventory) return 

      this.dataTokens = inventory.fts

      // console.log("dataTokens",this.dataTokens)

      for (let i = 0; i < this.listToken.length; i++) {
        for (const token of this.dataTokens) {
          if (token.contract.toLowerCase() === this.listToken[i].contract.toLowerCase()) {
            this.listToken[i].balance = token.balance
            this.listToken[i].balanceTotal = token.balanceTotal
            this.listToken[i].balance_usd = token.balance_usd
          }
        }
        
        if (this.listToken[i].contract.toLowerCase() === this.fromToken.contract.toLowerCase()) {
          this.fromToken = this.listToken[i]
        } else if (this.listToken[i].contract.toLowerCase() === this.toToken.contract.toLowerCase()) {
          this.toToken = this.listToken[i]
        }
      }
    },
    debouncePreviewWithdraw () {
      clearTimeout(this.timer)
      this.timer = setTimeout(this.previewWithdraw, 1000)
    },
    async previewWithdraw() {
      this.amountReceive = 0
      this.btnLoading = true
      // console.log(this.amount, this.fromToken?.contract, this.toToken?.contract)
      if (!this.amount || this.amount <= 0 || !this.fromToken?.contract || !this.toToken?.contract || !localStorage.getItem('address')) {
        this.btnLoading = false
        return
      }

      if (!this.$refs.form.validate()) {
        this.btnLoading = false
        return
      }

      if ((this.fromToken.contract === "near" || this.fromToken.contract === "wrap.near") && (this.toToken.contract === "near" || this.toToken.contract === "wrap.near")) {
        this.amountReceive = this.amount
        this.btnLoading = false
        return
      }

      const item = {
        tokenIn: this.fromToken.contract,
        tokenOut: this.toToken.contract,
        address: localStorage.getItem('address'),
        amount: this.amount
      }

      await axios.post(process.env.URL_BACKEND_SWAP +'/preview-withdraw', item)
      // await axios.post("http://localhost:3000/api" +'/preview-withdraw', item)
        .then((response) => {
         //  console.log(response.data)
          if (response.data) {
            this.priceRoute = response.data.priceRoute
            this.dataWithdraw = response.data.dataWithdraw

            this.amountReceive = this.dataWithdraw.toAmount / Math.pow(10, this.dataWithdraw.toDecimals)

            // console.log("DATA",this.priceRoute)
          }

          this.btnLoading = false
          
        }).catch((err) => {
          console.log(err)
          this.btnLoading = false
          throw new Error ("Failed to get data price route")
        })
    },
    async sendWithdraw() {
      try {
        const account = await walletUtils.nearConnection();

        // console.log(this.fromToken.contract)
        // console.log(this.toToken.contract)

        const hashes = []

        if (this.fromToken.contract === "near" && this.toToken.contract === "wrap.near") {
          // console.log("withdraw", this.amount)
          // console.log(utils.format.parseNearAmount(String(this.amount)))
          try {
            const result = await account.functionCall({
              contractId: "wrap.near",
              methodName: "near_deposit",
              args: {},
              gas: "300000000000000",
              attachedDeposit: utils.format.parseNearAmount(String(this.amount))
            });

            const hash = !result?.transaction.hash ? result : result?.transaction.hash;

            if (!hash) {
              this.$router.push({ path: '/withdraw-error'})
            }

            const item = {
              hash,
              method: "near_deposit"
            }

            hashes.push(item)
          } catch (error) {
            this.$router.push({ path: '/withdraw-error'})
          }
          
        } else if (this.fromToken.contract === "wrap.near" && this.toToken.contract === "near") {
          // console.log("withdraw", this.amount)
          try {
            const result = await account.functionCall({
              contractId: "wrap.near",
              methodName: "near_withdraw",
              args: {
                amount: utils.format.parseNearAmount(String(this.amount))
              },
              gas: "300000000000000",
              attachedDeposit: "1"
            });

            const hash = !result?.transaction.hash ? result : result?.transaction.hash;

            if (!hash) {
              this.$router.push({ path: '/withdraw-error'})
            }

            const item = {
              hash,
              method: "near_withdraw"
            }

            hashes.push(item)
          } catch (error) {
            this.$router.push({ path: '/withdraw-error'})
          }

          
        } else {
          try {
            for (const tx of this.priceRoute) {
              for (const functionCall of tx.functionCalls) {
                const result = await account.functionCall({
                  contractId: tx.receiverId,
                  methodName: functionCall.methodName,
                  args: functionCall.args,
                  gas: functionCall.gas,
                  attachedDeposit: functionCall.amount
                });

                const hash = !result?.transaction.hash ? result : result?.transaction.hash;

                if (!hash) {
                  this.$router.push({ path: '/withdraw-error'})
                }

                const item = {
                  hash,
                  method: functionCall.methodName
                }

                hashes.push(item)
              }
            }
          } catch (error) {
            this.$router.push({ path: '/withdraw-error'})
          }
        }

        // console.log("hashes", hashes)

        const dataItem = {
          from: this.fromToken.icon,
          to: this.toToken.icon,
          amount: this.amount,
          receive: this.amountReceive,
          hashes
        }

        const data = this.encrypt(JSON.stringify(dataItem), "123456")

        this.$router.push({ path: '/withdraw-complete', query: { data }})
      } catch (error) {
        console.error(error)
      }
    },
    encrypt(text, secret) {
      const ciphertext = cryptoJS.AES.encrypt(JSON.stringify({ text }), secret).toString();
      return ciphertext
    }
  },
}
</script>

<style src="@/assets/styles/pages/deposit.scss" lang="scss"></style>
