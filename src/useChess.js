import React, { useCallback, useState } from 'react';
import { Chess } from 'chess.js';

const useChess = ({ onLegalMove, onIllegalMove, onGameOver } = {}) => {
    const [game, setGame] = useState(new Chess());
    const [history, setHistory] = useState([]);
    const [position, setPosition] = useState(game.fen());

    const makeMove = useCallback((move) => {
        if (game.move(move)) {
            setHistory(game.history());
            setPosition(game.fen());

            if (onLegalMove) onLegalMove(move);
            if (game.game_over() && onGameOver) onGameOver();

            return;
        }

        if (onIllegalMove) onIllegalMove(move);
    }, [game, onGameOver, onLegalMove, onIllegalMove, setHistory]);

    const reset = useCallback(() => {
        game.reset();
        setHistory(game.history());
        setPosition(game.fen());
    }, [game]);

    const undo = useCallback(() => {
        game.undo();
        setHistory(game.history());
        setPosition(game.fen());
    }, [game]);

    return { move: makeMove, history, position, reset, undo };
};

export { useChess };
