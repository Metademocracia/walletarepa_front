<template>
  <div class="v-img-ring">
    <svg :width="sizes" :height="sizes" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="34.5" cy="34.5" r="20.7" :fill="color"/>
      <circle cx="34.5" cy="34.4999" r="26.5692" :stroke="color"/>
      <circle cx="34.5" cy="34.5" r="34" :stroke="color"/>
    </svg>

    <v-img
      :src="src"
      :alt="alt"
      :aspect-ratio="aspectRatio"
      :content-class="contentClass"
      :cover="cover"
      :eager="eager"
      :gradient="gradient"
      :height="`calc(${sizes} / 1.59)`"
      :width="`calc(${sizes} / 1.59)`"
      :max-height="`calc(${sizes} / 1.59)`"
      :max-width="`calc(${sizes} / 1.59)`"
      :options="options"
      :transition="transition"
      :inline="inline"
      :lazy-src="lazySrc"
      class="v-img-load"
      :style="`
        --border: ${border};
        --box-shadow: ${boxShadow};
        --background-color: ${color};
      `"
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
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "#fff",
    },
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
  },
  data() {
    return {
      reducedSize: "60px",
    }
  }
}
</script>

<style lang="scss">
.v-img-ring {
  position: relative;
  width: max-content;

  .v-img-load {
    position: absolute;
    inset: 0;
    margin: auto;
    transform: translateY(-2px) !important;

    .v-image__image {
      border-radius: 50% !important;
      border: var(--border, none) !important;
      box-shadow: var(--box-shadow, none);
      background-color: var(--background-color);
    }

    .v-image__placeholder .v-skeleton-loader__bone {
      border-radius: 50% !important;
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
}
</style>
