<template>
  <v-form
    ref="formEnvio"
    v-model="validEnvio"
  >
    <div id="document-transfer">
      <modalWarning
        ref="modalWarning"
        text="Vas a transferir un NFT y gastarás XXX cantidad en la tarifa de la red."
        @click="acceptTransfer()"
      ></modalWarning>

      <Header
        top-text="TRANSFERIR"
        top-text-dir="rtl"
        bottom-text="NFT"
        bottom-text-dir="ltr"
        hide-profile
        max-width="283px"
        style="margin-bottom: 20px;"
      ></Header>
      
      
      <aside id="document-transfer-header" class="mb-6">
        <v-img-load
          :src="nft.media"
          rounded="50%"
          sizes="94"
          border="2px solid white"
          class="mb-3"
        ></v-img-load>

        <h6 class="mb-0 bold">
          <img
            :src="require('@/assets/sources/icons/checked.svg')" alt="check"
            class="mr-2" style="width: 16px;">
            #{{ nft.tokenId }} - {{ nft.title }}
        </h6>
        <span>De: {{ nft.contractId }}</span>
      </aside>


      <div class="d-flex flex-column" style="gap: 20px; margin-top: 80px;">
        <p class="mb-0" style="text-transform: none !important;">Ingrese una dirección de destinatario, luego proceda a confirmar su transacción.</p>

        <!-- <v-card class="btn-outlined d-flex justify-space-between" style="gap: 10px;">
          <h6 class="mb-0 bold">SEND TO</h6>
          <h6 class="mb-0 ml-auto">ID ACCOUNT</h6>
        </v-card> -->

        <v-text-field
          v-model="accountNear"
          v-debounce="300"
          placeholder="ID DE CUENTA"
          class="mb-0"
          style="--bg: var(--secondary); --p: 0 15px 0 23px, text-align: right: inherit;" :error-messages="errorAccount"
          :success-messages="successAccount"
          :rules="[required, verificarAccount]"
          solo
        >
          <template #prepend-inner>
            <h6 class="mb-0 bold ml-2" style="color: var(--primary); font: strong;">ENVIAR A</h6>
          </template>
        </v-text-field>

        <div style="gap: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 100px), 1fr))">
          <v-btn class="btn-outlined-2" @click="$router.back()">
            CANCELAR
          </v-btn>

          <v-btn
            class="btn"
            @click="modalTransfer()"
          >
            TRANSFERIR
          </v-btn>
        </div>
      </div>
    </div>
  </v-form>
</template>

<script>
import * as nearAPI from "near-api-js";
import Vue from 'vue';
import { debounce } from 'lodash';
import walletUtils from '@/services/wallet';
// import { configNear } from "@/services/nearConfig";
const { Account } = nearAPI;


Vue.directive('debounce', {
  inserted(el, binding) {
    const delay = parseInt(binding.value) || 300;

    // Debounced function to dispatch 'change' event
    const debouncedChange = debounce(function (event) {
      el.dispatchEvent(new Event('change'));
    }, delay);

    // Debounced function to dispatch 'blur' event
    const debouncedBlur = debounce(function (event) {
      el.dispatchEvent(new Event('blur'));
    }, delay);

    // Attach debounce function to 'change' event
    el.onchange = debouncedChange;

    // Attach debounce function to 'blur' event
    el.onblur = debouncedBlur;
  },
});


export default {
  name: "DocumentTransferPage",
  data() {
    return {
      validEnvio: true,
      tokenId: this.$route.query.token_id,
      contractId: this.$route.query.contract,
      copie: false,
      nft: {},
      accountNear: null,
      required: [(v) => !!v || "Campo requerido" ],
      errorAccount: null,
      successAccount: null,
      contentClass: {
      type: String,
      default: '',
      },
    }
  },
  head() {
    const title = 'Transferir documento';
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
    async acceptTransfer() {
      const wallet = localStorage.getItem('address')

      if (!wallet) {
        return
      }

      const account = await walletUtils.nearConnection();
      const transferTx = await account.functionCall({
        contractId: this.contractId,
        methodName: "nft_transfer",
        args: {
          receiver_id: this.accountNear,
          token_id: this.tokenId,
        },
        attachedDeposit: "1"
      });
      
      if (!(transferTx.status?.SuccessValue === "")) {
        console.error("error al transferir token");
        this.$router.push({path: 'document-details', query: { contract: this.contractId, token_id: this.tokenId }})
      }

      const hash = transferTx.transaction?.hash;

      // console.log("HASH", hash)

      this.$router.push({ path: '/document-transfer-complete', query: { hash } })
    },
    modalTransfer() {
      if(!this.errorAccount && this.successAccount) {
        this.$refs.modalWarning.model = true
      }
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
    async verificarAccount(value) {
      // Reset error message
      this.errorAccount = null;
      let validAccount = false;
      const account = new Account(this.$near.connection, value)
      // Perform account verification
      if (value) {
        // Implement your account verification logic here
        // For example, call an API or perform some checks
        // For now, let's assume the account is valid if it's not empty
        await account.state()
          .then(() => {
            validAccount = true;
          }).catch(() => {
            validAccount = false;
          })
        if (validAccount) {
          this.errorAccount = null; // Clear error message
          this.successAccount = "Usuario válido"; // Set success message
          return true; // Account is valid
        } else {
          this.errorAccount = "Usuario no existe"; // Set error message
          return false; // Account is invalid
        }
      } else {
        this.errorAccount = "Campo requerido"; // Set error message for empty field
        return false; // Account is invalid
      }
    },
  //   async verificarAccount(value) {
  //     this.successAccount = null
  //     this.errorAccount = null
  //     // console.log(this.$near.connection, value)
  //     const account = new Account(this.$near.connection, value)
      
  //     if(value) {
  //       await account.state()
  //         .then(() => {
  //           this.successAccount = "Usuario válido"
  //           this.errorAccount = null; // Clear error message
  //           return true; // Account is valid
  //         }).catch(() => {
  //           this.errorAccount = "Usuario no existe"
  //           return false; // Account is invalid
  //         })
  //     } else {
  //       this.errorAccount = "Campo requerido"
  //       return false; // Account is invalid
  //     }
  //   },
  },
}
</script>

<style src="@/assets/styles/pages/document-transfer.scss" lang="scss"></style>
