<template>
  <v-dialog
    v-model="model"
    fullscreen
    :overlay-opacity=".9"
    content-class="modal-select-token"
  >
    <img src="~/assets/sources/images/circle.svg" alt="background" class="modal-tx-type-background">

    <section class="modal-select-token__wrapper">
      <Header
        top-text="SELECCIONAR"
        top-text-dir="rtl"
        bottom-text="TOKEN"
        bottom-text-dir="ltr"
        max-width="314px"
        :on-press-back-btn="() => model = false"
      ></Header>

      <aside class="d-flex justify-end mb-5">
        <v-text-field
          v-model="search"
          hide-details solo
        >
          <template #append>
            <img src="@/assets/sources/icons/magnify.svg" alt="search icon">
          </template>
        </v-text-field>
      </aside>


      <v-card class="cryptos-card">
        <div
          v-if="loading"
          class="cryptos-card__wrapper"
          style="text-align: center;"
        >
        Cargando....
        </div>
        <div
          v-else
          class="cryptos-card__wrapper"
        >
          <v-card
            v-for="(item, i) in dataTokensFinal" :key="i"
            color="transparent"
            class="cryptos-card-coin space"
            @click="onSelected(item)"
          >
            <div class="center" style="gap: 14px;">
              <v-img-load
                :src="item.icon"
                :alt="`${item.name}s' coin`"
                sizes="29px"
                cover
              />

              <h5 class="mb-0">{{ item.name }}</h5>
            </div>

            <div class="d-flex flex-column">
              <span>{{ item.balance }} {{ item.coin }}</span>
              <span>${{ item.balance_usd }}</span>
            </div>
          </v-card>
        </div>
      </v-card>
    </section>
  </v-dialog>
</template>

<script>
export default {
  name: "ModalCryptos",
  data() {
    return {
      model: false,
      search: '',
      loading: false,
      dataTokensFinal: [
        // // {
        // //   contract: ,
        // //   balance: walletUtils.formatTokenAmount(balance, metadata.decimals, 5),
        // //   name: metadata.name,
        // //   symbol: metadata.symbol,
        // //   decimals: metadata.decimals,
        // //   icon: metadata.icon,
        // //   balance_usd: Number(walletUtils.formatTokenAmount(balance, metadata.decimals, 5)) * Number(price),
        // //   price
        // // }*
        {
          icon: require('@/assets/sources/tokens/btc.svg'),
          coin: "ETH",
          name: "ETHEREUM",
          amount: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/tokens/dai.svg'),
          coin: "ETH",
          name: "ETHEREUM",
          amount: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/tokens/klay.svg'),
          coin: "ETH",
          name: "ETHEREUM",
          amount: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/tokens/matic.svg'),
          coin: "ETH",
          name: "ETHEREUM",
          amount: "59.744",
          balance_usd: "79.379"
        },
        {
          icon: require('@/assets/sources/tokens/shib.svg'),
          coin: "ETH",
          name: "ETHEREUM",
          amount: "59.744",
          balance_usd: "79.379"
        },
      ]
    }
  },
  watch: {
    model(value) {
      if (!value) this.search = ''
    },
    
  },

  mounted() {
  },

  methods: {
    onSelected(item) {
      this.model = false;
      this.$emit('on-selected-coin', item)
    }
  },

}
</script>

<style lang="scss">
.modal-select-token {
  background: center no-repeat url(../../assets/sources/images/background.png);
  background-color: var(--bg-app);
  background-size: cover;

  &-background {
    left: 0;
    right: 0;
    margin: auto;
    position: absolute;
    pointer-events: none;
    z-index: -1;
  }

  &__wrapper {
    margin-inline: auto;
    width: max-content;
  }

  .v-input {
    flex-grow: 1;
    transform-origin: right;
    max-width: 31px !important;

    transition: .3s cubic-bezier(0.86, 0, 0.07, 1);

    &__slot {
      min-height: 31px !important;
      outline: none !important;
    }

    .v-input__append-inner img {
      transform: translateX(-8px);
      transition: transform .3s ease;
    }

    &--is-focused {
      max-width: 100% !important;
      
      .v-input__append-inner img { transform: translateX(0) }
    }
  }


  .cryptos-card {
    --height: 600px;
    --padding-block: 29px;

    width: 317px;
    max-height: var(--height);
    border-radius: 20px;
    border: 1px solid #000;
    background-color: #F6F6F7 !important;
    padding-block: var(--padding-block);
    padding-right: 2px;

    .cryptos-card__wrapper {
      display: flex;
      flex-direction: column;
      scrollbar-gutter: stable;
      max-height: calc(var(--height) - var(--padding-block) * 2);
      padding-left: 10px;
      border-radius: 0 !important;
      overflow-y: auto;
    }

    
    &-coin {
      --padding-inline: 20px;

      padding-inline: var(--padding-inline);
      padding-block: 16px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        margin-inline: auto;
        height: 1px;
        width: calc(100% - var(--padding-inline) * 2);
        background-color: var(--secondary);
      }

      /* &.active {
        background-color: hsl(216 99% 52% / .7) !important;
        &::after { background-color: #333 !important }

        * { color: #fff !important }
      } */
    }

    
    h5 {
      --fw: 700;
      --fs: 12px;
      color: #000;
      font-family: var(--font2);
      line-height: normal;
    }

    span:first-child {
      --fw: 700;
      color: #000;
      text-align: right;
      font-size: 12px;
      font-family: var(--font2);
      line-height: normal;

      + span {
        --fw: 400;
        color: #333;
        text-align: right;
        font-family: var(--font2);
        font-size: 10px;
        line-height: normal;
      }
    }
  }
}
</style>
