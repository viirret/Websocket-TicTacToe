'use strict';

const ws = new WebSocket('ws://localhost:8080');

const empty = new Array(9).fill(0);

let gameState = {
	nextPlayer: undefined,
	playerId: 	undefined,
	board: 		empty,
};
	
// fill the DOM with initial game state
const initialize = () => {
	document.querySelector('.player_name').innerHTML = `You are player ${gameState.playerId}`;
	document.querySelector('#button_div').style.display = "none";
	updateBoard();
}

const updateTurn = () => {
	document.querySelector(".player_turn").innerHTML = gameState.playerId === gameState.nextPlayer
		? "Your turn"
		: "Opponent's turn";
}

// update the board and whos turn its to play
const updateBoard = () => {
	
	updateTurn();

	let board = gameState.board;

	for(let i = 0; i < board.length; i++) {

		let element = document.querySelector(`.square[data-id='${i}']`);

		// remove all the css classes
		element.classList.remove('blue');
		element.classList.remove('red');

		// add colors according to game state
		if(board[i] < 0)
			element.classList.add('blue');
		if(board[i] > 0)
			element.classList.add('red');
	}
}

const updateWinner = (player) => {
	document.querySelector('.winner').innerHTML = player + " wins!";

	const btn = document.querySelector('#button_div');
	btn.style.display = "block";
	btn.addEventListener('click', () => {
		let message = {
			type: 'restart'
		}
		ws.send(JSON.stringify(message));
	})
}

// respond to server push messages
ws.addEventListener('message', (message) => {
	let action = JSON.parse(message.data);

	switch(action.type) {
		case 'setup':
			gameState = action.playerData;
			initialize();
			break;
		
		case 'update':
			gameState.nextPlayer = action.nextPlayer;
			gameState.board = action.board;
			updateBoard();
			break;

		case 'victory':
			updateWinner(action.winner);
			break;
		default: console.error("Invalid action");
	}
});

ws.addEventListener('open', () => {

	let container = document.querySelector('#container');
	
	container.addEventListener('click', (event) => {
		updateTurn();

		let element = event.target;
		let message = {
			type: 'move',
			playerId: gameState.playerId,
			cellId: element.getAttribute('data-id')
		}
		ws.send(JSON.stringify(message));
	})
});

