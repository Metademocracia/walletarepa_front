<template>
  <div id="verification" class="divcol center">
    <Header
      ref="header"
      top-text="otp"
      bottom-text="verificación"
      description="INGRESE EL CÓDIGO DE VERIFICACIÓN QUE ACABAMOS DE ENVIAR A SU DIRECCIÓN DE CORREO ELECTRÓNICO"
      max-width="279px"
      top-text-dir="rtl"
      top-text-indent="2.8ch"
      bottom-text-dir="ltr"
    />

    <section id="verification-content">
      <v-otp-input
        v-model="otp"
        :length="lengthOtp"
        type="number"
        @change="error=null"
      ></v-otp-input>
      <span :v-show="error" style="color: red;">{{error}}</span>
      
      <div v-show="minutes > 0" class="space">
        <span class="text">reenviar código en</span>

        <span
          class="text"
          style="--text: #F20C0C; --fw: 700"
        >{{minutes}}:{{seconds}}</span>
      </div>

      <div v-show="minutes <= 0" class="space">
        <a
          :disabled="disabledResend"
          @click="resendCode()"
        ><span class="text" style="color: blue !important;" >reenviar código</span></a>
      </div>

      <v-btn
        class="btn"
        :disabled="!isActive"
        :loading="loading"
        @click="onVerify()"
      >
        verificar
      </v-btn>
    </section>

    <Footer ref="footer">
      <span class="text" style="--text: var(--text2)">¿NECESITAS AYUDA? 
        <a style="--fw: 700" href="#" target="_blank">SOPORTE</a>
      </span>
    </Footer>
  </div>
</template>

<script>
import axios from 'axios';
import localStorageUser from '../services/local-storage-user';
import utils from '~/services/utils';

export default {
  name: "VerificationPage",
  layout: "auth-layout",
  data() {
    return {
      loading: false,
      lengthOtp: 4,
      otp: "",
      error: null,
      minutes: 5,
      seconds: 0,
      disabledResend: false,
    }
  },
  head() {
    const title = 'OTP Verification';
    return {
      title,
    }
  },
  computed: {
    isActive () {
      return this.otp.length === this.lengthOtp && this.minutes > 0
    },
  },
  mounted() {
    this.$store.commit('validSession')
    this.initCounter();
  },
  methods: {
    timer() {
      if(this.minutes === 0) {
        this.seconds = 0;
        return
      }
      if(this.seconds === 0) {
        this.minutes--;
        this.seconds = 60;
      } else {
        this.seconds--;
      }
    },
    initCounter() {
      setInterval(this.timer, 1000);
    },

    async resendCode() {
      this.disabledResend = true
        await axios.post(process.env.URL_BACKEND +'/wallet/send-code', 
        {email: localStorage.getItem("email")}, {
          headers: {
            'accept': 'application/json',
          },
        }).then(() => {
          this.minutes = 5
          this.disabledResend = false
        }).catch(() => {
          this.disabledResend = false
        })
    },

    async onVerify() {
      this.loading = true;
      this.error = null;
      
      // let route = "email-wallet-import"
      const params = {email: localStorage.getItem("email"), code: this.otp.toString()}
      
      console.log("entro 2")
      await axios.post(process.env.URL_BACKEND +'/wallet/email-wallet-import', params
      ).then((response) => {
        console.log("entro 1")
        const data = response.data.data;
        
        // agregando nueva cuenta con nicname
        localStorageUser.addNewAccount({
          _address: data.address,
          _publicKey: data.publicKey,
          _privateKey: data.secretKey,
          _email: params.email,
        });

        this.loading = false

        localStorage.setItem("auth", true)
        // this.$router.push(this.localePath("/"))
        this.$router.push(this.localePath(utils.routeLogin(this.$route.query.action)));
        
      }).catch((error) => {
        console.log("entro 4")
        this.error = error.response.data
        this.loading = false
      })
    },
  }
};
</script>

<style src="~/assets/styles/pages/verification.scss" lang="scss" />
