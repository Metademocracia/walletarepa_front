<template>
  <div id="login" class="divcol center">
    <div v-for="n in 3" :key="n" :class="`ball-decoration-${n}`" />

    <Header
      ref="header"
      :show-back-btn="false"
      top-text="INICIAR LA AVENTURA"
      description="INICIAR SESIÓN O REGÍSTRESE PARA UNIRTE A LA DIVERSIÓN"
      max-width="251px"
    ></Header>


    <section id="login-content">
      <v-btn
        class="btn-outlined"
        :disable="loading"
        :loading="loading"
        @click="onContinue('/import-wallet')"
      >
        INGRESAR CON TU BILLETERA
      </v-btn>

      <p class="p tcenter">o</p>
      
      <v-btn
        class="btn"
        :disable="loading"
        :loading="loading"
        @click="onContinue('/create-wallet')"
      >
        CREAR UNA CUENTA NUEVA
      </v-btn>
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
// import utils from '~/services/utils';

export default {
  name: "CreateImportPage",
  layout: "auth-layout",
  // middleware: ["authenticated-process-login"],
  data() {
    return {
      loading: false,
    }
  },
  head() {
    const title = 'Get started';
    return {
      title,
    }
  },
  created() {
    sessionStorage.setItem("indexSelect", "create-import");
  },
  mounted() {    
    // localStorage.removeItem("auth");
    
    /* localStorage.removeItem("importEmailNickname")
    localStorage.removeItem("importEmail")
    localStorage.removeItem("seedPhraseLoginNew")
    localStorage.removeItem("seedPhraseLogin")
    localStorage.removeItem("seedPhrase")
    localStorage.removeItem("login")
    localStorage.removeItem("seedPhraseGenerate");
    */

    /* if(this.$route.query.redirect !== undefined){
      localStorage.setItem("loginExternal", this.$route.query.redirect)
      console.log("paso login: ", localStorage.getItem("loginExternal"))
    } */
  },
  methods: {
    onContinue(rute) {
        // const typeSession = rute === "/create-wallet" ? "create" : "import";
        if(!sessionStorage.getItem("login-create-import-proccess")) {
          const jsonCreateImportProccess = JSON.stringify({
            path: "/",
          })
          sessionStorage.setItem("create-import-proccess", jsonCreateImportProccess);
        } else {
          sessionStorage.setItem("create-import-proccess", sessionStorage.getItem("login-create-import-proccess"));
        }

        this.$router.push({ path: rute });

        // this.$router.push(utils.routeAction(this.$route.query.action,rute));
    },
  }
};
</script>

<style src="~/assets/styles/pages/login.scss" lang="scss" />
