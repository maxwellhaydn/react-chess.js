import { useCallback, useRef, useState } from 'react';
import { Chess } from 'chess.js';

const useChess = ({ onLegalMove, onIllegalMove, onGameOver } = {}) => {
    const game = useRef(new Chess());
    const [history, setHistory] = useState([]);
    const [fen, setFen] = useState(game.current.fen());

    const makeMove = useCallback((move) => {
        if (game.current.move(move)) {
            setHistory(game.current.history());
            setFen(game.current.fen());

            if (onLegalMove) onLegalMove(move);
            if (game.current.game_over() && onGameOver) onGameOver();

            return;
        }

        if (onIllegalMove) onIllegalMove(move);
    }, [game, onGameOver, onLegalMove, onIllegalMove, setHistory]);

    const reset = useCallback(() => {
        game.current.reset();
        setHistory(game.current.history());
        setFen(game.current.fen());
    }, [game]);

    const undo = useCallback(() => {
        game.current.undo();
        setHistory(game.current.history());
        setFen(game.current.fen());
    }, [game]);

    return { move: makeMove, history, fen, reset, undo };
};

export { useChess };
