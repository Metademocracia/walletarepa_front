<template>
  <v-app id="auth-layout">
    <Alerts ref="alerts" />
    <!-- <ModalConfirmMsg ref="confirmMsg" />
    <ModalConnect ref="connect" /> -->

    <img
      id="auth-layout-background"
      :src="
        require(`~/assets/sources/images/circle${
          route === '/create-import' || route === '/import-wallet' || route === '/create-wallet' ? '-main'
          : route === '/verification' || route === '/verification-login-email'  ? '-person'
          : ''
        }.svg`)
      "
      alt="background"
      :style="`--w: ${excludedRoutes.includes(route) ? 452 : 634}px`"
    >

    <v-main class="parent">
      <nuxt-child data-nuxt="childs" />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "AuthLayout",
  data() {
    return {
      excludedRoutes: [
        "/login",
        "/verification",
      ],
    };
  },
  computed: {
    route() {
      const route = this.$route.path

      if (route.endsWith("/")) {
        if(!sessionStorage.getItem("indexSelect")) return route.slice(0, -1)

        if(sessionStorage.getItem("indexSelect") === "create-import") {
          sessionStorage.removeItem("indexSelect")
          return "/create-import";  
        }
        return route.slice(0, -1);
      }

      return route
    }
  },

  created() {
    /* if (localStorage.getItem('auth')) {
      this.$router.replace('/')
    } */
  },
}
</script>

<style src="~/assets/styles/layouts/auth-layout.scss" lang="scss" />
