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
        :text="account.address"
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

        <h5 class="text-center mt-8" style="">
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
        </v-btn>

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
      tokenImg: require('@/assets/sources/logos/near-icon.svg'),
      tokenSymbol: "NEAR",
    }
  },
  head() {
    const title = 'Send QR';
    return {
      title,
    }
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

    test(dataUrl, id) {
      console.log(dataUrl, id)
    }
  }
}
</script>

<style src="@/assets/styles/pages/send-qr.scss" lang="scss"></style>
