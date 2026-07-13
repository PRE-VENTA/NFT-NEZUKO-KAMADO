let currentNFTSelected = null;

document.addEventListener('DOMContentLoaded', async () => {
// Event Listeners
document.getElementById('connectWallet').addEventListener('click', handleConnectWallet);
document.getElementById('mintNFTBtn').addEventListener('click', handleMintNFT);
document.getElementById('buyTokensBtn').addEventListener('click', () => {
document.querySelector('.presale-section').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('claimRewardBtn').addEventListener('click', handleClaimReward);
document.getElementById('levelUpBtn').addEventListener('click', handleLevelUp);
document.getElementById('buyTokensConfirm').addEventListener('click', handleBuyTokens);
document.getElementById('nftSelect').addEventListener('change', handleNFTSelect);
document.getElementById('bnbAmount').addEventListener('input', updateEstimatedTokens);
});

async function handleConnectWallet() {
const connected = await connectWallet();
if (connected) {
initContracts();
updateUI();
}
}

async function updateUI() {
// Actualizar dirección
document.getElementById('connectWallet').style.display = 'none';
document.getElementById('walletAddress').style.display = 'inline';
document.getElementById('walletAddress').textContent =
userAccount.substring(0, 6) + '...' + userAccount.substring(38);

// Actualizar balances y stats
const symbol = await getTokenSymbol();
const balance = await getTokenBalance(userAccount);
document.getElementById('tokenBalance').textContent = ${parseFloat(balance).toFixed(2)} ${symbol};

// Stats de venta
const tokensPorBnb = await getTokensPorBnb();
document.getElementById('tokensPorBnb').textContent = ${tokensPorBnb} ${symbol};

const tokensVendidos = await getTokensVendidos();
document.getElementById('tokensVendidos').textContent = web3.utils.fromWei(tokensVendidos, 'ether');

const nextId = await getNextTokenId();
document.getElementById('totalNFTs').textContent = nextId - 1;

// Cargar NFTs del usuario
await loadUserNFTs();
}

async function loadUserNFTs() {
const nftGrid = document.getElementById('nftGrid');
const nftSelect = document.getElementById('nftSelect');

// Limpiar
nftGrid.innerHTML = '';
nftSelect.innerHTML = '<option value="">Selecciona un NFT</option>';

try {
const nftCount = await nftContract.methods.nftsPorUsuario(userAccount).call();

if (nftCount == 0) {
nftGrid.innerHTML = '<p>No tienes NFTs aún. ¡Mintea uno gratis!</p>';
return;
}

// Buscar NFTs del usuario (simplificado - necesitarías iterar sobre token IDs)
for (let tokenId = 1; tokenId <= parseInt(await getNextTokenId()); tokenId++) {
try {
const owner = await nftContract.methods.ownerOf(tokenId).call();
if (owner.toLowerCase() === userAccount.toLowerCase()) {
const info = await getNFTInfo(tokenId);

// Agregar al grid
const card = document.createElement('div');
card.className = 'nft-card';
card.innerHTML = &lt;h3&gt;NFT #${tokenId}</h3>
<p>⭐ Nivel: ${info.nivel}&lt;/p&gt; &lt;p&gt;📅 ${new Date(info.fechaNacimiento * 1000).toLocaleDateString()}</p>
`;
nftGrid.appendChild(card);

// Agregar al select
const option = document.createElement('option');
option.value = tokenId;
option.textContent = NFT #${tokenId} - Nivel ${info.nivel};
nftSelect.appendChild(option);
}
} catch (e) {
continue;
}
}
} catch (error) {
console.error('Error cargando NFTs:', error);
nftGrid.innerHTML = '<p>Error al cargar NFTs</p>';
}
}

async function handleMintNFT() {
try {
document.getElementById('mintNFTBtn').disabled = true;
document.getElementById('mintNFTBtn').textContent = 'Minteando...';

await mintFreeNFT();

alert('✅ ¡NFT minteado exitosamente!');
await updateUI();
} catch (error) {
console.error('Error minteando:', error);
alert('❌ Error al mintear NFT: ' + error.message);
} finally {
document.getElementById('mintNFTBtn').disabled = false;
document.getElementById('mintNFTBtn').textContent = '🎨 Mintear NFT Gratis';
}
}

async function handleNFTSelect(event) {
const tokenId = event.target.value;
if (!tokenId) {
document.getElementById('nftInfo').style.display = 'none';
return;
}

currentNFTSelected = tokenId;
const info = await getNFTInfo(tokenId);
const miningRate = await getMiningByLevel(info.nivel);

document.getElementById('nftInfo').style.display = 'block';
document.getElementById('nftFecha').textContent = new Date(info.fechaNacimiento * 1000).toLocaleDateString();
document.getElementById('nftNivel').textContent = info.nivel;
document.getElementById('nftMinado').textContent = web3.utils.fromWei(miningRate, 'ether');
}

async function handleClaimReward() {
if (!currentNFTSelected) {
alert('⚠️ Selecciona un NFT primero');
return;
}

try {
document.getElementById('claimRewardBtn').disabled = true;
document.getElementById('claimRewardBtn').textContent = 'Reclamando...';

await claimReward(currentNFTSelected);

alert('✅ ¡Recompensa reclamada exitosamente!');
await updateUI();
} catch (error) {
console.error('Error reclamando:', error);
alert('❌ Error al reclamar: ' + error.message);
} finally {
document.getElementById('claimRewardBtn').disabled = false;
document.getElementById('claimRewardBtn').textContent = '🎁 Reclamar Recompensa';
}
}

async function handleLevelUp() {
if (!currentNFTSelected) {
alert('⚠️ Selecciona un NFT primero');
return;
}

try {
document.getElementById('levelUpBtn').disabled = true;
document.getElementById('levelUpBtn').textContent = 'Subiendo...';

await levelUp(currentNFTSelected);

alert('✅ ¡Nivel subido exitosamente!');
await updateUI();
} catch (error) {
console.error('Error subiendo nivel:', error);
alert('❌ Error al subir nivel: ' + error.message);
} finally {
document.getElementById('levelUpBtn').disabled = false;
document.getElementById('levelUpBtn').textContent = '⬆️ Subir Nivel';
}
}

function updateEstimatedTokens() {
const bnbAmount = document.getElementById('bnbAmount').value;
if (bnbAmount > 0) {
getTokensPorBnb().then(rate => {
const tokens = bnbAmount * rate;
document.getElementById('estimatedTokens').textContent =
Recibirás:${tokens} SUPREMACY`;
});
}
}

async function handleBuyTokens() {
const bnbAmount = document.getElementById('bnbAmount').value;
if (!bnbAmount || bnbAmount <= 0) {
alert('⚠️ Ingresa una cantidad válida de BNB');
return;
}

try {
document.getElementById('buyTokensConfirm').disabled = true;
document.getElementById('buyTokensConfirm').textContent = 'Comprando...';

await buyTokens(bnbAmount);

alert('✅ ¡Tokens comprados exitosamente!');
document.getElementById('bnbAmount').value = '';
document.getElementById('estimatedTokens').textContent = 'Recibirás: 0 SUPREMACY';
await updateUI();
} catch (error) {
console.error('Error comprando:', error);
alert('❌ Error al comprar tokens: ' + error.message);
} finally {
document.getElementById('buyTokensConfirm').disabled = false;
document.getElementById('buyTokensConfirm').textContent = '💎 Comprar Ahora';
}
}