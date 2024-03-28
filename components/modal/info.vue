<template>
  <v-dialog
    v-model="model"
    :max-width="maxWidth"
    :content-class="`modal-info ${contentClass}`"
    :activator="activator"
  >
    <v-card class="btn-outlined" style="--br: 30px">
      <v-card-title>
        <slot name="title">
          <div class="space flex-grow-1">
            <h6 class="tcenter mb-0" style="font-weight: 500 !important;">
              {{ title }}
            </h6>
    
            <v-icon @click="model = false">mdi-close-circle</v-icon>
          </div>
        </slot>
      </v-card-title>


      <v-card-text class="pt-3 pr-3" :style="`--max-height: ${maxHeight}`">
        <section>
          <slot />
        </section>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ModalInfo",
  props: {
    activator: {
      type: String,
      default: undefined,
    },
    maxWidth: {
      type: [String, Number],
      default: "450",
    },
    contentClass: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    maxHeight: {
      type: String,
      default: "600px"
    }
  },
  data() {
    return {
      model: false,
    }
  }
}
</script>

<style lang="scss">
.modal-info {
  > .v-card { position: relative }

  .v-card__text > section {
    overflow-y: auto;
    scrollbar-gutter: stable;
    max-height: var(--max-height);
    padding-right: 6px;
  }
}
</style>
