<template>
  <v-dialog
    v-model="model"
    fullscreen
    :overlay-opacity=".9"
    content-class="modal-tx-type"
  >
    <img src="~/assets/sources/images/circle.svg" alt="background" class="modal-tx-type-background">

    <section class="modal-tx-type__wrapper">
      <Header
        top-text="SELECCIONAR"
        middle-text="TIPO DE"
        middle-text-center
        bottom-text="TRANSACCIÓN"
        max-width="314px"
        :on-press-back-btn="() => model = false"
      ></Header>

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
            v-for="(item, i) in dataTxTypes" :key="i"
            color="transparent"
            class="cryptos-card-coin space"
            @click="onSelected(item)"
          >
            <div class="center" style="gap: 14px;">
              <v-img-load
                :src="item.icon"
                :alt="`${item.title}s' coin`"
                sizes="29px"
                cover
              />

              <h5 class="mb-0" style="text-transform: uppercase;">{{ item.title }}</h5>
            </div>
          </v-card>
        </div>
      </v-card>
    </section>
  </v-dialog>
</template>

<script>
export default {
  name: "ModalTxTypes",
  data() {
    return {
      model: false,
      loading: false,
      dataTxTypes: [
        {
          icon: require("@/assets/sources/operations/icon-recieved-color.svg"),
          title: "Recepción de fondos",
          value: "recibo"
        },
        {
          icon: require("@/assets/sources/operations/icon-sent-color.svg"),
          title: "Envio de fondos",
          value: "envio"
        },
        {
          icon: require("@/assets/sources/operations/icon-access-key-color.svg"),
          title: "Firma en metademocracia",
          value: "metademocracia"
        },
        /* {
          icon: require("@/assets/sources/operations/icon-new-account-color.svg"),
          title: "Cración de billetera",
        }, */
        {
          icon: require("@/assets/sources/operations/icon-swap-color.svg"),
          title: "intercambio P2P",
          value: "p2p"
        },
        {
          icon: require("@/assets/sources/operations/icon-all-color.svg"),
          title: "Todas (cualquiera)",
          value: "all",
        },
      ],
    }
  },

  methods: {
    onSelected(item) {
      this.model = false;
      this.$emit('on-selected-type', item)
    }
  },

}
</script>

<style lang="scss">
.modal-tx-type {
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
