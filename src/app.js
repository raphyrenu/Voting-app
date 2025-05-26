const contractAddress = "0xDCe6C63a6FBd3759323F980FF02a41344CF2fEf9";
let contractABI;
let web3;
let votingContract;
let account;

async function loadABI() {
  const response = await fetch('/build/contracts/Voting.json');
  contractABI = await response.json();
}

async function connectMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById('account').innerText = `Connected Account: ${account}`;
      if (!contractABI) await loadABI();
      votingContract = new web3.eth.Contract(contractABI.abi, contractAddress);
      loadCandidates();
    } catch (err) {
      console.error("MetaMask connection failed:", err);
    }
  } else {
    alert("MetaMask not detected!");
  }
}

async function loadCandidates() {
  const count = await votingContract.methods.candidatesCount().call();
  const list = document.getElementById("candidates");
  list.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const candidate = await votingContract.methods.candidates(i).call();
    const li = document.createElement("li");
    li.innerText = `${candidate.name} - ${candidate.voteCount} votes`;
    const voteBtn = document.createElement("button");
    voteBtn.innerText = "Vote";
    voteBtn.onclick = () => vote(i);
    li.appendChild(voteBtn);
    list.appendChild(li);
  }
}

async function vote(candidateId) {
  try {
    await votingContract.methods.vote(candidateId).send({ from: account });
    alert("Vote cast!");
    loadCandidates();
  } catch (err) {
    console.error("Vote failed:", err);
    alert("Vote failed or you already voted.");
  }
}

async function addCandidate() {
  const name = document.getElementById("candidateInput").value;
  if (!name) return alert("Enter a name.");
  try {
    await votingContract.methods.addCandidate(name).send({ from: account });
    alert("Candidate added.");
    loadCandidates();
  } catch (err) {
    console.error("Add failed:", err);
    alert("Only owner can add candidates.");
  }
}
