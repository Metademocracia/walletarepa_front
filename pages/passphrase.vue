<template>
  <div id="passphrase" class="divcol center">
    <Header
      ref="header"
      top-text="FRASE DE CONTRASEÑA"
      bottom-text="REGISTRARSE"
      description="GENERAR Y ALMACENAR DE FORMA SEGURA UNA CONTRASEÑA ÚNICA"
      max-width="284px"
      top-text-dir="rtl"
      bottom-text-dir="ltr"
    />

    <section id="passphrase-content">
      <div class="grid">
        <div v-for="item in dataPassphrase" :key="item" class="btn-outlined">
          <span>{{item}}</span>
        </div>
      </div>

      <div class="space" style="gap: 15px">
        <v-btn class="btn" style="flex-grow: 1" @click="onContinue()">continuar</v-btn>
        <v-btn
          class="btn-icon"
          style="--size: 45px"
          @click="fnCopie()"
          v-clipboard:copy="seedPhrase"
        >
          <v-icon v-if="copie">mdi-check</v-icon>
          <img v-if="!copie" width="23px" src="@/assets/sources/icons/copy.svg" alt="copy to clipboard">
        </v-btn>
      </div>
    </section>

    <Footer ref="footer">
      <span class="text" style="--text: var(--text2)">¿YA TIENE UNA FRASE DE CONTRASEÑA?
        <a style="--fw: 700" @click="onSignIn()">LOGIN</a>
      </span>
    </Footer>
  </div>
</template>

<script>

import { generateSeedPhrase } from 'near-seed-phrase';
import utils from '~/services/utils';

export default {
  name: "PassphrasePage",
  layout: "auth-layout",
  data() {
    return {
      dataPassphrase: [],
      seedPhrase: "",
      copie: false,
    }
  },
  head() {
    const title = 'Passphrase';
    return {
      title,
    }
  },
  created() {
    this.$store.commit('validSession');
  },
  mounted() {
    this.generatePhrase();
  },
  methods: {
    fnCopie() {
      this.copie = true;
      const timer = setInterval(() => {
        this.copie = false;
        clearInterval(timer)
      }, 1000*2);
      
    },

    onContinue() {
      // this.$router.push(this.localePath("/passphrase-word"))
      this.$router.push(utils.routeAction(this.$route.query.action,"/passphrase-word"));
    },
    onSignIn() {
      // this.$router.push(this.localePath("/passphrase-login"))
      this.$router.push(utils.routeAction(this.$route.query.action,"/passphrase-login"));
    },
    async generatePhrase() {
      const { seedPhrase } = await generateSeedPhrase();

      // this.$auth.$storage.setState("seedPhraseGenerate", seedPhrase);
      localStorage.setItem("seedPhraseGenerate", seedPhrase);
      // console.log(this.$auth.$storage.getState("seedPhraseGenerate"))
      
      this.seedPhrase = seedPhrase;
      this.dataPassphrase = seedPhrase.split(" ").map((item) => { return item });
      
    },
  }
};
</script>

<style src="~/assets/styles/pages/passphrase.scss" lang="scss" />
