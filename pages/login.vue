<template>
  <div id="connect-with-near" class="d-flex flex-column">
    <Header
      top-text="CONECTAR"
      top-text-dir="rtl"
      bottom-text="CON NEAR"
      bottom-text-dir="ltr"
      :show-prepend="false"
      description="UNA APLICACIÓN SOLICITA ACCESO LIMITADO A SU NUEVA CUENTA. SELECCIONE LA CUENTA QUE DESEA CONECTAR."
    ></Header>

    <v-btn
      class="btn-outlined mx-auto mt-2 mb-6"
      style="--bg: var(--secondary); --h: 34px"
    >
      <img src="@/assets/sources/icons/language-blue.svg">
      <h5 class="mb-0">{{ domain }}</h5>
    </v-btn>


    <v-card class="btn-outlined d-flex flex-column" style="gap: 14px;">
      <div class="v-card__wrapper d-flex flex-column" style="gap: 14px;">
        <WalletCard
          v-for="(item, i) in dataWallets" :key="i"
          :wallet="item.wallet"
          :pass="item.pass"
          collapsed
          :active="i == 0"
          :disabled="i != 0"
          :show="i == 0"
          clickable
          @click="selectAccount(item.wallet)"
        />
      </div>

      <v-btn
        class="btn-outlined"
        style="--b-color: var(--primary); --bg: var(--secondary); --c: var(--primary); margin-right: calc(var(--p-inside) + var(--p-outside));"
        @click="importAccount()"
      >
        IMPORTAR CUENTA DIFERENTE
      </v-btn>
    </v-card>

    <aside class="d-flex justify-space-between mt-6" style="gap: 12px;">
      <v-btn
        class="btn-outlined flex-grow-1"
        style="--bg: var(--secondary)"
        @click="cancel()"
      >
        CANCELAR
      </v-btn>

      <v-btn
        class="btn flex-grow-1"
        @click="next()"
      >
        SIGUIENTE
      </v-btn>
    </aside>
  </div>
</template>

<script>
// import * as nearAPI from "near-api-js";
import encryp from '../services/encryp';
import localStorageUser from '~/services/local-storage-user';
import { ALERT_TYPE } from '~/plugins/dictionary';


export default {
  name: "ConnectWithNear",
  layout: "default-variant",
  // middleware: ["authenticated"],
  data() {
    return {
      dataWallets: [],
      domain: null,
      contrcat: null,
      address: null,
      routeCancel: null,
      token: JSON.parse(sessionStorage.getItem("token")),
    }
  },
  head() {
    const title = 'Connect with NEAR';
    return {
      title,
    }
  },
  created() {
    sessionStorage.removeItem("create-import-proccess")

    // console.log((atob(this.$route.query.transactions).toString("UTF-10")))

    
    // console.log( this.$route.query.transactions)
    
    /* if(this.$route.query.token){
      // const tokenString = window.atob(this.$route.query.token);
      const tokenString = encryp.decryp(this.$route.query.token);
      const tokenJSON = JSON.parse(tokenString);
      // sessionStorage.setItem("token", tokenString);
      this.token = tokenJSON
    }
    
    this.domain = this.token.domain;
    this.contract = this.token.contract;
    this.routeCancel = this.token.success; */

    if(this.$route.query.token){
      // const tokenString = window.atob(this.$route.query.token);
      const tokenString = encryp.decryp(this.$route.query.token);
      const tokenJSON = JSON.parse(tokenString);
      // sessionStorage.setItem("token", tokenString);
      this.token = tokenJSON

      this.domain = this.token.domain;
      this.contract = this.token.contract;
      this.routeCancel = this.token.success; 
    } else {
      const params = this.$route.query;
       
      this.domain = this.token.domain = this.$route.query?.success_url ? this.$route.query?.success_url.split("/")[2] : null;
      this.contract = this.token.contract = params?.contract_id;
      this.routeCancel = params?.failure_url;
      this.token.success = params?.success_url;
    }

    try {
      const arrayRes = localStorageUser.getAccounts();
      const arrayMap = arrayRes.map(item => {
        return {
          wallet: item.address,
          pass: "******"
        }
      });
      const currentAccount = localStorageUser.getCurrentAccount();
      this.selectAccount(currentAccount.address, arrayMap);
    } catch (error) {
      const jsonCreateImportProccess = JSON.stringify({
        path: "/login",
        query: this.$route.query
      })
      sessionStorage.setItem("login-create-import-proccess", jsonCreateImportProccess);
      this.$router.push({path: '/'});
    }

    /* this.domain = this.$route.query?.success_url ? this.$route.query?.success_url.split("/")[2] : "";
    this.contract = "";
    this.routeCancel = this.$route.query?.success_url;

    const arrayRes = localStorageUser.getAccounts();
    const arrayMap = arrayRes.map(item => {
      return {
        wallet: item.address,
        pass: "******"
      }
    });
    const currentAccount = localStorageUser.getCurrentAccount();
    this.selectAccount(currentAccount.address, arrayMap); */
  },
  mounted() {
    
    

  },
  methods: {
    importAccount() {
      const jsonCreateImportProccess = JSON.stringify({
        path: "/login",
        query: this.$route.query
      })
      sessionStorage.setItem("create-import-proccess", jsonCreateImportProccess);
      this.$router.push({path: '/import-wallet'});
    },
    selectAccount(address, array){
      const list = array === undefined ? this.dataWallets : array;

      const arrayRet = [];
      let indexCount = 1;
      for(let index = 0; index < list.length; index++) {
        if(list[index].wallet === address) {
          arrayRet[0] = list[index];
          this.address = list[index].wallet;
        } else {
          arrayRet[indexCount] = list[index];
          indexCount += 1;
        }
      }

      this.dataWallets = arrayRet;
    },
    next() {
      if(!this.routeCancel) { this.$router.replace({ path: "/"}) }

      if(!this.token) this.$alert(ALERT_TYPE.WARNING, { desc: "no hay token" });
      
      // if (!this.address || !this.domain || !this.contract) {console.log("error"); return}
      
      sessionStorage.setItem("connectAppAddressSelect", this.address);
      
      this.$router.push({ path: "/login-limited-permissions", query: this.$route.query });
      
    },
    cancel() {
      if(this.routeCancel) {
        /* let ruta = this.token.error;
          
        if(this.token?.searchError) {
          ruta += this.token.searchError;
        } */
        location.replace(this.routeCancel);
      } else {
        this.$router.push({ path: "/"})
      }
    }

  }
}
</script>

<style src="@/assets/styles/pages/connect-with-near.scss" lang="scss"></style>
