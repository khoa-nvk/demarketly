
// For testnet
let contractAddress = 'ct_2wEgtkDtHS4tHDNVyxprjnxbbRbueSLDKbEAe7EQm8xS5iip5g'
let urlCallAPI = 'https://testnet.aeternity.io'
let networkName = 'testnet'


console.log('network-config')

if (typeof window !== 'undefined') {
    if (localStorage.getItem('NETWORK_AETERNITY') == 'mainnet') {
        // For mainnet
        let contractAddress = 'ct_2wEgtkDtHS4tHDNVyxprjnxbbRbueSLDKbEAe7EQm8xS5iip5g'
        const urlCallAPI = 'https://mainnet.aeternity.io'
        let networkName = 'mainnet'
    }
}

export const CONTRACT_OWNER_ADDRESS = contractAddress

export const URL_CALL_API = urlCallAPI

export const NETWORK_NAME = networkName
