<template>
  <div id="documents">
    <Header 
      show-append
      top-text="NFTS"
      top-text-dir="ltr"
      bottom-text="DOCUMENTOS"
      bottom-text-dir="rtl"
      hide-profile
      style="margin-bottom: 70px;"></Header>


    <aside v-for="(collection, i) in collections" :key="i" class="collection" style="gap: 9px">
      <h6 class="mb-6">COLECCIÓN: {{ i }}</h6>
      <span v-if="collection.length">{{ collection.length }}</span>

      <div>
        <v-img-load 
          v-for="(item, i2) in collection" 
          :key="i2" 
          :src="item.nft_contract[0].base_uri ? item.nft_contract[0].base_uri + '/' + item.media : item.media"
          rounded="50%"
          border="2px solid white" 
          cover class="pointer"
          @click="$router.push({ path: 'document-details', query: { contract: item.nft_contract_id, token_id: item.token_id } })"></v-img-load>
      </div>
    </aside>
  </div>
</template>

<script>
import axios from 'axios';
import walletUtils from '@/services/wallet';

export default {
  name: "DocumentsPage",
  layout: "default-variant",
  data() {
    return {
      collections: [
        // {
        //   name: "APES",
        //   items: [
        //     require('@/assets/sources/avatars/avatar-female.svg'),
        //     require('@/assets/sources/avatars/avatar-female.svg'),
        //     require('@/assets/sources/avatars/avatar-female.svg'),
        //   ]
        // },
        // {
        //   name: "APES2",
        //   items: [
        //     require('@/assets/sources/avatars/avatar-female.svg'),
        //     require('@/assets/sources/avatars/avatar-female.svg'),
        //     require('@/assets/sources/avatars/avatar-female.svg'),
        //   ]
        // }
      ]
    }
  },
  head() {
    const title = 'Documentos';
    return {
      title,
    }
  },
  mounted() {
    this.getNftContractsByAccount()
  },
  beforeUnmount() {
    // Clear session storage when the component is unmounted
    window.addEventListener("beforeunload", () => {
      sessionStorage.clear();
    });
  },
  methods: {
    async getContractIds(wallet) {
      console.log("wallet: ", wallet)
      if (process.env.Network === "mainnet") {
        const serviceUrl = `https://api.fastnear.com/v0/account/${wallet}/nft`;

        const result = await axios.get(serviceUrl);

        return result.data.contract_ids
      } else {
        const serviceUrl = `https://testnet-api.kitwallet.app/account/${wallet}/likelyNFTs`;

        const result = await axios.get(serviceUrl);
        console.log("data: ", result.data)
        return result.data
      }
    },
    async getNftContractsByAccount() {
      try {
          const wallet = localStorage.getItem('address'); // Use sessionStorage instead of localStorage
          if (!wallet) {
              return;
          }
          
          let collections = sessionStorage.getItem('collections'); // Retrieve collections from sessionStorage
          console.log("collections1: ", collections)
          if (!collections) {
              collections = await walletUtils.getNfts(wallet);
              console.log("collections2: ", collections)
              sessionStorage.setItem('collections', JSON.stringify(collections)); // Cache collections in sessionStorage
          } else {
              collections = JSON.parse(collections); // Parse cached collections if available
          }

          const grouped = collections.reduce((acc, item) => {
              const key = item.nft_contract[0].name;
              if (!acc[key]) {
                  acc[key] = [];
              }
              acc[key].push(item);
              return acc;
          }, {});

          this.collections = grouped;
      } catch (error) {
          console.error(error);
      }
    },

    buildMediaUrl(media, baseUri) {
      if (media.includes('://') || media.startsWith('data:image')) {
        return media;
      }

      if (baseUri) {
        return `${baseUri}/${media}`;
      }

      return `https://cloudflare-ipfs.com/ipfs/${media}`;
    },
  }
}
</script>

<style src="@/assets/styles/pages/documents.scss" lang="scss"></style>
