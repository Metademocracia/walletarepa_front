<template>
  <div id="explore">
    <Header
      show-append
      top-text="EXPLORAR"
      top-text-dir="rtl"
      description="PROYECTOS TENDENCIA"
      description-align="left"
    ></Header>

    <!-- trending-project -->
    <section id="trending-project">
      <div
        v-for="(item, i) in dataTrending" :key="i"
        class="d-flex flex-column align-center"
        style="gap: 17px;"
      >
        <v-img-ring
          :src="item.img"
          :alt="`${item.name}'s project`"
          :color="item.color"
          sizes="69px"
        />

        <span>{{ item.name }}</span>
      </div>
    </section>


    <!-- explore__actions -->
    <aside id="explore__actions" class="d-flex flex-column" style="gap: 15px; margin-block: 23px">
      <v-btn class="btn">
        RECARGA TU BILLETERA
      </v-btn>

      <div class="d-flex" style="gap: 13px">
        <v-select
          v-model="selectedFilter"
          :items="filters"
          hide-details solo
          :class="{active: selectedFilter}"
          :menu-props="{ offsetY: true }"
        ></v-select>

        <v-btn class="btn-outlined">
          TODOS
        </v-btn>
      </div>
    </aside>


    <!-- explore__cards -->
    <section id="explore__cards">
      <v-card
        v-for="(item, i) in dataCards" :key="i"
        class="explore-card"
      >
        <aside class="explore-card-tag">{{ item.tag }}</aside>

        <v-img-ring
          :src="item.img"
          :color="item.color"
          :alt="`${item.name}'s project`"
          sizes="33px"
        />

        <h5>{{ item.name }}</h5>

        <p class="mb-0">{{ item.description }}</p>
      </v-card>
    </section>
  </div>
</template>

<script>
export default {
  name: "ExplorePage",
  layout: "default-variant",
  middleware: ["authenticated"],
  data() {
    return {
      selectedFilter: "",
      filters: [
        "exchange", "otro"
      ],
      dataTrending: [
        {
          img: require("@/assets/sources/logos/metademocracia.svg"),
          name: "METADEMOCRACIA",
          color: "#ffff"
        },
        {
          img: require("@/assets/sources/logos/ref-finance.svg"),
          name: "REF FINANCE",
          color: "#000"
        },
        {
          img: require("@/assets/sources/logos/paras.svg"),
          name: "PARAS",
          color: "#0100BE"
        },
        {
          img: require("@/assets/sources/logos/burrow.svg"),
          name: "BURROW",
          color: "#594A42"
        },
        {
          img: require("@/assets/sources/logos/meta-pool.svg"),
          name: "META POOL",
          color: "#745DE9"
        },
        {
          img: require("@/assets/sources/logos/astro-dao.svg"),
          name: "ASTRO DAO",
          color: "#5F3BC8"
        },
        {
          img: require("@/assets/sources/logos/rainbow-bridge.svg"),
          name: "RAINBOW BRIDGE",
          color: "#fff"
        },
      ],
      dataCards: [
        {
          tag: "AMM DEX",
          img: require("@/assets/sources/logos/ref-finance.svg"),
          name: "REF FINANCE",
          color: "#000",
          description: "Plataforma DeFi multipropósito construida sobre el protocolo NEAR",
        },
        {
          tag: "Cross-chain Bridge",
          img: require("@/assets/sources/logos/rainbow-bridge.svg"),
          name: "RAINBOW BRIDGE",
          color: "#fff",
          description: "Transferir tokens entre Ethereum y NEAR",
        },
        {
          tag: "AMM DEX",
          img: require("@/assets/sources/logos/ref-finance.svg"),
          name: "REF FINANCE",
          color: "#000",
          description: "Plataforma DeFi multipropósito construida sobre el protocolo NEAR",
        },
        {
          tag: "Cross-chain Bridge",
          img: require("@/assets/sources/logos/rainbow-bridge.svg"),
          name: "RAINBOW BRIDGE",
          color: "#fff",
          description: "Transferir tokens entre Ethereum y NEAR",
        },
        {
          tag: "AMM DEX",
          img: require("@/assets/sources/logos/ref-finance.svg"),
          name: "REF FINANCE",
          color: "#000",
          description: "Plataforma DeFi multipropósito construida sobre el protocolo NEAR",
        },
        {
          tag: "Cross-chain Bridge",
          img: require("@/assets/sources/logos/rainbow-bridge.svg"),
          name: "RAINBOW BRIDGE",
          color: "#fff",
          description: "Transferir tokens entre Ethereum y NEAR",
        },
      ]
    }
  },
  head() {
    const title = 'Explore';
    return {
      title,
    }
  },
}
</script>

<style src="@/assets/styles/pages/explore.scss" lang="scss"></style>