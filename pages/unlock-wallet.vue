<template>
  <div id="unlock-wallet" class="divcol center">
    <div v-for="n in 3" :key="n" :class="`ball-decoration-${n}`" />

    <Header
      ref="header"
      :show-prepend="false"
      top-text="DESBLOQUEA"
      bottom-text="TU BILLETERA"
      description="Tu clave privada está encriptada en este dispositivo solo se puede acceder a ella con tu clave de desbloqueo"
      max-width="315px"
      top-text-dir="ltr"
      bottom-text-dir="rtl"
    ></Header>


    <v-form id="unlock-wallet-content" ref="form" @submit.prevent="onComplete">
      <v-text-field
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="CLAVE DE DESBLOQUEO" solo
        :rules="[globalRules.required]"
        @kedown="({ key }) => {
          if (key != 'Enter') return
          onComplete()
        }"
      >
        <template #append>
          <v-btn 
            class="btn-icon"
            style="--bg: var(--secondary);
            --b: 1px solid var(--primary);"
            @click="showPassword = !showPassword"
          >
            <v-icon color="var(--primary)" size="16">
              {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
            </v-icon>
          </v-btn>
        </template>
      </v-text-field>
      
      <v-btn
        class="btn"
        :loading="loading"
        @click="onComplete"
      >DESBLOQUEAR</v-btn>
    </v-form>



    <Footer ref="footer">
      <span
        class="text tcenter"
        style="--fw: 700; --text: var(--text2); margin-top: 22px"
      >POLÍTICA DE PRIVACIDAD</span>
    </Footer>
  </div>
</template>

<script>
import * as cryptoJS from 'crypto-js';
import localStorageUser from '@/services/local-storage-user';

export default {
  name: "UnlockWalletPage",
  layout: "default-variant",
  data() {
    return {
      loading: false,
      showPassword: false,
      password: null,
    }
  },
  head() {
    const title = 'Billetera bloqueada';
    return {
      title,
    }
  },
  created() {
    const address = localStorage.getItem("address");

    if (!address) {
      this.$router.push("/")
    }

    const account = localStorageUser.getAccount(address);

    if (account.publicKey.startsWith("ed25519:")) {
      this.$router.push("/")
    }
  },

  methods: {
    onComplete() {
      if (!this.$refs.form.validate()) return

      // if (this.password !== localStorageUser.getLockPassword()) return this.$alert('error', {desc: "La contraseña no coincide"})

      const address = localStorage.getItem("address")

      if (!address) {
        return this.$router.push("/")
      }

      try {
        const account = localStorageUser.getAccount(address)

        const privateKey = this.decrypt(account.privateKey, this.password)

        const publicKey = this.decrypt(account.publicKey, this.password)

        if (!privateKey || !publicKey) return this.$alert('error', {desc: "La contraseña no coincide"})

        if (!publicKey.startsWith('ed25519:') || !publicKey.startsWith('ed25519:')) {
          return this.$alert('error', {desc: "La contraseña no coincide"})
        }

        localStorage.setItem("privateKey", privateKey)
        localStorage.setItem("publicKey", publicKey)

        localStorage.setItem("unlock", true)

        const listUser = localStorageUser.getListUser()

        const usersData = listUser.map(result => {
          result[1].privateKey = this.decrypt(result[1].privateKey, this.password)
          result[1].publicKey = this.decrypt(result[1].publicKey, this.password)
          return result
        })

        const userMapStr = JSON.stringify(Array.from(usersData))

        localStorage.setItem('listUser', userMapStr)
        localStorage.setItem('listUser', userMapStr)

        // const token = localStorage.getItem("token")
        /* if (token) {
          localStorage.removeItem("token")
          this.$router.push("/login?token=" + token)
        } else */ 
        
        if(this.$route.query?.callBackUnlock) {
          // localStorage.removeItem("route-after-unlocking");
          const path = this.$route.query.callBackUnlock;
          this.$route.query.callBackUnlock = undefined;
          this.$router.push({ path, query: this.$route.query })
        } else {
          this.$router.push("/")
        }
          
        
      } catch (error) {
        console.error(error)
      }

      // console.log("replaced by", this.$route.query.from ?? '/');

      // this.$store.commit('setLockAuth', true)
      // this.$router.back()
      // this.$router.replace(this.$route.query.from ?? '/')
    },
    decrypt(text, secret) {
      try {
        const bytes  = cryptoJS.AES.decrypt(text, secret);
        const originalText = bytes.toString(cryptoJS.enc.Utf8);
        const data = JSON.parse(originalText);
        return data.text
      } catch (error) {
        return null
      }
     
    }
  }
};
</script>

<style src="~/assets/styles/pages/unlock-wallet.scss" lang="scss" />
