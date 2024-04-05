<template>
  <v-form
    ref="formEnvio"
    v-model="validEnvio"
  >
    <div id="send-details" class="d-flex flex-column">
      <Header></Header>

      <div style="margin-top: 26px; height: 45px;" />


      <section class="d-flex flex-column" style="height: 248px;">
        <h2>{{ amount }} <span>{{ tokenSymbol }}</span></h2>
      </section>


      <section class="d-flex flex-column" style="margin-bottom: 43px;">
        <v-text-field
          v-model="accountNear"
          placeholder="ID DE CUENTA" solo
          style="--bg: var(--secondary); --p: 0 15px 0 23px"
          :error-messages="errorAccount"
          :success-messages="successAccount"
          :rules="required"
          required
          @keyup="verificarAccount(accountNear)"
        >
          <template #prepend-inner>
            <h5 class="mb-0" style="color: var(--primary)">ENVIAR A</h5>
          </template>
        </v-text-field>
        <h7 class="mb-4"><strong>Nota:</strong> los unicos caracteres especiales permitidos son punto (.), guion (-) y guion bajo (_)</h7>

        <aside class="d-flex" style="gap: 12px">
          <v-btn
            class="btn-outlined flex-grow-1"
            style="--bg: var(--secondary);" 
            :loading="envioLoading"
            @click="$router.go(-1)"
          >
            CANCELAR
          </v-btn>

          <v-btn 
            class="btn flex-grow-1"
            :loading="envioLoading"
            @click="send()"
          >
            CONTINUAR
          </v-btn>
        </aside>
      </section>

      <h5 style="margin-bottom: 12px;">BENEFICIARIO COMÚN</h5>
      <section class="d-flex flex-column" style="gap: 12px;">
        <v-card
          v-for="(item, i) in commonPayee" :key="i"
          color="transparent"
          class="card-common-payee d-flex"
          style="gap: 13px;"
        >
          <v-img-load
            :src="item.img"
            :alt="`${item.name || item.email}'s avatar`"
            sizes="40px"
            cover
            class="flex-grow-0"
            @click="selectAccount(item.email)"
          />

          <div
            class="d-flex flex-column justify-center"
            @click="selectAccount(item.email)"
          >
            <span>{{ item.email }}</span>
            <span>{{ item.name }}</span>
          </div>
        </v-card>
      </section>
    </div>
  </v-form>
</template>

<script>
import * as nearAPI from "near-api-js";
// import tokens from '@/services/tokens';
import { configNear } from "@/services/nearConfig";
// import { configNear } from "@/services/nearConfig";
import walletUtils from '@/services/wallet';
const { keyStores, Account, Near, utils } = nearAPI;


export default {
  name: "SendDetailsPage",
  data() {
    return {
      validEnvio: true,
      amount: 0,
      tokenSymbol: "",
      dataToken: null,
      accountNear: null,
      required: [(v) => !!v || "Campo requerido" /*, (v) => this.verificarAccount(v) || "Account already exists" */ ],
      errorAccount: null,
      successAccount: null,
      envioLoading: false,
      commonPayee: [/*
        {
          img: require('@/assets/sources/avatars/avatar-female.svg'),
          email: "mariangelahdezp@gmail.com",
          name: "María Ángela Hernández",
        },
        {
          img: require('@/assets/sources/avatars/avatar-male.svg'),
          name: "arturoadelante.near",
        },
        {
          img: require('@/assets/sources/avatars/avatar-female.svg'),
          name: "patriciasilvab.near",
        },
        {
          img: require('@/assets/sources/avatars/avatar-female.svg'),
          email: "Miguel.marinan@gmail.com",
          name: "Miguel Marinan González",
        },
        {
          img: require('@/assets/sources/avatars/avatar-male.svg'),
          name: "danielaruiz.near",
        }, */
      ]
    }
  },
  head() {
    const title = 'Send details';
    return {
      title,
    }
  },

  watch: {
    accountNear(val) {
      this.accountNear = val.toLowerCase();
    }
  },

  mounted() {
    // localStorage.removeItem("common-beneficiary");
    const data = sessionStorage.getItem("send-json");
    if(data){
      const json = JSON.parse(data);
      this.amount = json.amount
      if(json.dataToken){
        this.dataToken = json.dataToken;
        this.tokenSymbol = json.dataToken.symbol;
      } else {
        this.tokenSymbol = "NEAR";
      }
    }
    this.recentBeneficiary();
  },

  methods: {
    selectAccount(wallet) {
      this.accountNear = wallet;
    },

    recentBeneficiary() {
      const result = localStorage.getItem("common-beneficiary");

      if(result) {
        const arreglo = JSON.parse(result).map(item => { return  {
            img: require('@/assets/sources/avatars/avatar-male.svg'),
            email: item.wallet,
            name: "",
            count: item.count,
          } 
        });
        
        arreglo.sort(function(a, b) {
          const textA = a.count;
          const textB = b.count;
          return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        });

        this.commonPayee = arreglo.slice(0, 6);
      }
      

    },

    async verificarAccount(value) {
      // setTimeout(async () => {
        // this.successAccount = null
        // this.errorAccount = null
        if(!value) {
          this.successAccount = null
          this.errorAccount = null
          return false
        }

        if((/^[a-z0-9_.-]+$/.test(value))) {
          const keyStore = new keyStores.InMemoryKeyStore()
          const near = new Near(configNear(keyStore))
          const account = new Account(near.connection, value)
          
          let response = false
          if(value) {
            await account.state()
              .then(() => {
                response = true
                this.errorAccount = null
                this.successAccount = "Usuario válido"
              }).catch(() => {
                response = false
                this.successAccount = null
                this.errorAccount = "Usuario no existe"
              })
          }
          
          return response
        } else {
          this.errorAccount = "Valores no permitidos"
          return false
        }
      // }, "1000");
    
    },

    async send() {
      if(this.$refs.formEnvio.validate()) {
        this.envioLoading = true;

        if(this.tokenSymbol === "NEAR"){
          let err = false;
          await this.sendNear().catch(error => {
            this.$alert("error",{ desc: error })
            err = true
          });

          if(err) {
            this.envioLoading = false;
            return
          }
        } else {
          let err = false;
          await this.sendToken().catch(error => {
            this.$alert("error",{ desc: error })
            err = true;
          });
          if(err) {
            this.envioLoading = false;
            return
          }
        }

        this.$refs.formEnvio.reset();

        sessionStorage.removeItem('allTokenBalances')
        
        

        this.envioLoading = false;

        

        this.$router.push({ path: "/" });
      }
    },

    addRecentBaneficiary(address) {
      let beneficiary = [];
      const commonBeneficiary = localStorage.getItem("common-beneficiary");
      if(commonBeneficiary) {
        beneficiary = JSON.parse(commonBeneficiary);
      }
      
      const isExistBeneficiary = beneficiary.find(item => item.wallet === address);

      if(isExistBeneficiary) {
        beneficiary.find(item => item.wallet === address).count += 1;
      } else {
        beneficiary.push({wallet: address, count: 1});
      }

      localStorage.setItem("common-beneficiary", JSON.stringify(beneficiary));
    },

    async sendNear() {
      try {
        const account = await walletUtils.nearConnection();
        const result = await account.sendMoney(
          this.accountNear, // receiver account
          utils.format.parseNearAmount(this.amount).toString() // amount in yoctoNEAR
        );

        const sendResult = JSON.stringify({
          hash: !result?.transaction.hash ? result : result?.transaction.hash,
          hashUrl: process.env.ROUTER_EXPLORER_NEAR + 'es/txns/' + this.hash,
          alertType: result?.status?.SuccessValue === "" ? "success" : "error",
        })

        sessionStorage.setItem("send-result", sendResult)
        this.addRecentBaneficiary(this.accountNear)
      } catch (error) {
        throw new Error(error)
      }
    },

    async sendToken() {
      try {
        const account = await walletUtils.nearConnection();
        const isActiveToken = await account.viewFunctionV1(
          this.dataToken.contract,
          "storage_balance_of",
          { account_id: this.accountNear }
        );

        if(!isActiveToken) {
          const storageDepositResult = await account.functionCall({
            contractId: this.dataToken.contract,
            methodName: "storage_deposit",
            args: { account_id: this.accountNear },
            attachedDeposit: "1250000000000000000000"
          });
          
          if(!storageDepositResult || !storageDepositResult.status?.SuccessValue) {
            console.log("error al activar token");
            return
          }
        }

        const result = await account.functionCall({
          contractId: this.dataToken.contract,
          methodName: "ft_transfer",
          args: { 
            receiver_id: this.accountNear,
            amount: walletUtils.parseTokenAmount(this.amount, this.dataToken.decimals)
          },
          attachedDeposit: "1"
        });

        const hash = !result?.transaction.hash ? result : result?.transaction.hash;
        const sendResult = JSON.stringify({
          hash,
          hashUrl: process.env.ROUTER_EXPLORER_NEAR + 'es/txns/' + hash,
          alertType: result?.status?.SuccessValue === "" ? "success" : "error",
        })

        sessionStorage.setItem("send-result", sendResult)

        this.addRecentBaneficiary(this.accountNear)
      } catch (error) {
        throw new Error(error)
      }
    },


  },
}
</script>

<style src="@/assets/styles/pages/send-details.scss" lang="scss"></style>
