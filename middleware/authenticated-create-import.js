export default function (data) {
  // If the user is not authenticated
  if(!sessionStorage.getItem("create-import-proccess")) {
    return data.redirect('/')
  }

  /* if (!localStorage.getItem('auth')) {
    
    if(!data.route.path === "/login" || !data.route.path === "/login/" || !data.route.path === "/passphrase-login" || !data.route.path === "/passphrase-login/") {
      
      return data.redirect('/login')
    }
  
    return;
  }
  
  if(data.route.fullPath === "/login" || data.route.fullPath === "/login/" || data.route.fullPath === "/passphrase-login" || data.route.fullPath === "/passphrase-login/") {
  
    return data.redirect('/')
  } */
}
