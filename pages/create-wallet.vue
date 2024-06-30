<template>
  <v-form ref="formEmail" v-model="validEmail">
  <div id="login" class="divcol center">
    <div v-for="n in 3" :key="n" :class="`ball-decoration-${n}`" />
    <Header
      ref="header"
      top-text="CREAR BILLETERA"
      description="SELECCIONA TU MEJOR OPCIÓN Y COMIENZA A USAR LA WEB3"
      max-width="251px"
    />

    <!--<div v-for="i in 3" :id="`login-decoration-${i}`" :key="i" />-->
    <img src="@/assets/sources/logos/logotype.svg" alt="logo icon" class="mx-auto" style="width: min(100%, 170px);">

    <section id="login-content">
      <v-text-field
        v-model="emailImput"
        solo label="Correo"
        style="--margin-message: 1px"
        :rules="requiredEmail"
      ></v-text-field>

      <v-text-field
        v-model="cedulaImput"
        solo label="cedula"
        style="--margin-message: 1px"
        :rules="required"
      ></v-text-field>

      <v-btn
        class="btn"
        :disable="loading"
        :loading="loading"
        @click="onContinue('/new-login')"
      >
        RECIBIR CÓDIGO AL CORREO
      </v-btn>
      <!--<v-btn
        class="btn-outlined"
        @click="onContinueGoogle()"
      >
        <img width="18px" src="~/assets/sources/logos/gmail.svg" alt="gmail logo" style="margin-right: 10px">
        <span>CONTINUE WITH GOOGLE</span>
      </v-btn> -->

      <!-- <v-btn
        id="googleButton"
        class="btn-outlined"
      >
        <img width="18px" src="~/assets/sources/logos/gmail.svg" alt="gmail logo" style="margin-right: 10px">
        <span>CONTINUE WITH GOOGLE</span>
      </v-btn> -->
      <!--<v-btn
        class="btn-outlined"
        :loading="loading"
      >
        <span id="googleButton"></span>
      </v-btn>


      <v-btn
        class="btn-outlined"
        :disable="loading"
        :loading="loading"
        @click="onContinuePassphrase()"
      >
        CONTINUAR CON CONTRASEÑA
      </v-btn>-->


      <!--<v-btn
        class="btn-outlined"
        @click="prueba()"
      >
        Pruebas login
      </v-btn>-->
    </section>



    <Footer ref="footer">
      <span
        class="text tcenter"
        style="--fw: 700; --text: var(--text2); margin-top: 22px"
      >POLÍTICA DE PRIVACIDAD</span>
    </Footer>
  </div>
</v-form>
</template>

<script>
import axios from 'axios';
// import * as nearAPI from "near-api-js";
// import jwtDecode from 'jwt-decode';
// import utils from '~/services/utils';
// import localStorageUser from '~/services/local-storage-user';
import { ALERT_TYPE } from '~/plugins/dictionary';

export default {
  name: "CreateWalletPage",
  layout: "auth-layout",
  middleware: ["authenticated-create-import"],
  data() {
    return {
      loading: false,
      validEmail: false,
      required: [(v) => !!v || "Es requerido"],
      requiredEmail: [(v) => !!v || "Campo requerido", (v) => /.+@.+/.test(v) || 'E-mail inválido'],
      emailImput: null,
      cedulaImput: null,
    }
  },
  head() {
    const title = 'Get started';
    return {
      title,
    }
  },
  mounted() {    
    // this.$store.commit('validSession')

    /* if(this.$route.query.redirect !== undefined){
      localStorage.setItem("loginExternal", this.$route.query.redirect)
      console.log("paso login: ", localStorage.getItem("loginExternal"))
    } */
  },
  methods: {
    async onContinue() {
      if(this.$refs.formEmail.validate()) {
        this.loading = true
        await axios.post(process.env.URL_BACKEND +'/wallet/send-code-verify-email',
        {email: this.emailImput.toLowerCase(), cedula: this.cedulaImput}, {
          headers: {
            'accept': 'application/json',
          },
        }).then(() => {
          this.loading = false
          sessionStorage.setItem("email", this.emailImput.toLowerCase());
          sessionStorage.setItem("cedula", this.cedulaImput);
          // localStorage.setItem("login", true);
          
          // this.$router.push(utils.routeAction(this.$route.query.action,"/create-wallet-verification"));
          
          this.$router.push({ path: "/create-wallet-verification" });
          // this.$router.push(this.localePath("/verification"))
        }).catch((error) => {
          this.loading = false
          this.$alert(ALERT_TYPE.ERROR, { desc: error.response.data || error.toString() })
          console.log(error.response)
        })
      }
    },
  }
};
</script>

<style src="~/assets/styles/pages/login.scss" lang="scss" />