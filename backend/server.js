'use strict';

const WebSocketServer = require('ws');

const empty = new Array(9).fill(0);

let state = {
	players: ['one', 'two'],
	nextPlayer: 0,
	playerAmount: 0,
	board: empty
}

const resetGame = () => {
	state.nextPlayer = 0;
	state.board = empty;
}

// Handles changing the state of the board
//   also make sure only the right player is allowed to move
const playerMove = (player, cellId) => {

	// correct player makes a move
	if (player === state.players[state.nextPlayer]) {

		let cellValue = player === 'one' ? 1 : player === 'two' ? -1 : 0;

		// same goes for this one
		state.board[cellId] = cellValue

		state.nextPlayer = state.nextPlayer >= 1 ? 0 : state.nextPlayer += 1;
  }
}

// update game for both clients
const updateClientState = () => {
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocketServer.OPEN) {
			let message = {
				type:     'update',
				nextPlayer: state.players[state.nextPlayer],
				board:    state.board
			}
		
		client.send(JSON.stringify(message));
		}
  	})
}

// Creating a new websocket server on port 8080
const wss = new WebSocketServer.Server({ port: 8080 })
 
// Creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connected");

	// Send the game setup to the client
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

		console.log(message);
		console.log(action);

		switch(action.type) {
			case 'move':
				console.log("got move at " + action.cellId);
				console.log("move made by " + action.playerId);
				playerMove(action.playerId, action.cellId);
				updateClientState();
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

