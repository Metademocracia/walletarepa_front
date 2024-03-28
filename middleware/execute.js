/* export default function ({ redirect }) {
  // If the user is not authenticated
  if (!localStorage.getItem('auth')) {
    return redirect('/login')
  }
} */
import encryp from '../services/encryp';

export default function ({ redirect }) {
    let token = null;
    // console.log("entro aqui en grande 2 ", this.$route)
    if(this.$route.query.token){
      // const tokenString = window.atob(this.$route.query.token);
      const tokenString = encryp.decryp(this.$route.query.token);
      const tokenJSON = JSON.parse(tokenString);
      
      sessionStorage.setItem("token", tokenString);

      // console.log("entro aqui en grande 3")
      token = tokenJSON
    } else {
      // console.log("entro aqui en grande 4")
      // console.log(sessionStorage.getItem("token"))
      token = JSON.parse(sessionStorage.getItem("token"));
    } 
    
    console.log("entro aqui en grande 5")

    if(!token) {
      console.log("error no hay token");
      return redirect("/login");
    } 
    
    if(token.action === "connect") {
      
      return redirect("/connect-with-near");
    } else if(token.action === "call") {
      
      return redirect("/approve-transaction");
    }
}