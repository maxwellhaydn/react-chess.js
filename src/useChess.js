import { useCallback, useReducer, useRef } from 'react';
import { isNode } from 'browser-or-node';

let Chess;

/**
 * In CommonJS environments, chess.js exports an object with the Chess
 * constructor as a property, while on AMD environments it exports the Chess
 * constructor directly. Webpack supports both CommonJS and AMD. Due to an issue
 * in chess.js (https://github.com/jhlywa/chess.js/issues/196), you get the AMD
 * export with Webpack, so tests running in Node and code bundled with Webpack
 * cannot both use the same import signature. The following is a temporary
 * workaround until the issue in chess.js is resolved.
 */
if (isNode) {
    const chess = require('chess.js');
    Chess = chess.Chess;
}
else {
    Chess = require('chess.js');
}

const useChess = ({ onLegalMove, onIllegalMove, onGameOver } = {}) => {
    const game = useRef(new Chess());

    const initialState = {
        history: game.current.history(),
        fen: game.current.fen(),
        turn: game.current.turn()
    };

    // Used to update the values of props after every function that mutates the
    // Chess object state
    const reducer = useCallback((state, action) => {
        switch (action.type) {
            case 'update':
                return {
                    history: game.current.history(),
                    fen: game.current.fen(),
                    turn: game.current.turn()
                };
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }, [game]);

    const [state, dispatch] = useReducer(reducer, initialState);

    const makeMove = useCallback((move) => {
        if (game.current.move(move)) {
            dispatch({ type: 'update' });

            if (onLegalMove) onLegalMove(move);
            if (game.current.game_over() && onGameOver) onGameOver();

            return;
        }

        if (onIllegalMove) onIllegalMove(move);

    }, [game, onLegalMove, onIllegalMove, onGameOver]);

    const reset = useCallback(() => {
        game.current.reset();
        dispatch({ type: 'update' });
    }, [game]);

    const undo = useCallback(() => {
        game.current.undo();
        dispatch({ type: 'update' });
    }, [game]);

    return { move: makeMove, reset, undo, ...state };
};

export default useChess;
