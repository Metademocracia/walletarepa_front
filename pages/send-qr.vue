<template>
  <div id="send-qr" class="d-flex flex-column">
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


    <section class="d-flex flex-column" style="gap: 14px;">
      <div class="d-flex flex-column" style="gap: 6px;">
        <label>ID DE CUENTA</label>
        <v-card
          class="btn-outlined space"
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
      </div>

      <!--<aside class="d-flex" style="gap: 12px">
        <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);" @click="$router.go(-1)">
          CANCELAR
        </v-btn>

        <v-btn class="btn flex-grow-1" to="/send-details">
          CONTINUAR
        </v-btn>
      </aside>-->
    </section>
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
