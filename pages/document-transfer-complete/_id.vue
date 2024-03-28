<template>
  <div id="document-transfer-complete">
    <Header
      top-text="TRANSFERENCIA"
      top-text-dir="ltr"
      middle-text="NFT"
      middle-text-center
      bottom-text="COMPLETADA"
      bottom-text-dir="rtl"
    >
      <template #prepend>
        <v-btn class="btn-icon ml-auto" @click="$router.replace('/')">
          <v-icon size="18" style="translate: 1px 0;">mdi-close</v-icon>
        </v-btn>
      </template>
    </Header>
    

    <div class="d-flex flex-column" style="gap: 20px; margin-top: 20px;">
      <p class="mb-0" style="text-transform: none !important;">
        La transferencia NFT se completó con éxito.
      </p>

      <v-card class="btn-outlined">
        <h6 class="mb-0">INFORMACIÓN DE LA TRANSACCIÓN</h6>
        
        <aside
          v-for="(item, i) in contractInfo" :key="i"
          class="d-flex align-center justify-space-between flex-wrap mt-3"
          style="gap: 10px;"
        >
          <p class="mb-0 bold">{{ item.field }}</p>

          <div class="d-flex align-center ml-auto" style="gap: 10px;">
            
            <a v-if="item.field === 'Link Explorer:'" class="mb-0" :href="item.linkText" target="_blank">{{ limitStr(item.linkText, 43) }}</a>
            <p v-else class="mb-0">{{ item.linkText }}</p>

            <v-btn
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
export default {
  name: "DocumentDetailsPage",
  data() {
    return {
      hash: this.$route.query.hash,
      contractInfo: [
        // {
        //   field: "TX ID:",
        //   linkText: "x.paras-near"
        // },
        // {
        //   field: "Link:",
        //   linkText: "http://ips.fleek.co..."
        // },
      ],
    }
  },
  head() {
    const title = 'Documento detalle';
    return {
      title,
    }
  },
  mounted() {
    if (!this.hash) {
      this.$router.push({ path: '/404' })
    }

    // https://testnet.nearblocks.io/es/txns/GkqGroQz2cYLHATog2qmm7gobPZGTbYAtPqH5YeUVHEr#

    this.contractInfo = [
      {
        field: "TX ID:",
        linkText: this.hash,
        copie: false
      },
      {
        field: "Link Explorer:",
        linkText: this.getLinkHash(),
        copie: false
      }
    ]
  },
  methods: {
    limitStr(item, num) {
      if (item) {
        if (item.length > num) {
          return item.substring(0, num) + "..."
        }
      }
      return item
    },
    getLinkHash() {
      return process.env.URL_EXPLORER_TXS + this.hash
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

<style src="@/assets/styles/pages/document-transfer-complete.scss" lang="scss"></style>
