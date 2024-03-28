<template>
  <v-form ref="form" v-model="valid">
  <div id="passphrase-login" class="divcol center">
    <Header
      ref="header"
      top-text="FRASE DE CONTRASEÑA"
      bottom-text="ACCESO"
      description="SI ES TU PRIMERA VEZ PUEDES CREAR UNA NUEVA BILLETERA"
      max-width="284px"
      top-text-dir="rtl"
      bottom-text-dir="ltr"
    />

    <section style="width: 100% !important;">
      <v-btn
        class="btn-outlined mb-3"
        style="width: 100% !important; --bg: rgba(36, 200, 255, 0.35); --bs: none;"
      >
        CREAR NUEVA BILLETERA
      </v-btn>

      <p class="text-center">
        O<br>INICIAR SESIÓN SEGURA USANDO CONTRASEÑA
      </p>
    </section>

    <section id="passphrase-login-content">
      <div ref="container" class="container-words" @scroll="onScroll">
        <v-text-field
          v-for="item in 12" :key="item"
          v-model="seedPhraseSplit[item]"
          :label="`enter word #${item}`" solo
          style="--margin-message: 1px"
          :rules="required"
          @keydown="prueba()"
        ></v-text-field>
      </div>


      <v-btn v-if="!scrollEnd" class="btn" @click="$refs.container.scrollTop += 100">
        <img width="10px" src="@/assets/sources/icons/scroll-down.svg" alt="scroll down">
      </v-btn>

      <v-btn v-else class="btn" @click="onTap()">Continuar</v-btn>
    </section>
  </div>
  </v-form>
</template>

<script>
import utils from '~/services/utils';

export default {
  name: "PassphraseLoginPage",
  layout: "auth-layout",
  data() {
    return {
      scrollEnd: false,
      seedPhraseSplit: {},
      valid: false,
      required: [(v) => !!v || "Campo requerido"],
    }
  },
  head() {
    const title = 'Passphrase login';
    return {
      title,
    }
  },
  mounted() {
    this.$store.commit('validSession')
  },
  methods: {
    onScroll(event) {
      const container = event.currentTarget
      this.scrollEnd = container.scrollTop + container.clientHeight === container.scrollHeight
    },
    prueba() {
      // this.$router.push(this.localePath("/verification"))
    },
    onTap(){
      let counterWord = 0
      let seedPhrase = ""
      for(let i = 0; i < 12; i++) {
        const word = this.seedPhraseSplit[(i+1).toString()];
        if(word !== undefined) {
          counterWord++;
          seedPhrase = seedPhrase + (i === 0 ? word : " " + word)
        } 
      }
      
      console.log(seedPhrase)
      this.$refs.form.validate();

      if(counterWord === 12) {
        localStorage.setItem("seedPhraseGenerate", seedPhrase);
        localStorage.setItem("seedPhraseLogin", true);
        // this.$router.push(this.localePath("/passphrase-word"))
        this.$router.push(utils.routeAction(this.$route.query.action,"/passphrase-word"));
      }
    },
  }
};
</script>

<style src="~/assets/styles/pages/passphrase-login.scss" lang="scss" />
