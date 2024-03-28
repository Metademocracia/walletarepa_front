<template>
  <v-form ref="form" v-model="validForm">
    <div id="send" class="d-flex flex-column">
      <ModalCryptos
        ref="cryptos"
        @on-selected-coin="coin => selectToken(coin)"
      ></ModalCryptos>

      <Header
        :show-prepend="false"
        show-append
      ></Header>

      <!--<aside class="d-flex" style="gap: 12px; margin-top: 26px;">
        <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);">
          ENVIAR
        </v-btn>

        <v-btn class="btn flex-grow-1">
          RECIBIR
        </v-btn>
      </aside>-->


      <section class="d-flex flex-column" style="height: 248px;">
        <v-text-field
          v-model="amount"
          placeholder="0.0"
          type="number"
          :rules="required"
          required
        ></v-text-field>

        <v-btn
          class="btn-outlined mx-auto"
          style="--bg: var(--secondary); --b-color: var(--primary); --c: var(--primary); --fs: 12px; --fw: 700; --ls: 0.36px; --h: 34px; width: 121px;"
          @click="maxBalance()"
        >USAR MÁXIMO</v-btn>
      </section>


      <section class="d-flex flex-column" style="gap: 14px;">
        <!--<v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >-->
        <v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
          @click="$refs.cryptos.model = true"
        >
          <h5 class="mb-0">SELECCIONAR RECURSO</h5>
          
          <div class="center" style="gap: 6px;">
            <img :src="tokenImg" alt="near icon" style="width: 29px;">
            <span style="--fs: 12px; --c: var(--primary); --ls: normal">{{ tokenSymbol }}</span>
            <img src="@/assets/sources/icons/double-chevron-right.svg" alt="arrow right">
          </div>
        </v-card>

        <v-card
          class="btn-outlined space"
          style="--bg: var(--secondary); --b-color: #D1C4E8; padding: 0 23px;"
        >
          <h5 class="mb-0">DISPONIBLE PARA ENVIAR</h5>
          
          <span style="--fs: 12px; --ls: normal">{{ balance }} {{ tokenSymbol }}</span>
        </v-card>

        <aside class="d-flex" style="gap: 12px">
          <v-btn class="btn-outlined flex-grow-1" style="--bg: var(--secondary);" @click="$router.go(-1)">
            CANCELAR
          </v-btn>

          <v-btn
            class="btn flex-grow-1"
            @click="next()"
          >
            CONTINUAR
          </v-btn>
        </aside>
      </section>
    </div>
  </v-form>
</template>

<script>
import walletUtils from '@/services/wallet';


export default {
  name: "SendPage",
  data() {
    return {
      validForm: true,
      amount: "",
      tokenImg: require('@/assets/sources/logos/near-icon.svg'),
      tokenSymbol: "NEAR",
      balance: 0.00,
      required: [(v) => !!v || "Campo requerido", (v) => Number(v) <= Number(this.balance) || "Saldo insuficiente" ],
      dataToken: null,
    }
  },
  head() {
    const title = 'Send';
    return {
      title,
    }
  },

  mounted() {
    this.getBalance();
  },

  methods: {
    next() {
      if(this.$refs.form.validate()) {
        const json = JSON.stringify({
          amount: this.amount,
          dataToken: this.dataToken,
        })
        sessionStorage.setItem("send-json", json);
        this.$router.push({ path: "/send-details" });
      }
    },

    async getBalance() {
      let balanceNear = 0.00;

      const { near } = await walletUtils.getBalance();

      if(near) {
        balanceNear = near;
      }

      this.balance = balanceNear.toFixed(5);

    },

    maxBalance() {
      this.amount = this.balance;
    },

    selectToken(token) {
      this.balance = Number(token.balance);
      this.tokenImg = token.icon;
      this.tokenSymbol = token.symbol;
      this.dataToken = token.name !== "NEAR" ? token : null;
    }
  },
}
</script>

<style src="@/assets/styles/pages/send.scss" lang="scss"></style>
