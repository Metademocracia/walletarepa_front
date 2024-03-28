<template>
  <div id="swap-complete">
    <Header
      top-text="INTERCAMBIO"
      top-text-dir="ltr"
      bottom-text="FINALIZADO"
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
        La conversión de tokens se ha realizado con éxito.
      </p>

      <v-card class="btn-outlined">
        <h6 class="mb-0">SWAP INFO</h6>
        
        <aside
          v-for="(item, i) in contractInfo" :key="i"
          class="d-flex align-center justify-space-between flex-wrap mt-3"
          style="gap: 10px;"
        >
          <p class="mb-0 bold">{{ item.field }}</p>

          <div class="d-flex align-center ml-auto" style="gap: 10px; width: 100%;">
          
            <p v-if="item.value" class="mb-0">{{ item.value }}</p>
            <a v-if="item.linkText" class="mb-0 ellipsis-text" :href="item.link" target="_blank">{{ item.linkText }}</a>
            <!-- <p class="mb-0">{{ item.value ?? item.linkText }}</p> -->

            <img
              v-if="item.coin" :src="item.coin"
              :alt="`${item.coin} icon`"
              style="--size: 29px; width: var(--size); height: var(--size)">

            <v-btn
              v-else
              class="btn-icon"
              style="--bg: var(--primary); --size: 29px"
              @click="fnCopie(item.linkText, item)"
            >
              <v-icon v-if="item.copie">mdi-check</v-icon>
              <img v-if="!item.copie" src="@/assets/sources/icons/copy.svg" alt="copy to clipboard" style="--w: 15px">
            </v-btn>
          </div>
        </aside>
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
    if (!this.data) {
      this.$router.push({ path: '/404' })
    }

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
    fnCopie(copy, item) {
      item.copie = true
      navigator.clipboard.writeText(copy);
      const timer = setInterval(() => {
        item.copie = false;
        clearInterval(timer)
      }, 1000);
    },
  },
}
</script>

<style src="@/assets/styles/pages/swap-complete.scss" lang="scss"></style>
