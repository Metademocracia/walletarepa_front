<template>
  <div id="swap-error">
    <Header
      top-text="TRANSACCIÓN"
      top-text-dir="ltr"
      bottom-text="RECHAZADA"
      bottom-text-dir="rtl"
      max-width="306px"
    >
      <template #prepend>
        <v-btn class="btn-icon ml-auto" @click="$router.replace('/')">
          <v-icon size="18" style="translate: 1px 0;">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>
    

    <div class="d-flex flex-column" style="gap: 20px; margin-top: 20px;">
      <p class="mb-0" style="text-transform: none !important;">
        Ha ocurrido un error:
      </p>

      <v-card class="btn-outlined">
        <h6 class="mb-0">INFO</h6>
        
        <aside
          class="d-flex align-center justify-space-between mt-3"
          style="gap: 10px;"
        >
          <p class="mb-0 bold">Tx ID:</p>

          <div class="d-flex align-center ml-auto" style="gap: 10px;">
          
            <a class="mb-0 ellipsis-text" href="" target="_blank">xparas.near</a>

            <v-btn
              class="btn-icon"
              style="--bg: var(--primary); --size: 29px"
              @click="fnCopie('asdasd')"
            >
              <v-icon v-if="copie">mdi-check</v-icon>
              <img v-if="!copie" src="@/assets/sources/icons/copy.svg" alt="copy to clipboard" style="--w: 15px">
            </v-btn>
          </div>
        </aside>

        <p class="mt-4">Slippage bla bla bla</p>

        <p class="mb-0 mt-6">
          <strong class="bold mr-2">Sugerencia:</strong>
          Volver a intentar / Tener al menos 0.25 NEAR
        </p>
      </v-card>
    </div>

    <v-btn class="btn" @click="$router.replace('/')">
      VOLVER A LA BILLETERA
    </v-btn>
  </div>
</template>

<script>
import * as cryptoJS from 'crypto-js';

export default {
  name: "DocumentDetailsPage",
  data() {
    return {
      data: this.$route.query.data,
      copie: false,
      contractInfo: [],
      assets: {
        usdt: require('../../assets/sources/tokens/usdt.svg'),
        near: require('../../assets/sources/logos/near-icon.svg')
      }
    }
  },
  head() {
    const title = 'Documento detalle';
    return {
      title,
    }
  },
  mounted() {

    const dataTxItem = this.decrypt(this.data, "123456")

    const dataTx = JSON.parse(dataTxItem)

    console.log("dataTx", dataTx)

    const contractInfo = []

    for (const hash of dataTx.hashes) {
      contractInfo.push({
        field: `TX ID (${hash.method}):`,
        linkText: hash.hash,
        link: this.getLinkHash(hash.hash),
        copie: false
      })
    }

    contractInfo.push(
      {
        field: "Entregado:",
        value: dataTx.amount,
        coin: dataTx.from,
      },
      {
        field: "Recibido:",
        value: dataTx.receive,
        coin: dataTx.to,
      },
      // {
      //   field: "Comisiones:",
      //   value: "123",
      //   coin: "near",
      // },
    )
    console.log("contractInfo", contractInfo)

    // https://testnet.nearblocks.io/es/txns/GkqGroQz2cYLHATog2qmm7gobPZGTbYAtPqH5YeUVHEr#

    this.contractInfo = contractInfo
  },
  methods: {
    decrypt(text, secret) {
      try {
        const bytes  = cryptoJS.AES.decrypt(text, secret);
        const originalText = bytes.toString(cryptoJS.enc.Utf8);
        const data = JSON.parse(originalText);
        return data.text
      } catch (error) {
        return null
      }
    },
    limitStr(item, num) {
      if (item) {
        if (item.length > num) {
          return item.substring(0, num) + "..."
        }
      }
      return item
    },
    getLinkHash(hash) {
      return process.env.URL_EXPLORER_TXS + hash
    },
    fnCopie(copy) {
      this.copie = true
      navigator.clipboard.writeText(copy);
      const timer = setInterval(() => {
        this.copie = false;
        clearInterval(timer)
      }, 1000);
    },
  },
}
</script>

<style src="@/assets/styles/pages/swap-complete.scss" lang="scss"></style>
