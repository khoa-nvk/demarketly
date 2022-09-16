
// For testnet
let contractAddress = 'ct_2UYZvZ5o3gUKFj4MTYjTiTirPjD2g134yKGJdHnxggbM55w7We'
let urlCallAPI = 'https://testnet.aeternity.io'
let networkName = 'testnet'


console.log('network-config')

if (typeof window !== 'undefined') {
    if (localStorage.getItem('NETWORK_AETERNITY') == 'mainnet') {
        // For mainnet
        let contractAddress = 'ct_2UYZvZ5o3gUKFj4MTYjTiTirPjD2g134yKGJdHnxggbM55w7We'
        const urlCallAPI = 'https://mainnet.aeternity.io'
        let networkName = 'mainnet'
    }
}

export const CONTRACT_OWNER_ADDRESS = contractAddress

export const URL_CALL_API = urlCallAPI

export const NETWORK_NAME = networkName
