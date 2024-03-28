<template>
  <div>
    <Drawer v-if="showAppend" ref="drawer"></Drawer>
    
    <div class="navbar" color="transparent">
      <slot name="prepend">
        <v-btn :style="`visibility: ${showPrepend ? 'visible' : 'hidden'}`" class="btn-icon" @click="onPressBackBtn ? onPressBackBtn() : $router.go(-1)">
          <img src="~/assets/sources/icons/arrow.svg" alt="go back">
        </v-btn>
      </slot>

      <aside v-if="showAppend" class="container-btns">
        <v-btn v-if="!hideProfile" data-avatar class="btn-icon" to="/account-details">
          <img src="@/assets/sources/avatars/person.png" alt="avatar">
        </v-btn>

        <v-btn class="btn-icon" style="--bg: var(--primary);" @click="showDrawer()">
          <img src="@/assets/sources/icons/options.svg" alt="settings">
        </v-btn>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavbarComponent",
  props: {
    hideProfile: {
      type: Boolean,
      default: false,
    },
    showAppend: {
      type: Boolean,
      default: false,
    },
    showPrepend: {
      type: Boolean,
      default: true,
    },
    onPressBackBtn: {
      type: Function,
      default: undefined
    },
  },
  data() {
    return {
    };
  },
  methods: {
    showDrawer() {
      const el = this.$refs.drawer.$el
      el.style.backgroundColor = 'var(--primary)'
      setTimeout(() => { el.style.backgroundColor = 'var(--bg-app)' }, 300);

      setTimeout(() => { this.$refs.drawer.model = !this.$refs.drawer.model }, 50);
    }
  },
};
</script>

<style src="~/assets/styles/components/navbar.scss" lang="scss" />
