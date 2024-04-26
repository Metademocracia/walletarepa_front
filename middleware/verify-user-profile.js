import walletUtils from '@/services/wallet';


export default async function(context) {
  try {
    const utilsdata = await walletUtils.verifyWallet();
    if (utilsdata || utilsdata.utilsdata.email || utilsdata.utilsdata.cedula || utilsdata.utilsdata.name || utilsdata.utilsdata.walletname) {
      return context.redirect('/');
    }
  } catch (error) {
    console.error(error);
    // Handle the error as needed
  }
}