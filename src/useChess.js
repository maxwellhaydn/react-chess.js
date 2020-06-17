import { useReducer, useRef } from 'react';
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

    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'move':
                if (game.current.move(action.payload)) {
                    if (onLegalMove) onLegalMove(action.payload);
                    if (game.current.game_over() && onGameOver) onGameOver();
                }
                else {
                    if (onIllegalMove) onIllegalMove(action.payload);
                }

                break;
            case 'reset':
                game.current.reset();
                break;
            case 'undo':
                game.current.undo();
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }

        return {
            history: game.current.history(),
            fen: game.current.fen(),
            turn: game.current.turn()
        };
    }, initialState);

    return {
        move: (move) => dispatch({ type: 'move', payload: move }),
        reset: () => dispatch({ type: 'reset' }),
        undo: () => dispatch({ type: 'undo' }),
        ...state
    };
};

export default useChess;
