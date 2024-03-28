<template>
  <v-footer id="footer" absolute color="transparent" :style="`--dir: ${dir}`">
    <slot />
  </v-footer>
</template>

<script>
export default {
  name: "FooterComponent",
  props: {
    dir: {
      type: String,
      default: 'column'
    }
  }
}
</script>

<style lang="scss">
#footer {
  flex-direction: var(--dir);
  padding-bottom: 50px;
  padding-inline: var(--margin-global) !important;
  justify-content: center;
  align-items: center;
}
</style>
