<template>
  <div id="passphrase" class="divcol center">
    <Header
      ref="header"
      top-text=""
      bottom-text="CREACIÓN DE CONTRASEÑA"
      description="GENERAR Y ALMACENAR DE FORMA SEGURA UNA FRASE CONTRASEÑA ÚNICA"
      max-width="284px"
      top-text-dir="rtl"
      bottom-text-dir="ltr"
      :show-back-btn="false"
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

  </div>
</template>

<script>
// import utils from '~/services/utils';

export default {
  name: "PassphraseNewPage",
  layout: "auth-layout",
  middleware: ["authenticated-create-import"],
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
      // this.$router.push(utils.routeAction(this.$route.query.action,"/passphrase-word"));
      this.$router.push({ path: "/create-wallet-passphrase-word" });
    },
    generatePhrase() {
      const seedPhrase = localStorage.getItem("seedPhrase");

      localStorage.setItem("seedPhraseGenerate", seedPhrase);
      localStorage.setItem("seedPhraseLoginNew", true)
      
      this.seedPhrase = seedPhrase;
      this.dataPassphrase = seedPhrase.split(" ").map((item) => { return item });
      
    },
  }
};
</script>

<style src="~/assets/styles/pages/passphrase.scss" lang="scss" />
