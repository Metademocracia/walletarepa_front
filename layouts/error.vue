<template>
  <v-container id="error-page" fluid class="center divcol">
    <v-row justify="center" align="center">
      <v-col class="tcenter center divcol padd0mobile">
        <!-- content -->
        <h1 class="p bold">{{error.statusCode === 404 ? 404 : 'Error'}}</h1>
        <span class="h5_em bold">{{error.statusCode === 404 ? $t('pageNotFound') : $t('otherError')}}</span>
        <v-btn :to="localePath('/')" class="h7_em bold">{{$t('buttonTitle')}}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "ErrorPage",
  layout: 'auth-layout',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  head() {
    const title =
      this.error.statusCode === 404 ? '404' : this.otherError
    return {
      title,
    }
  },
}
</script>

<style lang="scss">
#error-page {
  height: 100%;
  .col {
    gap: 1em;
    h1 {
      font-size: clamp(9em, 20vw, 22em);
      line-height: 1 !important;
      color: $primary;
      letter-spacing: -7px;
      animation: glitch 1s linear infinite;
      &:is(:before, :after) {
        content: attr(title);
        position: absolute;
        left: 0;
      }
      &:before {
        animation: glitchTop 1s linear infinite;
        clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
        -webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
      }
      &:after{
        animation: glitchBotom 1.5s linear infinite;
        clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
        -webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
      }
    }
    span {line-height: 1 !important}
    .v-btn {
      width: clamp(8em, 20vw, 20em);
      height: clamp(2em, 5vw, 4.75em);
      background: $primary;
      border: 2px solid $primary;
      border-radius: 50.6557px;
      span {
        color: #fff;
      }
    }
  }
}
</style>
