<template>
  <div id="activity-history" class="divcol center">
    <activity-filter ref="activity-filter" />

    <section id="section-recent-activity" class="mb-10">
      <div id="section-recent-activity__wrapper">
        <Header
          ref="header"
          top-text="HISTORIAL"
          top-text-center
          max-width="390px"
        >
          <template #append>
            <v-btn class="btn-icon" style="--bg: var(--secondary); --b: 1px solid #000">
              <img src="@/assets/sources/icons/magnify.svg" alt="search icon">
            </v-btn>
          </template>
        </Header>

        <div class="divcol mb-4" style="gap: 20px; cursor: pointer">
          <h6 v-if="!dataActivity.length" class="tcenter mb-5 mt-4" style="--fs: 15px;">no records found</h6>

          <ActivityCard
            v-for="(item, i) in dataActivity" :key="i"
            :type="item.type"
            :account="item.account"
            :coin="item.coin"
            :amount="item.amount"
            :date="item.date"
            :text2="item.text2"
            :hash="item.hash"
            :desc="item.desc"
            @click.native="navigateToExternalLink(`${process.env.URL_EXPLORER_TXS}${item.hash}`)"
          />
        </div>

        <v-btn
          :href="linkExplorer" target="_blank"
          class="btn mb-1"
        >
          IR AL EXPLORADOR BLOCKCHAIN
        </v-btn>

        <v-btn class="btn-outlined mb-10" @click="$refs['activity-filter'].model = true">
          FILTRAR
        </v-btn>
      </div>
    </section>
  </div>
</template>


<script>
import moment from 'moment';

export default {
  name: "ActivityHistory",
  data() {
    return {
      linkExplorer: "",
      dataActivity: []
    }
  },
  head() {
    const title = 'Activity history';
    return {
      title,
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.dataActivity = [
        {
          hash: "11",
          date: moment(111/1000000).fromNow(),
          type: "access",
          account: "walletUtils.shortenAddress(accountParam)",
          coin: "coinParam",
          amount: "222",
          text2: "asdasd",
        },
        {
          hash: "11",
          date: moment(111/1000000).fromNow(),
          type: "access",
          account: "walletUtils.shortenAddress(accountParam)",
          coin: "coinParam",
          amount: "222",
          text2: "asdasd",
        },
        {
          hash: "11",
          date: moment(111/1000000).fromNow(),
          type: "access",
          account: "walletUtils.shortenAddress(accountParam)",
          coin: "coinParam",
          amount: "222",
          text2: "asdasd",
        },
        {
          hash: "11",
          date: moment(111/1000000).fromNow(),
          type: "access",
          account: "walletUtils.shortenAddress(accountParam)",
          coin: "coinParam",
          amount: "222",
          text2: "asdasd",
        },
        {
          hash: "11",
          date: moment(111/1000000).fromNow(),
          type: "access",
          account: "walletUtils.shortenAddress(accountParam)",
          coin: "coinParam",
          amount: "222",
          text2: "asdasd",
        },
        {
          hash: "11",
          date: moment(111/1000000).fromNow(),
          type: "access",
          account: "walletUtils.shortenAddress(accountParam)",
          coin: "coinParam",
          amount: "222",
          text2: "asdasd",
        }
      ]
    }
  }
};
</script>

<style src="~/assets/styles/pages/activity-history.scss" lang="scss" />
