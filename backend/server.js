'use strict';

const WebSocketServer = require('ws');

// tracking object of game state
let state = {
	players: ['red', 'blue'],
	nextPlayer: 0,
	playerAmount: 0,
	board: new Array(9).fill(0)
}

const playerMove = (player, cellId) => {

	// correct player makes a move
	if(player === state.players[state.nextPlayer]) {

		// set the board in correct position as the players value (1, -1)
		state.board[cellId] = player === state.players[0] ? 1 : player === state.players[1] ? -1 : 0;

		// set next player (1 -> 0, 0 -> 1)
		state.nextPlayer = state.nextPlayer >= 1 ? 0 : state.nextPlayer += 1;
  	}

	// check if this move caused a victory
	checkWin();
}

const checkWin = () => {
	// straight lines
	for(let i = 0; i < state.board.length; i++) {
		if(i === 0 || i === 3 || i === 6)
			if(state.board[i] === state.board[i + 1] && state.board[i + 1] === state.board[i + 2])
				state.board[i] === 1 ? updateVictory("Red") : state.board[i] === -1 ? updateVictory("Blue") : {};

		if(i === 0 || i === 1 || i === 2)
			if(state.board[i] === state.board[i + 3] && state.board[i + 3] === state.board[i + 6])
				state.board[i] === 1 ? updateVictory("Red") : state.board[i] === -1 ? updateVictory("Blue") : {};
	}

	// crossing lines
	if(state.board[0] === state.board[4] && state.board[4] === state.board[8])
		state.board[0] === 1 ? updateVictory("Red") : state.board[0] === -1 ? updateVictory("Blue") : {};

	if(state.board[2] === state.board[4] && state.board[4] === state.board[6])
		state.board[2] === 1 ? updateVictory("Red") : state.board[2] === -1 ? updateVictory("Blue") : {};
}

// update victory for all clients
const updateVictory = (player) => {
	wss.clients.forEach((client) => {
		if(client.readyState === WebSocketServer.OPEN) {
			let message = {
				type: 'victory',
				winner: player	
			}
			client.send(JSON.stringify(message));
		}
	})
}

// update game for both clients
const updateClientState = () => {
	wss.clients.forEach((client) => {
		if(client.readyState === WebSocketServer.OPEN) {
			let message = {
				type:     'update',
				nextPlayer: state.players[state.nextPlayer],
				board:    state.board
			}
			client.send(JSON.stringify(message));
		}
  	})
}

// update restart for all clients
const sendRestart = () => {
	wss.clients.forEach((client) => {
		if(client.readyState === WebSocketServer.OPEN) {
			let message = {
				type: 'restart'
			}
			client.send(JSON.stringify(message));
		}
	})
}

// creating a new websocket server on port 8080
const wss = new WebSocketServer.Server({ port: 8080 })
 
// creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connected");

	// send the game setup to the client
	let message = {
		type: 'setup',
		playerData: {
			nextPlayer: state.players[state.nextPlayer],
			playerId: 	state.players[state.playerAmount++],
			board:   	state.board
		}
  	}
  	ws.send(JSON.stringify(message))

	// when we receive a message from the client
	ws.on('message', (message) => {

		let action = JSON.parse(message);

		switch(action.type) {

			// handling clients moves
			case 'move':
				playerMove(action.playerId, action.cellId);
				updateClientState();
				break;

			// other client sends this message, and server responds by saying restart to all clients
			case 'restart':
				state.board = new Array(9).fill(0);
				updateClientState();
				sendRestart();
				break;

		  	default: console.error('Invalid Message');
		}
	})


	// handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has disconnected");
    });

    // connection error
    ws.onerror = () => {
        console.log("Some Error occurred");
    }
});

console.log("The WebSocket server is running on port 8080");

