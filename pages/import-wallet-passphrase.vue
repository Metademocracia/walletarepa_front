<template>
  <v-form ref="form" v-model="valid">
  <div id="passphrase-login" class="divcol center">
    <Header
      ref="header"
      top-text="INGRESAR CON"
      bottom-text="12 PALABRAS"
      description="INICIA SESSIÓN CON TU FRASE CONTRASEÑA"
      max-width="284px"
      top-text-dir="rtl"
      bottom-text-dir="ltr"
    />

    <section id="passphrase-login-content">
      <div ref="container" class="container-words" @scroll="onScroll">
        <v-text-field
          v-for="(item, i) in words" :key="i"
          v-model="item.model"
          :label="`Coloque frase #${i+1}`" solo
          style="--margin-message: 1px"
          :rules="required"
          @paste="onPaste"
        ></v-text-field>
      </div>


      <v-btn v-if="!scrollEnd" class="btn" @click="$refs.container.scrollTop += 100">
        <img width="10px" src="@/assets/sources/icons/scroll-down.svg" alt="scroll down">
      </v-btn>

      <v-btn v-else class="btn" :loading="loading" @click="onTap()">Continuar</v-btn>
    </section>
  </div>
  </v-form>
</template>

<script>
// import axios from 'axios';
import { parseSeedPhrase } from 'near-seed-phrase';
import * as nearAPI from "near-api-js";
import localStorageUser from '../services/local-storage-user';
import WalletUtils from '@/services/wallet';
// import utils from '~/services/utils';
const { KeyPair } = nearAPI;

export default {
  name: "PassphraseLoginPage",
  layout: "auth-layout",
  middleware: ["authenticated-create-import"],
  data() {
    return {
      scrollEnd: false,
      words: [{model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}, {model: null}],
      valid: false,
      required: [(v) => !!v || "Campo requerido"],
      loading: false,
    }
  },
  /* head() {
    const title = 'Passphrase login';
    return {
      title,
    }
  }, */
  methods: {
    async onPaste(event) {
      const value = await navigator.clipboard.readText(),
        words = value.split(' ');
      if (words.length !== 12) return;
      event.preventDefault()

      let i = 0;
      for (const item of this.words) {
        item.model = words[i];
        i++;
      }
    },
    onScroll(event) {
      const container = event.currentTarget
      this.scrollEnd = container.scrollTop + container.clientHeight >= (container.scrollHeight - 3)
    },
    async onTap(){
      this.loading = true;
      
      if(this.$refs.form.validate()) {
        const { secretKey } = await parseSeedPhrase(this.words.map((item) => { return item.model}).join(' '));
        const keyPairNew = KeyPair.fromString(secretKey);
        const publicKey = keyPairNew.getPublicKey().toString(); // keyPairNew.publicKey.toString();
        let address = Buffer.from(keyPairNew.getPublicKey().data).toString("hex");

        /* await axios.get(process.env.URL_API_INDEXER + "/keys/" + publicKey )
          .then((response) => {
            if(response.data?.keys?.length > 0) {
              if(response.data?.keys[0]?.account_id) {
                address = response.data?.keys[0]?.account_id
              }
            }
        }).catch((error) => {
          console.log(error)
        }) */
        
        await WalletUtils.getNearId(publicKey).then((item) => {
          address = item
        }).catch((error) => {
          console.log(error)
        })

        // agregando nueva cuenta
        localStorageUser.addNewAccount({
          _address: address,
          _publicKey: publicKey,
          _privateKey: secretKey
        })

        this.loading = false;
        
        localStorage.setItem("auth", true)
        
        // this.$router.push(this.localePath("/"))
        // this.$router.push(this.localePath(utils.routeLogin(this.$route.query.action)));
        // this.$router.push({ path: sessionStorage.getItem("create-import-proccess")})
        this.$router.push(JSON.parse(sessionStorage.getItem("create-import-proccess")))
      }
      this.loading = false;
    },
  }
};
</script>

<style src="~/assets/styles/pages/passphrase-login.scss" lang="scss" />
