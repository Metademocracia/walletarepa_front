<template>
  <div id="passphrase-word" class="divcol center">
    <Header
      ref="header"
      top-text=""
      bottom-text="VERIFICAR PASSPHRASE"
      description="INGRESE LA SIGUIENTE PALABRA DE SU FRASE CONTRASEÑA PARA CONFIRMAR QUE LA HAZ GUARDADO DE FORMA SEGURA"
      max-width="284px"
      top-text-dir="rtl"
      bottom-text-dir="ltr"
      :show-prepend="showPrepend"
    />

    <section id="passphrase-word-content">
      <v-text-field
        v-model="seedPhraseWord"
        :label="'enter word #' + (phraseNumber+1) " solo
        style="--margin-message: 1px"
        :error-messages="error"
      ></v-text-field>

      <v-btn
        class="btn"
        :disable="loading"
        :loading="loading"
        @click="onVerify()"
      >
        VERIFICAR
      </v-btn>

      <v-btn class="btn-outlined" @click="$router.go(-1)">VOLVER</v-btn>
    </section>
  </div>
</template>

<script>
// import axios from 'axios';
// import { parseSeedPhrase } from 'near-seed-phrase';
// import * as nearAPI from "near-api-js";
// import localStorageUser from '../services/local-storage-user';
// import utils from '~/services/utils';
// const { KeyPair } = nearAPI;

export default {
  name: "PassphraseWordPage",
  layout: "auth-layout",
  middleware: ["authenticated-create-import"],
  data() {
    return {
      loading: false,
      error: null,
      phraseNumber: 0,
      seedPhraseWord: null,
      showPrepend: true,
    }
  },
  head() {
    const title = 'Passphrase word';
    return {
      title,
    }
  },
  mounted() {
    this.phraseNumber = Math.floor(Math.random() * 12)
    if(localStorage.getItem("seedPhraseLoginNew") !== undefined && localStorage.getItem("seedPhraseLoginNew") !== null) {
      this.showPrepend = false
    }
  },
  methods: {
    onVerify() {
      this.error = null;
      this.loading = true;
      const seedPhrase = localStorage.getItem("seedPhraseGenerate").split(" ").map((item) => { return item });

      if(this.seedPhraseWord === seedPhrase[this.phraseNumber]) {
        
        this.loading = false
        localStorage.setItem("auth", true)
        localStorage.removeItem("seedPhraseLogin")
        // this.$router.push(this.localePath("/"))
        // this.$router.push(this.localePath(utils.routeLogin(this.$route.query.action)));
        this.$router.push(JSON.parse(sessionStorage.getItem("create-import-proccess")));
        
        
      } else {
        this.loading = false;
        this.error = "Palabra Incorrecta";
      }
      
    }
  }
};
</script>

<style src="~/assets/styles/pages/passphrase-word.scss" lang="scss" />
