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

    <span class="text-center" style="font-weight: 500 !important;">
      ENVIASTE <strong style="font-weight: 700 !important;">{{ attachedDeposit }} <span>{{ token.toUpperCase() }}</span></strong>
      <br>A <strong style="font-weight: 700 !important;">{{ to.toUpperCase() }}</strong>
    </span>

    <img class="bg-image" src="@/assets/sources/images/successfuly.png" alt="success image">

    <section id="tx-successfuly-content">
      <v-card class="detail-card card-outline px-4 py-5" style="--bg: #fff">
        <h6>DETALLES DE LA TRANSACCIÓN</h6>

        <span>TXID: {{ hash }}</span>
        <span>Monto: {{ attachedDeposit }} {{ token.toUpperCase() }}</span>
        <span>DESTINO: {{ to.toUpperCase() }}</span>
        <span class="d-flex align-center justify-space-between" style="gap: 10px">
          Fecha: {{ formattedDate }}
          <!-- <v-btn icon min-height="22" height="22" width="22">
            <img src="@/assets/sources/icons/copy-icon.svg" alt="copy icon" style="width: 15px">
          </v-btn> -->
        </span>
      </v-card>

      <v-btn class="btn" @click="$router.push('/')">
        IR A LA BIBLIOTECA
      </v-btn>

      <v-btn class="btn-outlined" :href="hashUrl" target="_blank">
        REVISAR LA TRANSACCIÓN
      </v-btn>
    </section>
  </div>
</template>

<script>
import moment from 'moment-timezone';

export default {
  name: "TxSuccessfuly",
  layout: "auth-layout",
  data() {
    return {
      to: '',
      token: null,
      attachedDeposit: 0,
      formattedDate: '',
      hash: '',
      hashUrl: ''
    }
  },
  head() {
    const title = 'Transaction success';
    return {
      title,
    }
  },
  mounted() {
    // Create the date in the specific format and timezone
    const date = moment.tz(new Date(), "America/Caracas").format("DD/MM/YYYY HH:mm");
    this.formattedDate = date;

    // Retrieve the item from localStorage
    const jsonString = localStorage.getItem("send-json");
    if (jsonString) {
      // Parse the JSON string back into an object
      const jsonObj = JSON.parse(jsonString);
      // Access the 'symbol' property within 'dataToken'
      const dataTokenSymbol = jsonObj.dataToken.symbol === undefined ? jsonObj.dataToken : jsonObj.dataToken.symbol;
      // Access the 'amount'
      const amount = jsonObj.amount;
      // Set data properties
      this.token = dataTokenSymbol;
      this.attachedDeposit = amount;
      this.to = localStorage.getItem('send-to');
    } else {
      this.$router.push('/')
    }

    // Retrieve the item from localStorage
    const jsonString1 = localStorage.getItem("send-result");
    if (jsonString1) {
      // Parse the JSON string back into an object
      const jsonObj1 = JSON.parse(jsonString1);
      this.hash = jsonObj1.hash;
      this.hashUrl = jsonObj1.hashUrl;
    }
  },
};
</script>

<style src="~/assets/styles/pages/tx-successfuly.scss" lang="scss" />
