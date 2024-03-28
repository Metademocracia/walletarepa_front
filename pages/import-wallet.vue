<template>
  <div id="login" class="divcol center">
    <Header
      ref="header"
      :show-back-btn="false"
      top-text="INGRESAR CON"
      bottom-text="BILLETERA"
      description="SELECCIONA TU MEOJOR OPCIÓN Y COMIENZA A USAR LA WEB3"
      max-width="251px"
    />

    <!--<div v-for="i in 3" :id="`login-decoration-${i}`" :key="i" />-->

    <section id="login-content">
        <!--<v-text-field
          v-model="emailImput"
          solo label="Correo"
          style="--margin-message: 1px"
          :rules="requiredEmail"
        ></v-text-field>

        <v-btn
          class="btn"
          :disable="loading"
          :loading="loading"
          @click="onContinue()"
        >
          RECIBIR CÓDIGO AL CORREO
        </v-btn>

      

      <p class="p tcenter">o</p>-->
      
      <v-btn
        class="btn"
        :disable="loading"
        :loading="loading"
        @click="onContinueLogin('/import-wallet-passphrase')"
      >
        INGRESAR CON 12 PALABRAS
      </v-btn>

      <p class="p tcenter">o</p>

      <v-btn
        class="btn-outlined"
        :disable="loading"
        :loading="loading"
        @click="onContinueLogin('/import-wallet-privatekey')"
      >
        INGRESAR CON LLAVE PRIVADA
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
</template>

<script>
// import axios from 'axios';
// import * as nearAPI from "near-api-js";
// import jwtDecode from 'jwt-decode';
// import utils from '~/services/utils';
// import localStorageUser from '~/services/local-storage-user';

export default {
  name: "ImportWalletPage",
  layout: "auth-layout",
  middleware: ["authenticated-create-import"],
  data() {
    return {
      loading: false,
      validEmail: false,
      // requiredEmail: [(v) => !!v || "Campo requerido", (v) => /.+@.+/.test(v) || 'E-mail inválido'],
      // emailImput: null,
    }
  },
  head() {
    const title = 'Get started';
    return {
      title,
    }
  },
  methods: {
    /* async onContinue() {
      if(this.$refs.formEmail.validate()) {
        this.loading = true
        await axios.post(process.env.URL_BACKEND +'/wallet/send-code',
        {email: this.emailImput}, {
          headers: {
            'accept': 'application/json',
          },
        }).then(() => {
          this.loading = false
          localStorage.setItem("email", this.emailImput);
          // localStorage.setItem("login", true);
          
          this.$router.push(utils.routeAction(this.$route.query.action,"/verification-login-email"));
          // this.$router.push(this.localePath("/verification-login-email"))
        }).catch(() => {
          this.loading = false
        })
      }
    }, */


    onContinueLogin(rute) {
      // localStorage.setItem("login", true);
      // this.$router.push(utils.routeAction(this.$route.query.action,rute));
      this.$router.push({ path: rute });
      // this.$router.push(this.localePath("/passphrase"))
    }
  } 
};
</script>

<style src="~/assets/styles/pages/login.scss" lang="scss" />
