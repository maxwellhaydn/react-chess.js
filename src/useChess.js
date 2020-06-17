import { useReducer, useRef } from 'react';
import { Chess } from 'chess.js';

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
