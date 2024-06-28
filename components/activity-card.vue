<template>
  <div id="activity-card">
    <a style="display: flex; gap: var(--gap)" :href="getLinkHash()" target="_blank">
      <img :src="matchingType.icon" :alt="`${type} icon`">

      <div class="divcol">
        <span>{{matchingType.title}} <!--{{coin ? ` ${coin}` : ''}} --></span>
        <span>{{matchingType.text}} 
          <span style="--fw: 700; color: black !important">{{account}}</span>
        </span>
        <span v-if="!text2" style="color: black !important">{{matchingType.text2}} 
          <span style="--fw: 700; color: black !important">{{text2}}</span>
        </span>
      </div>
    </a>

    <div class="divcol">
      <span style="color: var(--primary)">{{amount}} {{coin}}</span>
      <span style="text-align: right">{{date}} atrás</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActivityCard",
  props: {
    type: {
      type: String,
      default: undefined
    },
    desc: {
      type: String,
      default: undefined
    },
    account: {
      type: String,
      default: undefined
    },
    coin: {
      type: String,
      default: undefined
    },
    date: {
      type: String,
      default: undefined
    },
    amount: {
      type: String,
      default: undefined
    },
    text2: {
      type: String,
      default: undefined
    },
    hash: {
      type: String,
      default: undefined
    },
  },
  data() {
    return {
      linkHash: undefined,
      types: {
        "receive": {
          icon: require("@/assets/sources/operations/icon-recieved.svg"),
          title: "pago recibido",
          text: "Desde: ",
          text2: "",
        },
        "sent": {
          icon: require("@/assets/sources/operations/icon-sent.svg"),
          title: "pago enviado",
          text: "Para: ",
          text2: "",
        },
        "access": {
          icon: require("@/assets/sources/operations/icon-access-key.svg"),
          title: "llave de acceso",
          text: "Para: ",
          text2: "",
        },
        "account": {
          icon: require("@/assets/sources/operations/icon-new-account.svg"),
          title: "creacion de cuenta",
          text: "Cuenta",
          text2: "",
        },
        "function": {
          icon: require("@/assets/sources/operations/icon-function.svg"),
          title: "Llamada de función",
          text: "Desde: ",
          text2: "Metodo: ",
        },
        "p2p": {
          icon: require("@/assets/sources/operations/icon-new-account.svg"),
          title: this.desc,
          text: "Cambio con: ",
          text2: this.text2,
        },
        "batch": {
          icon: require("@/assets/sources/operations/icon-batch.svg"),
          title: "batch transactions",
          text: "Acciones realizadas: ",
          text2: "",
        },
      }
    }
  },
  computed: {
    matchingType() {
      return this.types[this.type]
    }
  },
  mounted() {
  },
  methods: {
    getLinkHash() {
      return process.env.URL_EXPLORER_TXS + this.hash
    },
  }
};
</script>

<style lang="scss">
#activity-card {
  --gap: 17px;

  display: flex;
  justify-content: space-between;
  gap: var(--gap);

  .divcol {
    justify-content: center;
  }

  img {
    --size: 40px;
    width: var(--size) !important;
    height: var(--size) !important;
    object-fit: cover;
  }

  span:first-of-type:not(span > span) {
    --fw: 700;
    color: var(--text2);
    font-family: var(--font2) !important;
    font-size: 12px !important;
    line-height: 1;
    text-transform: uppercase;
  }

  span + span {
    --fw: 500;
    color: var(--text2);
    font-family: var(--font2) !important;
    line-height: 1;
    font-size: 10px !important;
  }
}
</style>
