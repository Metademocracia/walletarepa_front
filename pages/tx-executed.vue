<template>
  <div id="tx-executed" class="d-flex flex-column">
    <Header class="mb-10">
      <template #prepend>
        <v-btn class="btn-icon-shadow ml-auto" style="--bg: #000; --br: 10px" @click="$router.back()">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>

    <div id="tx-executed__bg-image">
      <img src="@/assets/sources/images/approve-hand.png" alt="bg-image">
    </div>

    <span class="big-title" style="z-index: 0">TRAN</span>
    <span class="big-title text-end" style="direction: rtl; translate: .5ch 0">SAC</span>
    <span class="big-title" style="text-indent: .5ch">CIÓN</span>

    <aside class="d-flex flex-column mt-6" style="gap: 10px">
      <h3>EJECUTADA</h3>

      <v-btn class="btn mb-4" @click="goToExplorer">
        VERIFICAR EN EL EXPLORADOR
      </v-btn>  

      <v-btn class="btn-outlined" style="--bg: #fff" @click="$router.push('/')">
        OK
      </v-btn>
    </aside>
  </div>
</template>

<script>
export default {
  name: "TransactionExecutedPage",
  layout: 'default-variant-2',
  data() {
    return {
      langList: [
        { key: "es", name: "Español" },
        { key: "en", name: "English" },
        { key: "ru", name: "Русский" }
      ],
    };
  },
  head() {
    const title = 'Transaction executed';
    return {
      title,
    }
  },
  mounted(){
    localStorage.removeItem('MessageCounter');
  },
  methods: {
    goToExplorer() {
      window.open(process.env.URL_EXPLORER + localStorage.getItem('address'), '_blank');
    },
  },
};
</script>

<style src="~/assets/styles/pages/tx-executed.scss" lang="scss" />
