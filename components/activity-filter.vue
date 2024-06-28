<template>
  <nav
    id="activity-filter"
    :class="{ opened: model }"
  >
    <ModalSelectToken
      ref="tokens"
      @on-selected-coin="(item) => token = item"
    ></ModalSelectToken>

    <ModalSelectTxType
      ref="txType"
      @on-selected-type="(item) => txType = item.title"
    ></ModalSelectTxType>

    <img id="activity-filter-background" src="~/assets/sources/images/bg-drawer.svg" alt="background">

    <div id="activity-filter__wrapper">
      <Header
        top-text="FILTRO"
        top-text-center
        :on-press-back-btn="() => model = false"
      ></Header>

      <section class="d-flex flex-column">
        <v-text-field
          v-model="dateRangeText"
          prepend-inner-icon="mdi-calendar"
          readonly solo
          class="picker-header"
        ></v-text-field>

        <v-date-picker
          v-model="dates"
          range
        ></v-date-picker>


        <v-card
          class="btn-outlined space mt-8 mb-3"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.tokens.model = true"
        >
          <h5 class="mb-0">SELECCIONAR TOKEN</h5>



          <div class="center" style="gap: 6px;">
            <img v-if="token?.icon" :src="token.icon" alt="near icon" style="width: 29px;">
            <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ token?.name ?? 'TODOS' }}</span>
            <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
          </div>
        </v-card>

        <v-card
          class="btn-outlined space mb-3"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.txType.model = true"
        >
          <h5 class="mb-0">SELECCIONAR TIPO</h5>
          
          <div class="center" style="gap: 6px;">

            <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ txType ?? 'TODAS' }}</span>
            <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
          </div>
        </v-card>
      </section>

      <v-btn class="btn">
        REVISAR
      </v-btn>
    </div>
  </nav>
</template>

<script>
import moment from 'moment'

export default {
  name: "ActivityFilter",
  data() {
    return {
      model: true,
      dates: [],
      txType: null,
      token: null,
    }
  },
  computed: {
    dateRangeText () {
      return this.dates.map(e => moment(e).format('ddd, MMM D')).join(' ~ ')
    },
  },
  watch: {
    model(value) {
      const el = document.getElementById('activity-filter')

      if (!value) {
        el.style.backgroundColor = 'var(--primary)'
        setTimeout(() => { el.style.backgroundColor = 'transparent' }, 300);
        el.scrollTop = 0
      }
    }
  },

  methods: {
    test(item) {
      console.log(item);
    }
  },
}
</script>

<style src="@/assets/styles/components/activity-filter.scss" lang="scss"></style>
