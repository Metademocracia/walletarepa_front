import walletUtils from '@/services/wallet';


export default async function(context) {
  const data = sessionStorage.getItem('data') ? sessionStorage.getItem('data') : 0;
  try {
    const utilsdata = await walletUtils.verifyWallet();
    if (!utilsdata || utilsdata?.utilsdata?.email || utilsdata?.utilsdata?.cedula || utilsdata?.utilsdata?.name || utilsdata?.utilsdata?.walletname) {
      return context.redirect('/user-profile');
    } else if (data>0) {
      return context.redirect('/trades-pending');
    } else if(!sessionStorage.getItem('selectedFiat')){
      return context.redirect('/send');
    }
  } catch (error) {
    console.error(error);
    // Handle the error as needed
  }
}