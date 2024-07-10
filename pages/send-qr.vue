<template>
  <div id="send-qr" class="d-flex flex-column">
    <ModalCryptos
      ref="cryptos"
    ></ModalCryptos>

    <Header
    ></Header>

    <!--<aside class="d-flex" style="gap: 12px; margin-top: 26px;">
      <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);">
        ENVIAR
      </v-btn>

      <v-btn class="btn flex-grow-1">
        RECIBIR
      </v-btn>
    </aside>-->


    <section class="d-flex flex-column" style="height: 248px;">
      <vue-qr
        id="qr-code"
        :text="textQr"
        :bg-src="require('@/assets/sources/images/transparent.png')"
        :logo-src="require('@/assets/sources/logos/logo-qr.svg')"
        :logo-corner-radius="20"
        :correct-level="3"
        :dot-scale=".5"
        :size="500"
        :margin="0"
        :callback="test"
        :components="{
          data: {
            scale: 1,
          },
          timing: {
            scale: 1,
            protectors: false,
          },
          alignment: {
            scale: 1,
            protectors: false,
          },
          cornerAlignment: {
            scale: .9,
            protectors: true,
          },
        }"
      ></vue-qr>
    </section>


    <section class="d-flex flex-column">
      <label>ID DE CUENTA</label>
        <v-card
          class="btn-outlined space mb-3"
          style="--bg: var(--secondary); padding: 0 8px 0 23px;"
        >
          <h5 class="mb-0">{{ account.shortenAddress }}</h5>

          <v-btn
            class="btn-icon"
            style="--bg: var(--primary); --size: 29px"
            @click="fnCopie(account.address)"
          >
            <v-icon v-if="copie">mdi-check</v-icon>
            <img v-if="!copie" src="@/assets/sources/icons/copy.svg" alt="copy to clipboard" style="--w: 15px">
          </v-btn>
        </v-card>

        <v-card class="card-outline px-4 py-2 d-flex align-center" style="--bg: #fff; gap: 10px;">
          <img src="@/assets/sources/icons/warning.svg" alt="warning icon" style="width: 35px">

          <p class="mb-0">
            <strong style="color: var(--primary) !important; font-weight: 700 !important;">NOTA: </strong>
            Esta dirección de billetera es válida para la red de NEAR
          </p>
        </v-card>

        <!--<h5 class="text-center mt-8" style="">
          A CONTINUACIÓN PUEDE<br> PERSONALIZAR LA SOLICITUD DE DEPOSITO
        </h5>

        <v-card
          class="btn-outlined space mb-3"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >
          <h5 class="mb-0">SELECCIONAR TOKEN</h5>
          
          <div class="center" style="gap: 6px;">
            <img :src="tokenImg" alt="near icon" style="width: 29px;">
            <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ tokenSymbol }}</span>
            <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
          </div>
        </v-card>

        <v-text-field
          placeholder="MONTO A RECIBIR" solo
          class="mt-0"
          style="--ls: .15em;"
        ></v-text-field>

        <v-btn
          class="btn flex-grow-1"
          @click="$router.push('/deposit')"
        >
          CREAR SOLICITUD DE PAGO
        </v-btn>-->

      <!--<aside class="d-flex" style="gap: 12px">
        <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);" @click="$router.go(-1)">
          CANCELAR
        </v-btn>

        <v-btn class="btn flex-grow-1" to="/send-details">
          CONTINUAR
        </v-btn>
      </aside>-->
    </section>

    <!-- <img src="@/assets/sources/logos/logotype.svg" alt="logo icon" class="mx-auto mt-16 mb-8" style="width: 200px"> -->

    <v-form ref="form" v-model="validForm">
  
      <ModalCryptos
        ref="cryptos"
        @on-selected-coin="coin => selectToken(coin)"
      ></ModalCryptos>


      <section class="d-flex flex-column" style="height: 208px;">
        <v-text-field
          v-model="amount"
          placeholder="0.0"
          type="number"
          :rules="required"
          required
        ></v-text-field>
      </section>


      <section class="d-flex flex-column" style="gap: 14px;">
        <!--<v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >-->
        <v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >
          <h5 class="mb-0">SELECCIONAR RECURSO</h5>
          
          <div class="center" style="gap: 6px;">
            <img :src="tokenImg" alt="near icon" style="width: 29px;">
            <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ tokenSymbol }}</span>
            <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
          </div>
        </v-card>

        <aside class="d-flex" style="gap: 12px">
          <!--<v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);" @click="$router.go(-1)">
            CANCELAR
          </v-btn> -->

          <v-btn
            class="btn flex-grow-1"
            @click="generarQr()"
          >
            GENERAR QR
          </v-btn>
        </aside>
      </section>
      
    
  </v-form>


  </div>
</template>

<script>
import VueQr from 'vue-qr'
import localStorageUser from '~/services/local-storage-user';

export default {
  name: "SendQrPage",
  components: { VueQr },
  data() {
    return {
      copie: false,
      account: localStorageUser.getCurrentAccount(),
      tokenImg: "data:image/svg+xml,%3Csvg width='111' height='90' viewBox='0 0 111 90' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24.4825 0.862305H88.0496C89.5663 0.862305 90.9675 1.64827 91.7239 2.92338L110.244 34.1419C111.204 35.7609 110.919 37.8043 109.549 39.1171L58.5729 87.9703C56.9216 89.5528 54.2652 89.5528 52.6139 87.9703L1.70699 39.1831C0.305262 37.8398 0.0427812 35.7367 1.07354 34.1077L20.8696 2.82322C21.6406 1.60483 23.0087 0.862305 24.4825 0.862305ZM79.8419 14.8003V23.5597H61.7343V29.6329C74.4518 30.2819 83.9934 32.9475 84.0642 36.1425L84.0638 42.803C83.993 45.998 74.4518 48.6635 61.7343 49.3125V64.2168H49.7105V49.3125C36.9929 48.6635 27.4513 45.998 27.3805 42.803L27.381 36.1425C27.4517 32.9475 36.9929 30.2819 49.7105 29.6329V23.5597H31.6028V14.8003H79.8419ZM55.7224 44.7367C69.2943 44.7367 80.6382 42.4827 83.4143 39.4727C81.0601 36.9202 72.5448 34.9114 61.7343 34.3597V40.7183C59.7966 40.8172 57.7852 40.8693 55.7224 40.8693C53.6595 40.8693 51.6481 40.8172 49.7105 40.7183V34.3597C38.8999 34.9114 30.3846 36.9202 28.0304 39.4727C30.8066 42.4827 42.1504 44.7367 55.7224 44.7367Z' fill='%23009393'/%3E%3C/svg%3E", // require('@/assets/sources/logos/near-icon.svg'),
      tokenSymbol: "USDT",
      validForm: true,
      dataToken: null,
      textQr: "",

    }
  },
  head() {
    const title = 'Send QR';
    return {
      title,
    }
  },

  mounted() {
    this.textQr = this.account.address;
  },

  methods: {
    fnCopie(copy) {
      this.copie = true;
      navigator.clipboard.writeText(copy);
      const timer = setInterval(() => {
        this.copie = false;
        clearInterval(timer)
      }, 1000);
      
    },

    selectToken(token) {
      this.tokenImg = token.icon;
      this.tokenSymbol = token.symbol;
      this.dataToken = token.name !== "NEAR" ? token : null;
    },

    generarQr() {
      if(this.$refs.form.validate()) {
        this.textQr = `${process.env.DOMINIO_WEB}send-confirm?wallet=${this.account.address}&amount=${this.amount}&token=${this.dataToken?.symbol || this.tokenSymbol}`;
        console.log("qr: ", this.textQr)
      }
    },

    test(dataUrl, id) {
      console.log(dataUrl, id)
    }
  }
}
</script>

<style src="@/assets/styles/pages/send-qr.scss" lang="scss"></style>