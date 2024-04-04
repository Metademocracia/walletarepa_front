<template>
  <div id="security" class="d-flex flex-column">
    <Header
      show-append
      :top-text="`SEGURIDAD &`"
      bottom-text="RECUPERACIÓN"
      bottom-text-dir="ltr"
      hide-profile  
    ></Header>

    <v-dialog
      v-model="model"
      max-width="max-content"
      :overlay-opacity=".9"
      content-class="modal-cryptos"
    >
      <v-card class="cryptos-card">
        <div
          class="cryptos-card__wrapper"
          style="text-align: center;"
        >
        <h4>
          ¿Ver clave privada?
        </h4>
        </div>
        <div
          class="cryptos-card__wrapper"
          style="text-align: center;"
        >
        Nunca compartas tu clave privada, cualquier persona con acceso a ella podrá tener full acceso a tu cuenta.
        </div>
        <div
          class="cryptos-card__wrapper"
          style="text-align: center; margin-top: 15px;"
        >
        <vCard style="text-align: center; background-color: black; justify-content: center; align-content: center;" @click="fnCopie(privateKey)">
          <p style="text-align: center; margin: 10px; color: grey;">
            {{ privateKey }}
          </p>
        </vCard>
        <p v-if="copie" style="text-align: center; margin: 10px; color: green;">
          Copied!
        </p>
        </div>
      </v-card>
    </v-dialog>


    <h5
      class="acenter"
      style="margin-bottom: 19px; gap: 5px;"
    >
      Más seguro (recomendado)
      <img src="@/assets/sources/icons/warning-orange.svg" alt="info">
    </h5>


    <!-- <v-card
      class="btn-outlined d-flex align-center justify-space-between"
      style="--br: 20px; padding: 22px 17px; gap: 19px; background-color: var(--secondary) !important; margin-bottom: 41px;"
    >
      <div class="d-flex flex-column" style="gap: 5px; max-width: 126px;">
        <h5 class="mb-0">billetera de hardware de libro mayor</h5>

        <p class="mb-0">Mejore la seguridad de su cuenta utilizando una billetera de hardware.</p>
      </div>

      <v-btn style="border-radius: 50px !important; max-width: 134px; min-height: 34.26px;" class="btn flex-grow-1">
        <span style="color: #fff !important;">HABILITAR</span>
      </v-btn>
    </v-card> -->

    <v-card
      v-for="(item, i) in options" :key="i"
      class="btn-outlined d-flex align-center justify-space-between"
      style="--br: 20px; padding: 22px 17px; gap: 19px; background-color: var(--secondary) !important"
    >
      <div class="d-flex" style="gap: 5px;">
        <div class="d-flex flex-column" style="max-width: 126px;">
          <h5 class="mb-0">{{ item.title }}</h5>

          <p class="mb-0">{{ item.desc }}</p>
        </div>

        <v-tooltip top color="var(--primary)">
          <template #activator="{ on, attrs }">
            <img v-if="item.helpText" src="@/assets/sources/icons/warning-orange.svg" alt="info" v-bind="attrs" v-on="on">
          </template>

          <p class="mb-0" style="--tt: none; --c: #fff">{{ item.helpText }}</p>
        </v-tooltip>
      </div>

      <v-btn
        style="border-radius: 50px !important; max-width: 134px; min-height: 34.26px;"
        class="btn flex-grow-1"
        :style="!item.active ? `--bg: #333333` : ''"
        :disabled="item.disabled"
        @click="item.action"
      >
        <span style="color: #fff !important;">{{
          item.active ? item.buttonText : item.inactiveText ?? item.buttonText
        }}</span>
      </v-btn>
    </v-card>


    <div class="d-flex flex-column mt-10" style="gap: 15px;">
      <v-btn
        class="btn-outlined"
        style="--b-color: var(--primary); --bg: var(--secondary)"
        @click="exportPrivateKey()"
      >
        <span style="color: var(--primary) !important;">exportar private key</span>
      </v-btn>

      <v-btn class="btn" @click="logout()">
        eliminar cuenta
      </v-btn>
    </div>

    <img src="@/assets/sources/logos/logotype.svg" alt="logo icon" class="mx-auto mt-16 mb-8" style="width: 200px">
  </div>
</template>

<script>
import localStorageUser from '@/services/local-storage-user';

export default {
  name: "AccountDetails",
  layout: "default",
  middleware: ["authenticated"],
  data() {
    return {
      model: false,
      copie: false,
      privateKey: null,
      options: [
        {
          title: "CONTRASEÑA",
          desc: "Solo para este dispositivo",
          buttonText: "CREAR",
          active: true,
          disabled: false,
          action: () => this.$router.push('/create-lock-password'),
        },
        // {
        //   title: "FRASE SECRETA",
        //   desc: "jul 19 2023",
        //   helpText: "lorem ipsum lorem ipsum",
        //   buttonText: "NUEVO",
        //   active: true,
        //   action: () => {},
        // },
        // {
        //   title: "2FA",
        //   desc: "jul 19 2023",
        //   helpText: "autenticación en dos pasos",
        //   buttonText: "DESACTIVAR",
        //   inactiveText: "ACTIVAR",
        //   active: true,
        //   action: () => {},
        // },
        // {
        //   title: "CORREO",
        //   desc: "jul 19 2023",
        //   helpText: "lorem ipsum lorem ipsum",
        //   active: false,
        //   buttonText: "ELIMINAR",
        //   action: () => {},
        // },
      ]
    }
  },
  head() {
    const title = 'Seguridad';
    return {
      title,
    }
  },
  mounted() {
    this.validateUnlock()
  },
  methods: {
    fnCopie(copy) {
      this.copie = true;
      navigator.clipboard.writeText(copy);
      const timer = setInterval(() => {
        this.copie = false;
        clearInterval(timer)
      }, 1000);
    },
    exportPrivateKey() {
      console.log("PRIVATE KEY")
      this.privateKey = localStorage.getItem("privateKey")
      this.model = true
    },
    validateUnlock() {
      const address = localStorage.getItem("address")

      if (!address) {
        return
      }

      try {
        const account = localStorageUser.getAccount(address)

        if (account.privateKey.startsWith('ed25519:')) {
          this.options[0].disabled = false
        } else {
          this.options[0].disabled = true
        }
      } catch (error) {
        localStorage.removeItem("address")
        localStorage.removeItem("listUser")
        localStorage.removeItem("auth")
        location.reload()
      }
    },
    logout() {
      localStorageUser.removeAccountWallet();
    },
  }
}
</script>

<style src="@/assets/styles/pages/security.scss" lang="scss"></style>
