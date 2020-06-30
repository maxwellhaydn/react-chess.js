# react-chess.js

React hook for the [chess.js][1] library.

react-chess.js provides a custom React hook, `useChess`, that makes it easier to
integrate the popular [chess.js][1] library into your React app. [chess.js][1]
provides move validation, PGN import/export, piece movement, and
check/checkmate/stalemate/draw detection, but no chessboard (for that see
[chessboardjsx](https://github.com/willb335/chessboardjsx), for example).

react-chess.js hides most of the imperative code in [chess.js][1] so you can
focus on building declarative React components. Currently it only exposes a
portion of the [chess.js][1] API, including:

* piece movement
* move validation
* callbacks for check, checkmate, draw, stalemate, threefold repetition,
  insufficient material, and game over
* board position in FEN notation

The rest of the API will be added in future releases.

## Installation

    npm install --save react-chess.js

React 16.8.0+ is a peer dependency, so you must install it yourself.

## Importing

    import useChess from 'react-chess.js'; // ES module
    const useChess = require('react-chess.js'); // CommonJS

### CDN

If you don't want to import `useChess` into you application, you can load it
from the CDN and use it globally via `window.useChess`:

    <script src="https://unpkg.com/react-chess.js"></script>

## Usage

The following example shows some of the features of the `useChess` hook:

    import React from 'react';
    import useChess from 'react-chess.js';

    const moves = ['e4', 'e5', 'Ba8', 'Nf3'];

    const App = (props) => {
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

Each time you click the "Move" button, a move will be attempted, in the order
e4, e5, Ba8, and Nf3. When a move is made, a message is logged to the console
indicating whether it was legal or illegal. The current board position in
Forsyth-Edwards notation, the player whose turn it is, and the list of moves
made so far are shown and updated automatically after each move. Clicking "Undo"
undoes the last move, while clicking "Reset" resets the board to the starting
position.

### Arguments

`useChess` takes an optional configuration object as an argument. This lets you
pass callbacks that are triggered on certain game events, like checkmate.

Note that multiple callbacks may be triggered by the same move. For example, if
you define `onLegalMove`, `onDraw`, and `onGameOver` and the game ends in a
draw, all three callbacks will be fired after the last legal move in the game.

The following callbacks are supported:

#### onLegalMove

`function(move)` _optional_

Called after a legal move has been made. The function is called with one
argument: the move that was made, expressed in standard algebraic notation
(e.g. 'Nf3').

If the move puts the other player in check or checkmate, `move` will include '+'
or '#', even if it was not included when the move was made. For example:

    const { move } = useChess({
        onLegalMove: moveMade => console.log(moveMade)
    });

    move('e4');
    move('e5');
    move('Qf3');
    move('Nc6');
    move('Qxf7'); // calls onLegalMove('Qxf7+')

#### onIllegalMove

`function(move)` _optional_

Called when an illegal or ambiguous move is attempted. The function is called
with one argument: the move that was attempted, expressed in standard algebraic
notation (e.g. 'Naxh1').

#### onGameOver

`function()` _optional_

Called when the game is over due to checkmate, stalemate, or a draw.

#### onCheck

`function()` _optional_

Called when a move puts the next player in check.

#### onCheckmate

`function()` _optional_

Called when a move puts the next player in checkmate.

#### onDraw

`function()` _optional_

Called when the game is drawn due to the 50-move rule or insufficient material.

#### onStalemate

`function()` _optional_

Called when a move puts the next player in stalemate.

#### onThreefoldRepetition

`function()` _optional_

Called when the current board position has ocurred three or more times.

#### onInsufficientMaterial

`function()` _optional_

Called when the game is drawn due to insufficient material (e.g. king vs king).

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

An array containing the moves that have been made so far in the game, in
standard algebraic notation.

#### fen

`String`

The current position of the pieces in FEN notation.

#### turn

`String`

The player whose turn it is (either 'b' for black or 'w' for white).

## License

react-chess.js is released under the [GPLv3 license](./LICENSE).

[1]: https://github.com/jhlywa/chess.js
