<template>
  <div id="document-details">
    <Header></Header>


    <aside id="document-details-header" class="mb-6">
      <v-img-load
        :src="nft.media"
        rounded="50%"
        sizes="246"
        border="2px solid white"
        class="mb-3"
      ></v-img-load>

      <h6 class="mb-0 bold">#{{ nft.tokenId }} - {{ nft.title }}</h6>
      <span>De: {{ nft.contractId }}</span>
    </aside>

    <v-card class="btn-outlined">
      <h6>DESCRIPCIÓN</h6>
      <p class="mb-0">
        {{ nft.description }}
      </p>
    </v-card>
    
    <v-card class="btn-outlined">
      <aside
        v-for="(item, i) in nft.contractInfo"
        :key="i"
        class="d-flex align-center justify-space-between flex-wrap mt-3"
        style="gap: 10px;"
      >
        <template v-if="item.value || item.linkText">
          <p class="mb-0 bold">{{ item.field }}</p>

          <div class="d-flex align-center ml-auto" style="gap: 10px;">
            <p class="mb-0">{{ item.value || item.linkText.substring(0, 30) }}</p>

            <v-btn
              v-if="!item.value"
              class="btn-icon"
              style="--bg: var(--primary); --size: 29px"
              @click="fnCopie(item.linkText, item)"
            >
              <v-icon v-if="item.copie">mdi-check</v-icon>
              <img v-if="!item.copie" src="@/assets/sources/icons/copy.svg" alt="copy to clipboard" style="--w: 15px">
            </v-btn>
          </div>
        </template>
      </aside>
    </v-card>

    <v-btn class="btn" @click="$router.push({ path: '/document-transfer', query: { contract: $route.query.contract, token_id: $route.query.token_id } })">
      TRANSFERIR
    </v-btn>
  </div>
</template>

<script>
import walletUtils from '@/services/wallet';

export default {
  name: "DocumentDetailsPage",
  data() {
    return {
      tokenId: this.$route.query.token_id,
      contractId: this.$route.query.contract,
      copie: false,
      nft: {}
    }
  },
  head() {
    const title = 'Documento detalle';
    return {
      title,
    }
  },
  mounted() {
    if (!this.tokenId || !this.contractId) {
      this.$router.push({ path: '/404' })
    }

    this.getDataNft()
  },
  methods: {
    fnCopie(copy, item) {
      item.copie = true
      navigator.clipboard.writeText(copy);
      const timer = setInterval(() => {
        item.copie = false;
        clearInterval(timer)
      }, 1000);
    },
    async getDataNft () {
      const wallet = localStorage.getItem('address')
        if (!wallet) {
          return
        }
      const nftData = await walletUtils.getNfts(wallet);
      const filteredData = nftData.filter(item => item.token_id === this.tokenId);
      // console.log(filteredData)
      this.nft = {
        tokenId: filteredData[0].token_id,
        title: filteredData[0].title,
        description: filteredData[0].description, // nftData.metadata.description,
        media: filteredData[0].nft_contract[0].base_uri ? filteredData[0].nft_contract[0].base_uri + '/' + filteredData[0].media : filteredData[0].media, // this.buildMediaUrl(nftData.metadata.media, metadata.base_uri),
        royalty: filteredData[0].title, // nftData.royalty,
        ownerId: filteredData[0].owner, // nftData.owner_id,
        contractId: filteredData[0].nft_contract_id, // this.contractId,
        contractInfo: [
          {
            field: "Royalty",
            value: "1%",
          },
          {
            field: "Dirección",
            linkText: filteredData[0].nft_contract_id,
            copie: false
          },
          {
            field: "Nombre",
            linkText: filteredData[0].title, // metadata.name,
            copie: false
          },
          {
            field: "Enlace a la imagen",
            linkText: filteredData[0].nft_contract[0].base_uri ? filteredData[0].nft_contract[0].base_uri + '/' + filteredData[0].media : filteredData[0].media, // metadata.base_uri,
            copie: false
          },
        ],
      }
    },
    buildMediaUrl (media, baseUri) {
      if (media.includes('://') || media.startsWith('data:image')) {
          return media;
      }

      if (baseUri) {
          return `${baseUri}/${media}`;
      }

      return `https://cloudflare-ipfs.com/ipfs/${media}`;
    },
  },
}
</script>

<style src="@/assets/styles/pages/document-details.scss" lang="scss"></style>
