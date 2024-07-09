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
      ENVIASTE <strong style="font-weight: 700 !important;">{{ attachedDeposit }} <span>{{ token }}</span></strong>
      <br>A <strong style="font-weight: 700 !important;">{{ to.toUpperCase() }}</strong>
    </span>

    <img class="bg-image" src="@/assets/sources/images/successfuly.png" alt="success image">

    <section id="tx-successfuly-content">
      <v-card class="detail-card card-outline px-4 py-5" style="--bg: #fff">
        <h6>DETALLES DE LA TRANSACCIÓN</h6>

        <span>TXID:_BF3dECdLue1zZemMoQX5MSZ4h3cKAMsXvjgdbyTEMgSu</span>
        <span>Monto: {{ attachedDeposit }} {{ token }}</span>
        <span>DESTINO: {{ to.toUpperCase() }}</span>
        <span class="d-flex align-center justify-space-between" style="gap: 10px">
          Fecha: {{ date}}

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

      <v-btn class="btn" @click="router.push('/')">
        IR A LA BIBLIOTECA
      </v-btn>

      <v-btn class="btn-outlined">
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
    }
  },
  head() {
    const title = 'Transaction success';
    return {
      title,
    }
  },
  mounted() {
    // Import moment and moment-timezone
    const moment = require('moment-timezone');
    // Create the date in the specific format and timezone
    const date = moment.tz(new Date(), "DD/MM/YYYY HH:mm", "America/Caracas");
    this.formattedDate = date;
    // Retrieve the item from sessionStorage
    const jsonString = sessionStorage.getItem("send-json");
    // Parse the JSON string back into an object
    const jsonObj = JSON.parse(jsonString);
    // Access the 'name' and 'symbol' properties within 'dataToken'
    // const dataTokenName = jsonObj.dataToken.name;
    const dataTokenSymbol = jsonObj.dataToken.symbol;
    // Access the 'amount'
    const amount = jsonObj.amount;
    // console.log(dataTokenName); // This will log the 'name' value to the console
    // console.log(dataTokenSymbol); // This will log the 'symbol' value to the console
    // console.log(amount); // This will log the 'amount' value to the console
    this.token = dataTokenSymbol;
    this.attachedDeposit = amount;
    this.to = sessionStorage.getItem('send-to');
  },
};
</script>

<style src="~/assets/styles/pages/tx-successfuly.scss" lang="scss" />
