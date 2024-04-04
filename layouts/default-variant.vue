<template>
  <v-app id="default-layout-variant">
    <Alerts ref="alerts" />
    <!-- <ModalConfirmMsg ref="confirmMsg" />
    <ModalConnect ref="connect" /> -->

    <img
      id="default-layout-variant-background"
      :src="require(`~/assets/sources/images/circle${
        bgLogo.includes($route.path) ? '-logotype'
        : excludedBgRoutes.includes(route) ? '-main' : ''
      }.svg`)"
      alt="background"
      :style="`--w: 634px; --top: ${ excludedTopRoutes.includes(route) ? '10px' : '70px'}`"
    >

    <v-main class="parent">
      <nuxt-child data-nuxt="childs" />
    </v-main>

    <Footer v-if="!excludedFooterRoutes.includes(route)" ref="footer">
      <span class="text tcenter" style="--text: var(--text2)">© 2023 Near p2p LLC. reservados todos los derechos.</span>
      <a class="text" style="--fw: 700; color: var(--primary) !important" href="#" target="_blank">
        Términos de política y privacidad del servicio
      </a>
    </Footer>
  </v-app>
</template>

<script>
export default {
  name: "DefaultLayoutVariant",
  middleware: ['lock-password'],
  data() {
    return {
      bgLogo: [
        '/documents'
      ],
      excludedFooterRoutes: [
        '/create-lock-password',
        '/unlock-wallet'
      ],
      excludedTopRoutes: [
        '/sign',
        '/unlock-wallet'
      ],
      excludedBgRoutes: [
        '/unlock-wallet',
      ],
    }
  },
  computed: {
    route() {
      return this.$route.path
    }
  }
}
</script>

<style src="~/assets/styles/layouts/default-layout-variant.scss" lang="scss" />
