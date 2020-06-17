# react-chess.js

React hook for the chess.js library.

react-chess.js provides a custom React hook, `useChess`, that makes it easier to
integrate the popular [chess.js](https://github.com/jhlywa/chess.js) library
into your React app. chess.js provides move validation, PGN import/export, piece
movement, and check/checkmate/stalemate/draw detection, but no chessboard (for
that see [chessboardjsx](https://github.com/willb335/chessboardjsx), for
example).

react-chess.js hides most of the imperative code in chess.js so you can focus on
building declarative React components. Currently it only exposes a portion of
the chess.js API, including:

* piece movement
* move validation
* game over callback
* board position in FEN notation

The rest of the API will be added in future releases.

## Installation

    npm install --save react-chess.js

Alternatively, load it in a script tag from the CDN:

    <script src="https://unpkg.com/react-chess.js"></script>

## Usage

    import React, { useState } from 'react';
    import useChess from 'react-chess.js';

    const App = (props) => {
        const moves = ['e4', 'e5', 'Ba8', 'Nf3'];

        const { move, history, fen, reset, undo, turn } = useChess({
            onLegalMove: moved => console.log(`Made move: ${moved}`),
            onIllegalMove: moved => console.log(`Illegal move: ${moved}`),
            onGameOver: () => console.log('Game over')
        });

        return (
            <div className="app">
                <h1>{turn === 'b' ? 'Black' : 'White'} to move</h1>

                <button onClick={() => move(moves.shift())}>Move</button>
                <button onClick={undo}>Undo</button>
                <button onClick={reset}>Reset</button>

                <h1>Board position:</h1>
                <p>{fen}</p>

                <h1>Move history:</h1>
                <ol>
                  {history.map((moveText, i) => (<li key={i}>{moveText}</li>))}
                </ol>
            </div>
        );
    };

### Arguments

`useChess` takes an optional configuration object as an argument. The following
properties are supported:

#### onLegalMove

`function(move)` _optional_

Called after a legal move has been made. The function is called with one
argument: the move that was made, expressed in standard algebraic notation
(e.g. 'Nf3').

#### onIllegalMove

`function(move)` _optional_

Called when an illegal or ambiguous move is attempted. The function is called
with one argument: the move that was attempted, expressed in standard algebraic
notation (e.g. 'Naxh1').

#### onGameOver

`function()` _optional_

Called when the game is over due to checkmate, stalemate, or a draw.

### Returns

`useChess` returns an object with the following properties:

#### move

`function(move)`

Make the given move. `move` should be expressed in standard algebraic notation
(e.g. 'Kh1').

#### reset

`function reset()`

Reset the game to the beginning.

#### undo

`function undo()`

Undo the last move.

#### history

`Array`

An array containing the moves that have been made so far in the game.

#### fen

`String`

The current position of the pieces in FEN notation.

#### turn

`String`

The player whose turn it is (either 'b' for black or 'w' for white).
