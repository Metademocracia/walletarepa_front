<template>
  <v-dialog
    v-model="model"
    fullscreen
    :content-class="`modal-warning ${contentClass}`"
    :activator="activator"
  >
    <v-card class="d-flex flex-column">
      <Header class="top-bar">
        <template #prepend>
          <v-btn class="btn-icon-shadow ml-auto" style="--bg: #fff" :disabled="btnLoading" @click="model = false">
            <v-icon size="18" style="translate: 1px 0;" color="var(--primary)">mdi-close</v-icon>
          </v-btn>
        </template>
      </Header>

      <v-card-text class="d-flex flex-column justify-center">
        <img src="../../assets/sources/icons/info-white.svg" alt="info icon" class="mb-8 mx-auto" style="width: 76px">

        <p class="mb-0">{{ text }}</p>
        <slot />

        <slot name="action">
          <v-btn class="btn-outlined-2 mt-6" :loading="btnLoading" @click="$emit('click'); btnLoading = true">
            ACEPTAR
          </v-btn>
        </slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ModalWarning",
  props: {
    activator: {
      type: String,
      default: undefined,
    },
    text: {
      type: String,
      default: '',
    },
    contentClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      btnLoading: false,
      model: false,
    }
  }
}
</script>

<style lang="scss">
.modal-warning .v-card {
  height: 100dvh;
  // color: #706a67;
  // color: #8f8b85;
  background: radial-gradient(50% 50% at 60.82% 40.45%, #8f8b85 50%, #706a67 100%);

  p {
    --c: #fff;
    --fw: 500;
    font-family: var(--font2);
    font-size: 10px;
  }

  .top-bar {
    @include parent;
    padding-inline: var(--margin-global);
  }

  .v-card__text {
    @include parent;
    padding-inline: var(--margin-global);

    height: 100%;
  }
}
</style>
