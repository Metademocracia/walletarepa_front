<template>
  <div id="trades-pending" class="d-flex flex-column">
    <Header
      top-text="EN ESPERA DE"
      bottom-text="CONFIRMACIÓN"
      bottom-text-dir="ltr"
      hide-prepend
      class="mb-4"
    >
      <template #prepend>
        <v-btn class="btn-icon-shadow ml-auto" @click="$router.back()">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>

    <aside style="display: grid; grid-template-columns: repeat(5, 1fr) 35px; grid-template-rows: repeat(2, 1fr) 35px; gap: 15px;">
      <v-card class="card pa-4 px-6 d-flex" style="--bg: var(--card-2); grid-column: span 4; grid-row: span 2; gap: 5px;">
        <div>
          <p class="mb-0" style="font-family: var(--font3) !important; --fs: 12px">
            Estimated time to receive Payment:
          </p>
  
          <span
            style="font-family: var(--font3) !important; font-size: 24px !important;"
            v-text="formattedTime(seconds)"
          />
        </div>

        <img src="@/assets/sources/icons/reloj.svg" alt="clock icon">
      </v-card>
      
      <v-card class="card clock pa-4" style="--bg: var(--card-2); grid-column: span 2; grid-row: span 2;">
        {{ formattedTime(secondsEstimated) }}
      </v-card>

      <v-card class="card px-4 d-flex align-center justify-space-between" style="--bg: #D6DAE2; grid-column: span 5">
        <profile-avatar
          show-name
          :profile="{
            name: 'Star_Tranding',
            avatar: require('@/assets/sources/avatars/avatar.png'),
            verified: true,
          }"
        />

        <v-icon color="var(--primary)">mdi-chevron-right</v-icon>
      </v-card>

      <v-badge offset-x="10px" offset-y="10px" :value="true" content="3" style="--c: #fff">
        <v-btn class="btn-icon" style="--bg: #000; --size: 35px; --br: 10px" @click="$router.push('/trades-chat')">
          <img src="@/assets/sources/icons/live-chat.svg" alt="chat icon">
        </v-btn>
      </v-badge>
    </aside>


    <aside class="my-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 151px), 1fr)); grid-auto-rows: 111px; gap: 15px;">
      <v-card class="card-outline flex-grow-1 d-flex flex-column pa-4">
        <p class="mb-1">Buyer's name</p>
        <span
          class="d-flex"
          style="font-family: var(--font3) !important; font-size: 13px; line-height: 2ch !important;"
        >Gonzalez Briceño Mario Jose</span>

        <a class="mt-auto ml-auto d-flex align-center" style="font-size: 11px; --fw: 700">
          <img src="@/assets/sources/icons/info.svg" alt="info icon" class="mr-2">
          <span
            class="d-flex"
            style="--c: #000; font-weight: 400 !important; font-size: 9px !important; line-height: normal !important;"
          >Atención al cliente 24/7 de NEAR P2P</span>
          <v-icon size="18">mdi-chevron-right</v-icon>
        </a>
      </v-card>

      <v-card class="card flex-grow-1 d-flex flex-column pa-4" style="--bg: var(--card-2)">
        <p class="mb-2">Advertiser's terms</p>

        <p class="mb-0">Buenas, mantengase en línea “SOY TITULAR y PAGO RÁPIDO”...</p>

        <a
          class="mt-auto ml-auto d-flex align-center" style="font-size: 11px; --fw: 700"
          @click="$router.push('/trades-payment-details')"
        >
          SEE MORE
          <v-icon size="18">mdi-chevron-right</v-icon>
        </a>
      </v-card>
    </aside>

    <v-card class="card-outline pa-4">
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0" style="font-weight: 700 !important;">SELL USDT</p>
        <img src="@/assets/sources/styled-tokens/usdt.svg" alt="crypto coin" style="width: 20px;">
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0">Fiat Amount</p>
        <span class="mb-0" style="font-weight: 700 !important; font-size: 16px !important">Bs. 577.800</span>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <p class="mb-0">Price:</p>
        <p class="mb-0" style="font-weight: 700 !important;">Bs. 9.640</p>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <p class="mb-0">Crypto Amount:</p>
        <p class="mb-0" style="font-weight: 700 !important;">60.00 USDT</p>
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="mb-0">Order number:</p>
        <p class="mb-0">87639478290917730</p>
      </div>
    </v-card>

    <v-btn
      class="btn-outlined mb-4 mt-8"
      style="--bg: var(--card-2)"
    >VOLVER AL CHAT</v-btn>

    <v-btn class="btn">IR A LA BILLETERA</v-btn>

    <h6 class="d-flex mt-8" style="--ff: var(--font2); --fw: 700; --fs: 10px; --lh: normal">
      PUEDE SEGUIR HACIENDO OTRAS TAREAS<br><br><br>
      PARA VOLVER AQUÍ PUEDE DAR CLIC EN ACTIVIDADES RECIENTES, EN LA ZONA INFERIOR DE LA VENTANA PRINCIPAL

      <img src="@/assets/sources/icons/warning-orange.svg" alt="info icon" class="ml-1" style="translate: 0 5px">
    </h6>
  </div>
</template>


<script>
import { formattedTime } from '@/plugins/functions'

export default {
  name: "TradesPendingPage",
  data() {
    return {
      formattedTime,
      seconds: 600,
      secondsEstimated: 300,
    }
  },
  head() {
    const title = 'Trades Pending';
    return {
      title,
    }
  },
  watch: {
    seconds: {
      handler(value) {
        if (value > 0) setTimeout(() => {this.seconds--}, 1000);
      },
      immediate: true
    },
    secondsEstimated: {
      handler(value) {
        if (value > 0) setTimeout(() => {this.secondsEstimated--}, 1000);
      },
      immediate: true
    }
  },
};
</script>

<style src="~/assets/styles/pages/trades-pending.scss" lang="scss" />
