<template>
  <div id="connect-with-near" class="d-flex flex-column">
  </div>
</template>

<script>
import encryp from '../services/encryp';


export default {
  name: "ExecuteCtions",
  layout: "default-variant",
  data() {
    return {}
  },
  head() {
    const title = 'execute';
    return {
      title,
    }
  },
  mounted() {
    this.execute();    
  },
  methods: {
    execute() {
      let token

      if(this.$route.query.token){
        // const tokenString = window.atob(this.$route.query.token);
        const tokenString = encryp.decryp(this.$route.query.token);
        const tokenJSON = JSON.parse(tokenString);
        sessionStorage.setItem("token", tokenString);

      
        token = tokenJSON
      } else {
        // console.log(sessionStorage.getItem("token"))
        token = JSON.parse(sessionStorage.getItem("token"));
      } 
      
      if (!localStorage.getItem('auth')) {
        if(!token) {
          this.$router.push({path: '/login' });
          return  
        }
        this.$router.push({path: '/login', query: {action: 'connect-with-near'} });
        return;
      }

      if(!token) {
       this.$router.push({path: '/login' });
       return
      }

      
      if(!localStorage.getItem("listUser")) {// if(!localStorage.getItem('auth')) {
        if(token.action === "connect-seedphrase") {
          // localStorage.setItem("login", true);
          this.$router.push({path: '/passphrase-login', query: {action: 'connect-with-near'} });
        } else {
          this.$router.push({path: '/login', query: {action: 'connect-with-near'} });
        } 
        return
      } 
        
      if(token.action === "connect" || token.action === "connect-seedphrase") {
        this.$router.push({ path: "/connect-with-near" });
      } else if(token.action === "call") {
        this.$router.push({ path: "/approve-transaction" });
      }
    }
  }
}
</script>

<style src="@/assets/styles/pages/connect-with-near.scss" lang="scss"></style>
