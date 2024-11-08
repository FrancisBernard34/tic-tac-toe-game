import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import lightIcon from "./icons/light-icon.svg";
import darkIcon from "./icons/dark-icon.svg";
import { 
  randomMove, 
  blockingMove, 
  minimaxMove, 
  calculateWinner 
} from './helpers/aiHelpers';
import {
  setSquares,
  setLastSquares,
  setPlayerSymbol,
  setAiSymbol,
  setPlayerIsNext,
  setStatusMessage,
  setGamesPlayed,
  setGamesCountForChangeDifficulty,
  setDifficultyLevel,
  setResetting,
  setIsButtonDisabled,
  setIsDarkMode,
  resetGame,
  resetAI
} from './features/gameSlice';

export default function Game() {
  const dispatch = useDispatch();
  const {
    squares,
    lastSquares,
    playerSymbol,
    aiSymbol,
    playerIsNext,
    statusMessage,
    gamesPlayed,
    gamesCountForChangeDifficulty,
    difficultyLevel,
    resetting,
    isButtonDisabled,
    isDarkMode
  } = useSelector((state) => state.game);

  const aiMoveTimeout = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("isDarkMode") === "true") {
      document.body.classList.add("dark-mode");
      dispatch(setIsDarkMode(true));
    }

    const savedGamesPlayed = localStorage.getItem("gamesPlayed");
    if (savedGamesPlayed) dispatch(setGamesPlayed(parseInt(savedGamesPlayed)));

    const savedDifficultyLevel = localStorage.getItem("difficultyLevel");
    if (savedDifficultyLevel) dispatch(setDifficultyLevel(parseInt(savedDifficultyLevel)));

    const savedGamesCountForChangeDifficulty = localStorage.getItem("gamesCountForChangeDifficulty");
    if (savedGamesCountForChangeDifficulty) {
      dispatch(setGamesCountForChangeDifficulty(parseInt(savedGamesCountForChangeDifficulty)));
    }

    if (playerIsNext === true) {
      dispatch(setStatusMessage(`Player's turn (${playerSymbol})`));
    } else if (playerIsNext === false) {
      dispatch(setStatusMessage(`AI's turn (${aiSymbol})`));
      handleAiMove();
    }
  }, [playerIsNext]);

  useEffect(() => {
    if (gamesCountForChangeDifficulty > 6 && difficultyLevel === 2) {
      dispatch(setDifficultyLevel(3));
      localStorage.setItem("difficultyLevel", 3);
    } else if (gamesCountForChangeDifficulty > 3 && difficultyLevel === 1) {
      dispatch(setDifficultyLevel(2));
      localStorage.setItem("difficultyLevel", 2);
    }
  }, [gamesCountForChangeDifficulty, difficultyLevel]);

  function handleSymbolChoice(symbol) {
    dispatch(setPlayerSymbol(symbol));
    dispatch(setAiSymbol(symbol === "X" ? "O" : "X"));
    dispatch(setPlayerIsNext(Math.random() < 0.5));
  }

  function changeStatusMessage(playerIsNext, winner) {
    if (winner) {
      if (winner === playerSymbol) {
        dispatch(setStatusMessage("You won!"));
      } else {
        dispatch(setStatusMessage("You lost!"));
      }
    } else if (!squares.includes(null)) {
      dispatch(setStatusMessage("Draw!"));
    } else {
      dispatch(setStatusMessage(
        playerIsNext ? `Player's turn (${playerSymbol})` : `AI's turn (${aiSymbol})`
      ));
    }
  }

  function handleAiMove() {
    if (
      playerIsNext ||
      calculateWinner(squares) ||
      squares.every((square) => square !== null)
    )
      return;

    aiMoveTimeout.current = setTimeout(() => {
      const aiSquares = aiMove(squares, playerSymbol, aiSymbol);
      dispatch(setSquares(aiSquares));

      if (calculateWinner(aiSquares) === aiSymbol) {
        dispatch(setStatusMessage("You lost."));
        dispatch(setGamesPlayed(gamesPlayed + 1));
        localStorage.setItem("gamesPlayed", gamesPlayed + 1);
      } else if (aiSquares.every((square) => square !== null)) {
        dispatch(setStatusMessage("Draw!"));
        dispatch(setGamesPlayed(gamesPlayed + 1));
        localStorage.setItem("gamesPlayed", gamesPlayed + 1);
      } else {
        changeStatusMessage(playerIsNext, null);
        dispatch(setPlayerIsNext(true));
      }
    }, 1200);
  }

  function aiMove(squares, playerSymbol, aiSymbol) {
    if (difficultyLevel === 1) return randomMove(squares, aiSymbol);
    if (difficultyLevel === 2) return blockingMove(squares, playerSymbol, aiSymbol);
    return minimaxMove(squares, aiSymbol, playerSymbol);
  }

  function handlePlayerMove(index) {
    if (playerIsNext === false || squares[index] || calculateWinner(squares)) return;

    dispatch(setIsButtonDisabled(false));
    dispatch(setLastSquares(squares));

    const newSquares = squares.slice();
    newSquares[index] = playerIsNext ? playerSymbol : aiSymbol;
    dispatch(setSquares(newSquares));

    if (calculateWinner(newSquares) === playerSymbol) {
      dispatch(setStatusMessage("You won!"));
      dispatch(setGamesPlayed(gamesPlayed + 1));
      dispatch(setGamesCountForChangeDifficulty(gamesCountForChangeDifficulty + 1));
      localStorage.setItem("gamesPlayed", gamesPlayed + 1);
      localStorage.setItem("gamesCountForChangeDifficulty", gamesCountForChangeDifficulty + 1);
    } else if (newSquares.every((square) => square !== null)) {
      dispatch(setStatusMessage("Draw!"));
      dispatch(setGamesPlayed(gamesPlayed + 1));
      localStorage.setItem("gamesPlayed", gamesPlayed + 1);
    } else {
      dispatch(setPlayerIsNext(false));
    }
  }

  function gameReset() {
    dispatch(setResetting(true));
    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }
    dispatch(resetGame());
    setTimeout(() => dispatch(setResetting(false)), 300);
  }

  function aiReset() {
    dispatch(resetAI());
    localStorage.setItem("difficultyLevel", 1);
    localStorage.setItem("gamesCountForChangeDifficulty", 0);
  }

  function goBackOneMove() {
    if (playerIsNext === false) return;
    dispatch(setIsButtonDisabled(true));
    dispatch(setSquares(lastSquares));
  }

  function toggleDarkMode() {
    const newMode = !isDarkMode;
    if (newMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("isDarkMode", newMode);
    dispatch(setIsDarkMode(newMode));
  }

  if (!playerSymbol) {
    return (
      <>
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          <img src={isDarkMode ? lightIcon : darkIcon} alt="Toggle theme" />
        </button>
        <div className="symbol-choice">
          <h2>Choose your symbol</h2>
          <div className="symbol-buttons">
            <button
              onClick={() => handleSymbolChoice("X")}
              disabled={resetting}
            >
              X
            </button>
            <button
              onClick={() => handleSymbolChoice("O")}
              disabled={resetting}
            >
              O
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="game">
      <button onClick={toggleDarkMode} className="dark-mode-toggle">
        <img src={isDarkMode ? lightIcon : darkIcon} alt="Toggle theme" />
      </button>
      <div className="game-board">
        <div className="status">
          <h1>{statusMessage}</h1>
        </div>
        <Board squares={squares} onPlay={handlePlayerMove} />
      </div>
      <div className="game-controls">
        {calculateWinner(squares) === null &&
          squares.filter((square) => square === playerSymbol).length > 0 &&
          squares.some((square) => square === null) && (
            <button onClick={goBackOneMove} disabled={isButtonDisabled}>
              Go back to last move
            </button>
          )}
        <button onClick={gameReset}>
          Restart
        </button>
        <button
          onClick={() => {
            aiReset();
            gameReset();
          }}
        >
          Reset AI Difficulty
        </button>
      </div>
      <div className="game-info">
        <p>Games played: {gamesPlayed}</p>
        <p>AI difficulty: {difficultyLevel}</p>
      </div>
    </div>
  );
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ squares, onPlay }) {
  function handleClick(i) {
    onPlay(i);
  }

  return (
    <>
      <div className="row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}
