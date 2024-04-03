<template>
  <div id="create-lock-password" class="divcol center">
    <Header
      ref="header"
      top-text="CREAR CLAVE"
      bottom-text="DE BLOQUEO"
      description="ESTA CLAVE LA UTILIZARAS PARA DESBLOQUEAR TU BILLETERA DANDOLE UN NIVEL DE SEGURIDAD ADICIONAL"
      max-width="311px"
      top-text-dir="ltr"
      bottom-text-dir="rtl"
    />

    <v-form id="create-lock-password-content" ref="form" class="mt-16">
      <v-text-field
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        label="COLOCA TU CLAVE" solo
        :rules="[globalRules.required]"
      >
        <template #append>
          <v-btn 
            class="btn-icon"
            style="--bg: var(--secondary);
            --b: 1px solid var(--primary);"
            @click="showPassword = !showPassword"
          >
            <v-icon color="var(--primary)" size="16">
              {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
            </v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <v-text-field
        v-model="form.repeatPassword"
        :type="showRepeatPassword ? 'text' : 'password'"
        label="CONFIRMA TU CLAVE" solo
        :rules="[globalRules.required, (v) => v === form.password || 'Las contraseñas no coinciden']"
      >
        <template #append>
          <v-btn 
            class="btn-icon"
            style="--bg: var(--secondary);
            --b: 1px solid var(--primary);"
            @click="showRepeatPassword = !showRepeatPassword"
          >
            <v-icon color="var(--primary)" size="16">
              {{ showRepeatPassword ? 'mdi-eye-off' : 'mdi-eye' }}
            </v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <v-checkbox
        v-model="form.accept"
        :rules="[globalRules.required]"
      >
        <template #label>
          <p class="mb-0">
            YO DECLARO QUE ENTIENDO QUE ESTA CLAVE DE BLOQUEO NO PUEDE USARSE PARA RECUPERAR MIS CUENTAS, ES DECIR QUE IGUAL TENGO QUE POSEER MIS 12 PALABRAS.
          </p>
        </template>
      </v-checkbox>

      <v-btn
        class="btn"
        :loading="loading"
        @click="onComplete"
      >
        PROTEGER
      </v-btn>
    </v-form>

    <p class="mt-16 mb-0 text-center">ESTE APLICATIVO NO GUARDA SU CLAVE, LA CLAVE PRIVADA O EL PASSPHRASE ESTAN EN SU DISPOSITIVO Y LO PROTEGE CON ESTA CLAVE DE DESBLOQUEO</p>

    
    <Footer ref="footer" dir="row">
      <span class="text tcenter" style="--text: var(--text2)">
        BUSCAS AYUDA?
      </span>
      <a class="text ml-1" style="--fw: 700; color: var(--primary) !important" href="#" target="_blank">
        SOPORTE
      </a>
    </Footer>
  </div>
</template>

<script>
import * as cryptoJS from 'crypto-js';
import localStorageUser from '@/services/local-storage-user';

export default {
  name: "CreateUnlockPasswordPage",
  layout: "default-variant",
  middleware: ["authenticated"],
  data() {
    return {
      loading: false,
      setted: false,
      showPassword: false,
      showRepeatPassword: false,
      form: {
        password: null,
        repeatPassword: null,
        accept: false,
      }
    }
  },
  head() {
    const title = 'Crea tu clave de bloqueo';
    return {
      title,
    }
  },
  mounted() {
    this.validateUnlock()
  },
  methods: {
    validateUnlock() {
      const address = localStorage.getItem("address")

      if (!address) {
        return this.$router.push("/")
      }

      try {
        const account = localStorageUser.getAccount(address)

        if (!account.publicKey.startsWith('ed25519:')) {
          return this.$router.push("/")
        }
      } catch (error) {
        localStorage.removeItem("address")
        localStorage.removeItem("listUser")
        localStorage.removeItem("auth")
        location.reload()
      }
    },
    onComplete() {
      if (!this.$refs.form?.validate() || this.setted) return

      this.setted = true
      // localStorageUser.addLockPassword(this.form.password)
      const listUser = localStorageUser.getListUser()

      const usersData = listUser.map(result => {
        result[1].privateKey = this.encrypt(result[1].privateKey, this.form.password)
        result[1].publicKey = this.encrypt(result[1].publicKey, this.form.password)
        return result
      })

      const userMapStr = JSON.stringify(Array.from(usersData))

      localStorage.setItem('listUser', userMapStr)

      // localStorage.setItem("listUser", usersData)

      this.$alert('success')
      setTimeout(() => this.$router.push("/"), 1000)
    },
    encrypt(text, secret) {
      const ciphertext = cryptoJS.AES.encrypt(JSON.stringify({ text }), secret).toString();
      return ciphertext
    }
  }
};
</script>

<style src="~/assets/styles/pages/create-lock-password.scss" lang="scss" />
