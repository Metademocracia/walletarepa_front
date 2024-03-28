<template>
  <v-img
    :src="src"
    :alt="alt"
    :aspect-ratio="aspectRatio"
    :content-class="contentClass"
    :cover="cover"
    :eager="eager"
    :gradient="gradient"
    :height="sizes ?? height"
    :max-height="maxHeight"
    :max-width="maxWidth"
    :min-height="minHeight"
    :min-width="minWidth"
    :width="sizes ?? width"
    :options="options"
    :transition="transition"
    :inline="inline"
    :lazy-src="lazySrc"
    class="v-img-load"
    :style="`
      --border-radius: ${rounded};
      --border: ${border};
      --box-shadow: ${boxShadow};
      --background-color: ${bgColor};
    `"
    @click="$emit('click')"
  >
    <template v-if="!lazySrc" #placeholder>
      <v-skeleton-loader
        :boilerplate="stopLoading"
        :color="colorLoader"
        width="100%"
        height="100%"
      ></v-skeleton-loader>
    </template>
  </v-img>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      default: null,
    },
    aspectRatio: {
      type: Number,
      default: null,
    },
    contentClass: {
      type: String,
      default: null,
    },
    cover: {
      type: Boolean,
      default: false,
    },
    eager: {
      type: Boolean,
      default: null,
    },
    gradient: {
      type: String,
      default: null,
    },
    height: {
      type: [String, Number],
      default: null,
    },
    maxHeight: {
      type: [String, Number],
      default: null,
    },
    maxWidth: {
      type: [String, Number],
      default: null,
    },
    minHeight: {
      type: [String, Number],
      default: null,
    },
    minWidth: {
      type: [String, Number],
      default: null,
    },
    sizes: {
      type: String,
      default: null,
    },
    width: {
      type: String,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
    transition: {
      type: String,
      default: null,
    },
    inline: {
      type: Boolean,
      default: null,
    },
    lazySrc: {
      type: String,
      default: null,
    },
    stopLoading: {
      type: Boolean,
      default: null,
    },
    rounded: {
      type: String,
      default: "initial",
    },
    border: {
      type: String,
      default: "none",
    },
    colorLoader: {
      type: String,
      default: null,
    },
    boxShadow: {
      type: String,
      default: "none",
    },
    bgColor: {
      type: String,
      default: null,
    },
  }
}
</script>

<style lang="scss">
.v-img-load {

  .v-image__image {
    border-radius: var(--border-radius, initial) !important;
    border: var(--border, none) !important;
    box-shadow: var(--box-shadow, none);
    background-color: var(--background-color);
  }

  .v-img__placeholder .v-skeleton-loader__bone {
    $size: 100%;
    width: $size;
    min-width: $size;
    max-width: $size;
    height: $size;
    min-height: $size;
    max-height: $size;
    margin: 0;
  }
}
</style>
