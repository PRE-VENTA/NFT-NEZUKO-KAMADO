let web3;
let userAccount;

const CONTRACTS = {
token: '0x39c9deff5c68d62a8acb3215b18fff8d0baff349',
nft: '0x3cF732Dd7a3C809165A53bAD071cAD2B4Bb899D0',
presale: '0x4EF73c3a789AdB4eC53c0f7715A50164A46b0408'
};

const BSC_MAINNET = {
chainId: '0x38',
chainName: 'BNB Smart Chain',
rpcUrls: ['https://bsc-dataseed.binance.org/'],
blockExplorerUrls: ['https://bscscan.com/'],
nativeCurrency: {
name: 'BNB',
symbol: 'BNB',
decimals: 18
}
};

async function connectWallet() {
const btn = document.getElementById('connectWallet');

// Si ya está conectado, no hacer nada
if (userAccount) {
return;
}

if (!window.ethereum) {
alert('⚠️ Por favor instala MetaMask');
window.open('https://metamask.io/download.html', '_blank');
return;
}

try {
btn.textContent = '🔄 Conectando...';
btn.disabled = true;

web3 = new Web3(window.ethereum);

const accounts = await window.ethereum.request({
method: 'eth_requestAccounts'
});

userAccount = accounts[0];

// Verificar red
const chainId = await window.ethereum.request({
method: 'eth_chainId'
});

if (chainId !== BSC_MAINNET.chainId) {
await switchToBSC();
}

// CAMBIAR BOTÓN A CONECTADO
btn.textContent = '✅ Conectado';
btn.style.background = '#00B894';
btn.style.boxShadow = '0 0 20px rgba(0, 184, 148, 0.4)';
btn.disabled = false;

// Mostrar dirección
document.getElementById('walletAddress').style.display = 'inline';
document.getElementById('walletAddress').textContent =
userAccount.substring(0, 6) + '...' + userAccount.substring(38);

// Inicializar contratos
initContracts();

// Cargar datos
cargarDatos();

// Escuchar cambios de cuenta
window.ethereum.on('accountsChanged', (accounts) => {
if (accounts.length > 0) {
userAccount = accounts[0];
document.getElementById('walletAddress').textContent =
userAccount.substring(0, 6) + '...' + userAccount.substring(38);
cargarDatos();
} else {
desconectar();
}
});

window.ethereum.on('chainChanged', () => {
window.location.reload();
});

} catch (error) {
btn.textContent = '🔌 Conectar Wallet';
btn.style.background = '#6C5CE7';
btn.style.boxShadow = '0 0 20px rgba(108, 92, 231, 0.3)';
btn.disabled = false;

if (error.code !== 4001) {
alert('❌ Error: ' + error.message);
}
}
}

function desconectar() {
userAccount = null;
const btn = document.getElementById('connectWallet');
btn.textContent = '🔌 Conectar Wallet';
btn.style.background = '#6C5CE7';
btn.style.boxShadow = '0 0 20px rgba(108, 92, 231, 0.3)';
document.getElementById('walletAddress').style.display = 'none';
document.getElementById('tokenBalance').textContent = '0 SUPREMACY';
}

async function switchToBSC() {
try {
await window.ethereum.request({
method: 'wallet_switchEthereumChain',
params: [{ chainId: BSC_MAINNET.chainId }],
});
} catch (error) {
if (error.code === 4902) {
await window.ethereum.request({
method: 'wallet_addEthereumChain',
params: [BSC_MAINNET],
});
}
}
}
