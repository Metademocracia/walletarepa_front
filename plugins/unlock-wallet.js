import localStorageUser from "@/services/local-storage-user";

export default function ({ redirect, route }) {
    localStorage.removeItem("privateKey");
    localStorage.removeItem("publicKey");
    const address = localStorage.getItem("address");

    if (!address) {
        return;
    }

    try {
        const account = localStorageUser.getAccount(address);

        if (account.publicKey.startsWith("ed25519:")) {
            localStorage.setItem("privateKey", account.privateKey);
            localStorage.setItem("publicKey", account.publicKey);
        } else {
            const token = route.query.token;
            if (token) {
                localStorage.setItem("token", token);
            }
            setTimeout(() => {
                redirect("/unlock-wallet");
            }, 0);
        }
    } catch (error) {
        console.log(error);
        // localStorage.removeItem("address")
        // localStorage.removeItem("listUser")
        // localStorage.removeItem("auth")
        // location.reload()
    }
}
