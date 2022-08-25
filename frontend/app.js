'use strict';

const ws = new WebSocket('ws://localhost:8080');

// tracking game state on client
let gameState = {
	nextPlayer: undefined,
	playerId: 	undefined,
	board: 		new Array(9).fill(0)
};

// set up game for the first time
const initialize = () => {
	setDOM();
	updateBoard();
	updateTurn();
}

// set up DOM elements in the start of game
const setDOM = () => {
	document.querySelector('.player_name').innerHTML = `You are player ${gameState.playerId}`;
	document.querySelector('#button_div').style.display = "none";
	document.querySelector('.player_turn').style.display = "block";
	document.querySelector('.winner').innerHTML = "";
}

// show player turn in DOM
const updateTurn = () => {
	document.querySelector(".player_turn").innerHTML = gameState.playerId === gameState.nextPlayer
		? "Your turn" : "Opponent's turn";
}

const updateBoard = () => {
	
	let board = gameState.board;

	for(let i = 0; i < board.length; i++) {

		let element = document.querySelector(`.square[data-id='${i}']`);

		// remove previously added css classes
		element.classList.remove('blue');
		element.classList.remove('red');

		// add colors according to game state
		if(board[i] < 0)
			element.classList.add('blue');
		if(board[i] > 0)
			element.classList.add('red');
	}
}

// update clients if winner is found
const updateWinner = (player) => {
	document.querySelector('.winner').innerHTML = player + " wins!";
	document.querySelector('.player_turn').style.display = "none";

	const btn = document.querySelector('#button_div');
	btn.style.display = "block";

	// if any of the clients presses button, new game will start for all clients
	btn.addEventListener('click', () => {
		let message = {
			type: 'restart'
		}
		ws.send(JSON.stringify(message));
	})
}

// respond to server messages
ws.addEventListener('message', (message) => {
	let action = JSON.parse(message.data);

	switch(action.type) {
		// initial setup for all clients
		case 'setup':
			gameState = action.playerData;
			initialize();
			break;
	
		// update client if something changes on the board
		case 'update':
			gameState.nextPlayer = action.nextPlayer;
			gameState.board = action.board;
			updateBoard();
			updateTurn();
			break;

		// server finds a victory
		case 'victory':
			updateWinner(action.winner);
			break;
	
		// other client decides to restart
		case 'restart':
			setDOM();
			break;
		default: console.error("Invalid action");
	}
});

// send client moves to server
ws.addEventListener('open', () => {

	let container = document.querySelector('#container');
	
	container.addEventListener('click', (event) => {
		
		// update dom
		updateTurn();

		// the clicked square
		let element = event.target;

		let message = {
			type: 'move',
			playerId: gameState.playerId,
			cellId: element.getAttribute('data-id')
		}
		ws.send(JSON.stringify(message));
	})
});

