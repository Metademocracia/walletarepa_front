<template>
  <div id="tx-successfuly" class="divcol center">
    <Header
      ref="header"
      :show-prepend="false"
      top-text="TRANSACCIÓN"
      top-text-dir="rtl"
      bottom-text="EXITOSA"
      bottom-text-dir="ltr"
      max-width="309px"
    />

    <span
      class="text-center"
      style="font-weight: 500 !important;"
    >
      ENVIASTE <strong style="font-weight: 700 !important;">20 USDT</strong>
      <br>A <strong style="font-weight: 700 !important;">FRITZWAGNER.NEAR</strong>
    </span>

    <img class="bg-image" src="@/assets/sources/images/successfuly.png" alt="success image">

    <section id="tx-successfuly-content">
      <v-card class="detail-card card-outline px-4 py-5" style="--bg: #fff">
        <h6>DETALLES DE LA TRANSACCIÓN</h6>

        <span>TXID:_BF3dECdLue1zZemMoQX5MSZ4h3cKAMsXvjgdbyTEMgSu</span>
        <span>Monto: 10 USDT</span>
        <span>DESTINO: FRITZWAGNER.NEAR</span>
        <span class="d-flex align-center justify-space-between" style="gap: 10px">
          Fecha: 24/05/2024 - 09:51 AM

          <v-btn
            icon
            min-height="22"
            height="22"
            width="22"
          >
            <img src="@/assets/sources/icons/copy-icon.svg" alt="copy icon" style="width: 15px">
          </v-btn>
        </span>
      </v-card>

      <v-btn class="btn">
        IR A LA BIBLIOTECA
      </v-btn>

      <v-btn class="btn-outlined">
        REVISAR LA TRANSACCIÓN
      </v-btn>
    </section>
  </div>
</template>

<script>
export default {
  name: "TxSuccessfuly",
  layout: "auth-layout",
  data() {
    return {
    }
  },
  head() {
    const title = 'Transaction success';
    return {
      title,
    }
  },
};
</script>

<style src="~/assets/styles/pages/tx-successfuly.scss" lang="scss" />
