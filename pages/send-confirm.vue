<template>
  <div id="approve-transaction" class="d-flex flex-column">
    <!-- <v-alert v-if="error" class="mt-12" type="error">
      {{ error }}
    </v-alert> -->
    <modalInfo
      activator="#more-information-btn"
      title="Detalles de la transacción"
      content-class="approve-transaction-info-modal"
    >
      <v-card class="btn-outlined mb-4 px-4 py-2" style="--bg: var(--secondary); --br: 15px; --ls: normal; --fs: 12px; --fw: 600">
        <h6 class="mb-3" style="--fs: 15px">Tarifas de red</h6>

        <div class="space" style="gap: 20px;">
          <span>Tarifas estimadas</span>
          <span style="--fw: 400">&lt; 0.00001 NEAR</span>
        </div>

        <div class="space" style="gap: 20px;">
          <span>Límite de tarifa</span>
          <span style="--fw: 400">300 Tgas</span>
        </div>
      </v-card>


      <v-card class="btn-outlined px-4 py-2" style="--bg: var(--secondary); --br: 15px; --ls: normal; --fs: 12px; --fw: 600">
        <h6 class="mb-3" style="--fs: 15px">Detalles del contrato</h6>

        <section class="d-flex flex-column" style="gap: 20px;">
          <aside
            v-for="(item, i) in transactionDetails.contract" :key="i"
            class="d-flex flex-column"
            style="gap: 10px;"
          >
            <div class="space" style="gap: 20px;">
              <span>Para contrato</span>
              <a
                href="" target="_blank"
                class="center"
                style="font-size: 12px; gap: 6px;">
                {{ item.account }}
                <img src="@/assets/sources/icons/link.svg" alt="link icon" style="width: 15px;">
              </a>
            </div>

            <div class="space" style="gap: 20px;">
              <span>Función:</span>
              <v-select
                v-model="item.function"
                :items="item.listFunctions"
                hide-details solo
                :menu-props="{ contentClass: 'aprove-transaction-info-menu' }"
              />
            </div>
          </aside>
        </section>
      </v-card>
    </modalInfo>

    <Header
      top-text="APROBAR"
      top-text-dir="rtl"
      bottom-text="TRANSACCIÓN"
      bottom-text-dir="ltr"
    ></Header>

    <v-btn
      class="btn-outlined mx-auto"
      style="--bg: var(--secondary); --h: 34px; margin-top: 3px;"
    >
      <img src="@/assets/sources/icons/language-blue.svg">
      <h5 class="mb-0">Transferencia Personal</h5>
    </v-btn>


    <section class="d-flex flex-column center" style="height: 245px; margin-block: 25px;">
      <h2 class="ma-0">{{ attachedDeposit }} <span>{{ token }}</span></h2>
      <!-- <span>${{ deposit_usd }}</span> -->
    </section>


    <v-card
      min-height="45"
      class="btn-outlined justify-space-between align-center flex-wrap"
      style="margin-bottom: 12px;"
    >
      <label>DESDE</label>

      <div class="d-flex flex-column tend">
        <span
          class="ml-auto"
          style="--fw: 700;"
        >{{ from }}</span>
      </div>
    </v-card>

    <v-card
      min-height="45"
      class="btn-outlined justify-space-between align-center flex-wrap"
    >
      <div class="acenter" style="gap: 8px;">
        <label>COMISIÓN BLOCKCHAIN</label>
        <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon">
      </div>

      <div class="d-flex flex-column tend ml-auto" style="--fw: 400">
        <span>&lt;0.000001 NEAR</span>
        <span>&lt; $0.01</span>
      </div>
    </v-card>

    <v-card
      min-height="45"
      class="mt-3 btn-outlined justify-space-between align-center flex-wrap"
      style="margin-bottom: 12px;"
    >
      <label>DESTINO</label>

      <div class="d-flex flex-column tend">
        <span
          class="ml-auto"
          style="--fw: 700;"
        >{{ to }}</span>
      </div>
    </v-card>


    <a
      id="more-information-btn"
      class="tcenter my-6 mx-auto"
      style="
        --fw: 700;
        max-width: max-content;
        font-size: 9px;
        letter-spacing: 0.27px;
      "
    ></a>


    <aside class="d-flex justify-space-between" style="gap: 12px;">
      <v-btn
        class="btn-outlined flex-grow-1"
        style="--bg: var(--secondary)"
        :loading="loading"
        @click="cancel()"
      >
        CANCELAR
      </v-btn>

      <v-btn
        class="btn flex-grow-1"
        :loading="loading"
        @click="send()"
      >
        APROBAR
      </v-btn>
    </aside>
    
  </div>
</template>

<script>
import * as nearAPI from "near-api-js";
import wallet from '@/services/local-storage-user'
import walletUtils from "@/services/wallet";
const { utils } = nearAPI;

export default {
  name: "SignApproveTransaction",
  layout: "default-variant",
  middleware: ["authenticated"],
  data() {
    return {
      loading: false,
      from: wallet.getCurrentAccount().address,
      attachedDeposit: 0,
      deposit_usd: 0,
      balance: 0,
      token: null,
      error: null,
      transactionDetails: {
          network: "",
          contract: []
      },
      contentClass: {
      type: String,
      default: '',
      to: '',
      loginNear: false,
      tokenSymbol: "",
      dataToken: null,
    },
    };
  },
  head() {
    const title = 'Connect with NEAR';
    return {
        title,
    };
  },
  mounted() {
    const data = sessionStorage.getItem("send-json");
    if(data){
      const json = JSON.parse(data);
      this.amount = json.amount
      if(json.dataToken){
        this.dataToken = json.dataToken;
        this.tokenSymbol = json.dataToken.symbol;
      } else {
        this.tokenSymbol = "NEAR";
      }
    }
    // Retrieve the item from sessionStorage
    const jsonString = sessionStorage.getItem("send-json");
    // Parse the JSON string back into an object
    const jsonObj = JSON.parse(jsonString);
    // Access the 'name' and 'symbol' properties within 'dataToken'
    // const dataTokenName = jsonObj.dataToken.name;
    const dataTokenSymbol = jsonObj.dataToken.symbol;
    // Access the 'amount'
    const amount = jsonObj.amount;
    // console.log(dataTokenName); // This will log the 'name' value to the console
    // console.log(dataTokenSymbol); // This will log the 'symbol' value to the console
    // console.log(amount); // This will log the 'amount' value to the console
    this.token = dataTokenSymbol;
    this.attachedDeposit = amount;
    this.to = sessionStorage.getItem('send-to');
    },
  methods: {
    cancel() {
      this.$router.go(-1); 
    },
    async send() {
        this.loading = true;

        if(this.tokenSymbol === "NEAR"){
          let err = false;
          await this.sendNear().catch(error => {
            this.$alert("error",{ desc: error })
            err = true
          });

          if(err) {
            this.loading = false;
            return
          }
        } else {
          let err = false;
          await this.sendToken().catch(error => {
            this.$alert("error",{ desc: error })
            err = true;
          });
          if(err) {
            this.loading = false;
            return
          }
        }


        sessionStorage.removeItem('allTokenBalances')
        
        

        this.envioLoading = false;

        

        this.$router.push({ path: "/tx-successfuly" });
    },
    async sendNear() {
      try {
        const account = await walletUtils.nearConnection();
        const result = await account.sendMoney(
          this.to, // receiver account
          utils.format.parseNearAmount(this.attachedDeposit).toString() // amount in yoctoNEAR
        );

        const hash = !result?.transaction.hash ? result : result?.transaction.hash
        const sendResult = JSON.stringify({
          hash,
          hashUrl: process.env.URL_EXPLORER_TXS + hash,
          alertType: result?.status?.SuccessValue === "" ? "success" : "error",
        })

        sessionStorage.setItem("send-result", sendResult)
      } catch (error) {
        throw new Error(error)
      }
    },

    async sendToken() {
        console.log(this.to, this.attachedDeposit, this.dataToken.decimals, this.dataToken.contract)
      try {
        const account = await walletUtils.nearConnection();
        const isActiveToken = await account.viewFunctionV1(
          this.dataToken.contract,
          "storage_balance_of",
          { account_id: this.to }
        );

        if(!isActiveToken) {
          const storageDepositResult = await account.functionCall({
            contractId: this.dataToken.contract,
            methodName: "storage_deposit",
            args: { account_id: this.to },
            attachedDeposit: "1250000000000000000000"
          });
          
          if(!storageDepositResult || !storageDepositResult.status?.SuccessValue) {
            console.log("error al activar token");
            return
          }
        }

        const result = await account.functionCall({
          contractId: this.dataToken.contract,
          methodName: "ft_transfer",
          args: { 
            receiver_id: this.to,
            amount: walletUtils.parseTokenAmount(this.attachedDeposit, this.dataToken.decimals)
          },
          attachedDeposit: "1"
        });

        const hash = !result?.transaction.hash ? result : result?.transaction.hash;
        const sendResult = JSON.stringify({
          hash,
          hashUrl: process.env.URL_EXPLORER_TXS + hash,
          alertType: result?.status?.SuccessValue === "" ? "success" : "error",
        })

        sessionStorage.setItem("send-result", sendResult)

      } catch (error) {
        throw new Error(error)
      }
    },
  },
    
}
</script>

<style src="@/assets/styles/pages/approve-transaction.scss" lang="scss"></style>
