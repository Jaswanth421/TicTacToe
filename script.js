const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const turnIndicator = document.getElementById('turn-indicator');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const logEl = document.getElementById('log');
const modeLocalBtn = document.getElementById('mode-local');
const modeComputerBtn = document.getElementById('mode-computer');
const computerSettings = document.getElementById('computer-settings');

let cells = Array(9).fill(null);
let turn = 'X';
let scores = { X: 0, O: 0, draw: 0 };
let mode = 'local';
let computerDifficulty = 'medium';
let humanPlays = 'X';
let gameOver = false;

function log(msg){ logEl.value = new Date().toLocaleTimeString() + ' — ' + msg + '\n' + logEl.value; }
function renderBoard(){
  boardEl.innerHTML = '';
  cells.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell' + (val ? ' disabled' : '');
    cell.textContent = val || '';
    cell.onclick = () => onCellClick(i);
    boardEl.appendChild(cell);
  });
  turnIndicator.textContent = turn;
}
function onCellClick(i){
  if(gameOver || cells[i]) return;
  if(mode === 'computer' && turn !== humanPlays) return;
  makeMove(i, turn);
  if(mode === 'computer' && !gameOver){
    const ai = humanPlays === 'X' ? 'O' : 'X';
    setTimeout(() => {
      let pick;
      if(computerDifficulty === 'easy') pick = randomMove();
      else if(computerDifficulty === 'medium') pick = bestMove(cells.slice(), ai, 3);
      else pick = bestMove(cells.slice(), ai, null);
      makeMove(pick, ai);
    }, 200);
  }
}
function makeMove(i, player){
  if(cells[i] || gameOver) return;
  cells[i] = player;
  renderBoard();
  const winner = checkWinner(cells);
  if(winner){
    gameOver = true;
    if(winner === 'draw') scores.draw++, scoreDrawEl.textContent = scores.draw, statusEl.innerHTML = '<b>Draw!</b>';
    else scores[winner]++, scoreXEl.textContent = scores.X, scoreOEl.textContent = scores.O, statusEl.innerHTML = `<b>${winner} wins!</b>`;
  } else turn = turn === 'X' ? 'O' : 'X';
}
function randomMove(){ return cells.map((v,i)=>v?null:i).filter(x=>x!==null)[Math.floor(Math.random()*cells.filter(v=>!v).length)]; }
function checkWinner(b){
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b1,c] of wins) if(b[a] && b[a]===b[b1]&&b[a]===b[c]) return b[a];
  return b.every(x=>x)?'draw':null;
}
function bestMove(board, ai, limit){
  const hu = ai==='X'?'O':'X';
  function mm(b,p,d){
    const w=checkWinner(b);
    if(w)return{score:w===ai?10-d:w===hu?d-10:0};
    if(limit!==null&&d>=limit)return{score:0};
    const moves=[];
    for(let i=0;i<9;i++) if(!b[i]){b[i]=p;const s=mm(b,p==='X'?'O':'X',d+1);moves.push({i,score:s.score});b[i]=null;}
    const cmp=p===ai?Math.max:Math.min;
    return moves.reduce((a,c)=>cmp(a.score,c.score)===a.score?a:c);
  }
  return mm(board,ai,0).i;
}
document.getElementById('new-game').onclick=()=>{reset();};
document.getElementById('reset-score').onclick=()=>{scores={X:0,O:0,draw:0};scoreXEl.textContent=0;scoreOEl.textContent=0;scoreDrawEl.textContent=0;};
document.getElementById('swap').onclick=()=>{humanPlays=humanPlays==='X'?'O':'X';reset();};
modeLocalBtn.onclick=()=>setMode('local');
modeComputerBtn.onclick=()=>setMode('computer');
['diff-easy','diff-medium','diff-hard'].forEach(id=>document.getElementById(id).onclick=e=>setDiff(id));
function setMode(m){mode=m;[modeLocalBtn,modeComputerBtn].forEach(b=>b.classList.remove('active'));document.getElementById('mode-'+m).classList.add('active');computerSettings.style.display=m==='computer'?'block':'none';reset();}
function setDiff(id){['diff-easy','diff-medium','diff-hard'].forEach(x=>document.getElementById(x).classList.remove('active'));document.getElementById(id).classList.add('active');computerDifficulty=id.split('-')[1];}
function reset(){cells=Array(9).fill(null);turn='X';gameOver=false;renderBoard();statusEl.innerHTML='Turn: <strong id="turn-indicator">'+turn+'</strong>'}
reset();renderBoard();
