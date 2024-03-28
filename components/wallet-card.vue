<template>
  <v-card
    v-ripple="clickable"
    class="wallet-card btn-outlined space"
    :class="{ active: active, disabled: disabled }"
    style="padding: 0 8px 0 18px; gap: 11px;"
    :style="`cursor: ${clickable ? '' : 'default'}`"
    @click="$emit('click')"
  >
    <aside
      class="space flex-grow-1 flex-wrap"
      :class="{'collapsed': collapsed}"
      style="row-gap: 5px; column-gap: 10px"
    >
      <h5 class="mb-0">{{ shortenAddress(wallet) }}</h5>

      <p v-if="show" class="mb-0">{{ pass }}</p>

      <div v-else class="container-dots">
        <span v-for="n in 7" :key="n" />
      </div>
    </aside>

    <aside class="d-flex" style="gap: 6px;">
      <v-btn
        class="btn-icon"
        v-clipboard:copy="wallet"
        @click.stop
      >
        <img src="@/assets/sources/icons/copy.svg" alt="copy to clipboard">
      </v-btn>

      <v-btn 
        class="btn-icon"
        style="--bg: var(--secondary);
        --b: 1px solid var(--primary);"
        @click.stop="showbalance(wallet)"
      >
        <img src="@/assets/sources/icons/eye-off.svg" alt="hide password">
      </v-btn>
    </aside>
  </v-card>
</template>

<script>
import utils from '~/services/utils';

export default {
  name: "WalletCard",
  props: {
    wallet: {
      type: String,
      default: undefined
    },
    pass: {
      type: String,
      default: undefined
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    shortenAddress(address) {
      return utils.shortenAddress(address);
    },
    showbalance(wallet) {
      console.log(wallet)
    }
  }
}
</script>

<style lang="scss">
.wallet-card {

  aside.collapsed {
    flex-direction: column;
    align-items: flex-start;
  }

  aside:first-child {

    h5 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    p {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  p {
    --fw: 500;
    --fs: 10px;
    color: #000;
    font-family: var(--font2);
    line-height: normal;
    text-transform: none !important;
  }

  .container-dots {
    --size: 3.3px;

    display: flex;
    gap: var(--size);

    span {
      width: var(--size);
      height: var(--size);
      border-radius: 100%;
      background-color: var(--primary);
    }
  }

  .v-btn {
    --size: 29px;
    img { width: 15px }
  }

  
  &.active { --b-color: var(--primary) }

  &.disabled {
    --b-color: #D9D9D9;

    .v-btn { border-color: #D9D9D9 }

    .container-dots span { background-color: #7C7B7F }
  }
}
</style>
