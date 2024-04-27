<template>
  <v-form ref="formUser" v-model="validUser">
  <div id="login" class="divcol center">
    <div v-for="n in 3" :key="n" :class="`ball-decoration-${n}`" />
    <Header
      ref="header"
      top-text="DATOS DE CONTACTO"
      description="INFORMACIÓN PERSONAL REQUERIDA PARA USAR EL SERVICIO P2P"
      max-width="251px"
    />

    <!--<div v-for="i in 3" :id="`login-decoration-${i}`" :key="i" />-->

    <section id="login-content">
      <v-text-field
        v-model="emailImput"
        solo label="Correo"
        style="--margin-message: 1px"
        :rules="requiredEmail"
      ></v-text-field>

      <v-text-field
        v-model="nameInput"
        solo label="nombre y apellido"
        style="--margin-message: 1px"
        :rules="required"
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
        @click="onContinue()"
      >
        GUARDAR Y CONTINUAR
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
import wallet from '@/services/local-storage-user'

export default {
  name: "CreateProfile",
  layout: "auth-layout",
  data() {
    return {
      loading: false,
      validUser: false,
      required: [(v) => !!v || "Es requerido"],
      requiredEmail: [(v) => !!v || "Campo requerido", (v) => /.+@.+/.test(v) || 'E-mail inválido'],
      emailImput: null,
      cedulaImput: null,
      nameInput: null,
    }
  },
  head() {
    const title = 'User Profile';
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
      if(this.$refs.formUser.validate()) {
        this.loading = true
        await axios.post(process.env.URL_BACKEND +'/wallet/update-wallet',
        { email: this.emailImput, 
          cedula: this.cedulaImput, 
          name: this.nameInput, 
          walletname: wallet.getCurrentAccount().address,
        }, {
          headers: {
            'accept': 'application/json',
          },
        }).then((response) => {
          this.loading = false
          // localStorage.setItem("login", true);
          console.log(response.data)
          
          // this.$router.push(utils.routeAction(this.$route.query.action,"/create-wallet-verification"));
          
          this.$router.push({ path: "/withdraw" });
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