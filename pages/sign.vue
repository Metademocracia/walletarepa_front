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
      <h5 class="mb-0">{{ token.domain }}</h5>
    </v-btn>


    <section class="d-flex flex-column center" style="height: 245px; margin-block: 25px;">
      <h2 class="ma-0">{{ attachedDeposit }} <span>NEAR</span></h2>
      <span>${{ deposit_usd }}</span>
    </section>


    <v-card
      min-height="45"
      class="btn-outlined justify-space-between align-center flex-wrap"
      style="margin-bottom: 12px;"
    >
      <label>DE</label>

      <div class="d-flex flex-column tend">
        <span
          style="--fw: 700"
        >{{ from }}</span>

        <span
          class="ml-auto"
          style="--fw: 500; color: #7C7B7F !important"
        >{{ balance }} near</span>
      </div>
    </v-card>

    <v-card
      min-height="45"
      class="btn-outlined justify-space-between align-center flex-wrap"
    >
      <div class="acenter" style="gap: 8px;">
        <label>TARIFA ESTIMADA</label>
        <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon">
      </div>

      <div class="d-flex flex-column tend ml-auto" style="--fw: 400">
        <span>&lt;0.000001 NEAR</span>
        <span>&lt; $0.01</span>
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
    >+ MÁS INFORMACIÓN</a>


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
        @click="approved()"
      >
        APROBAR
      </v-btn>
    </aside>
    
  </div>
</template>

<script>
// import * as nearAPI from "near-api-js";
import moment from 'moment';
// import {functionCall} from 'near-api-js/lib/transaction'
import BN from 'bn.js';
import utils from '../services/utils';
import encryp from '../services/encryp';
import localStorageUser from '~/services/local-storage-user';

import { configNear }  from '~/services/nearConfig';

import walletUtils from '@/services/wallet';
import { ALERT_TYPE } from '~/plugins/dictionary';

// const nearAPI = require("near-api-js");
// const { KeyPair, keyStores, connect, WalletConnection, transactions, Account } = nearAPI;





export default {
  name: "LimitedPermissions",
  layout: "default-variant",
  middleware: ["authenticated"],
  data() {
    return {
      loading: false,
      checks: [
          { text: "Ver la dirección de su cuenta permitida", check: true },
          { text: "Ver el saldo de su cuenta permitida", check: true },
          { text: "Métodos de llamada en el contrato inteligente en nombre de su cuenta permitida", check: true },
          { text: "Esto no permite que la aplicación transfiera tokens.", check: false },
      ],
      from: null,
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
    },
    };
  },
  head() {
    const title = 'Connect with NEAR';
    return {
        title,
    };
  },
  created() {
    if(this.$route.query.token){
      // const tokenString = window.atob(this.$route.query.token);
      const tokenString = encryp.decryp(this.$route.query.token);
      const tokenJSON = JSON.parse(tokenString);
      // sessionStorage.setItem("token", tokenString);
      this.token = tokenJSON
    }
  },
  mounted() {
    // this.token = JSON.parse(sessionStorage.getItem("token"));
    this.loadData();
  },
  methods: {
    async loadData(){
      const from = this.token.from;
      let attachedDeposit;
      let depositUsd = 0;
      let balance = 0;

      if(!Array.isArray(this.token?.json)) {
        attachedDeposit = this.token.json?.attachedDeposit ? (Number(this.token.json.attachedDeposit) / 1000000000000000000000000) : 0;
      } else {
        let deposit = 0
        for(const item of this.token?.json) {
          deposit += !item?.attachedDeposit ? 0 : (Number(item?.attachedDeposit) / 1000000000000000000000000);
        }
        attachedDeposit = deposit;
      }

      const { near, usd, price } = await walletUtils.getBalance(from);

      if(near && usd && price) {
        depositUsd = price;
        balance = near
      }
      
      this.attachedDeposit = attachedDeposit.toFixed(5);
      this.deposit_usd = (attachedDeposit * depositUsd).toFixed(2);
      this.from = utils.shortenAddress(from);
      this.balance = balance.toFixed(5);
      this.transactionDetails = {
          network: this.token.domain,
          contract: [
              {
                  account: this.token.contract,
                  function: this.token.json.methodName,
                  listFunctions: [this.token.json.methodName]
              },
          ]
      }
    },

    async approved() {
      try {
        this.loading = true
        if(Number(this.balance) < Number(this.attachedDeposit)) {
          this.loading = false
          this.$alert(ALERT_TYPE.ERROR, { desc: "Su balance no es suficiente" })
          return
        }
        // const token = JSON.parse(sessionStorage.getItem("token"));
        const dataUser = localStorageUser.getAccount(this.token.from);
        const privateKey = dataUser.privateKey;
        const address = dataUser.address;
        

        const nearAPI = require('near-api-js');
        const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
        const keyPairNew = nearAPI.KeyPair.fromString(privateKey);
        await keyStore.setKey(process.env.Network, address, keyPairNew);
        const near = await nearAPI.connect(configNear(keyStore));
        const account = await near.account(address);

        let response
        if(!Array.isArray(this.token?.json)) {
          response = await account.functionCall(this.token.json);
        } else {
          const actions = this.token?.json.map((item) => {
              return nearAPI.transactions.functionCall(
                item.methodName, 
                !item?.args ? {} : item.args,
                new BN((!item?.gas ? '3000000000000' : item.gas)),
                new BN((!item?.attachedDeposit ? "0" : item.attachedDeposit))
              )
            });

          response = await account.signAndSendTransaction({ receiverId: this.token?.json[0]?.contractId, actions});

        }
        
        /*
          {
            contractId: "contract.testnet",
            methodName: "create_account",
            args: {
              new_account_id: nickname,
              new_public_key: publicKey,
            },
            gas: "300000000000000",
            attachedDeposit: "10000000000000000000",
          }
        */
        
        // const ruta = this.token.success;
        const json = JSON.stringify(
          {
            hash: response?.transaction?.hash,
            date_time: moment().unix()
          }
        )
        const token = window.btoa(json)
        
        // sessionStorage.removeItem("token");
        
        // console.log("response: ", json);

        let ruta = this.token.success;
        
        if(this.token?.search) {
          ruta += this.token.search + "&response="+token;
        } else {
          ruta += "?response="+token;
          
        }
        
        location.replace(ruta);
      }
      catch (error) {
        this.loading = false
        this.$alert(ALERT_TYPE.ERROR, { desc: error.toString() })
        // console.log("error error: ", error.toString());
      }
    },

    cancel() {
      let ruta = this.token.error;
        
      if(this.token?.searchError) {
        ruta += this.token.searchError;
      }
      location.replace(ruta);
    },
  },
    
}
</script>

<style src="@/assets/styles/pages/approve-transaction.scss" lang="scss"></style>
