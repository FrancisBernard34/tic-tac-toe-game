import React, { useState, useEffect } from "react";
import lightIcon from "./icons/light-icon.svg";
import darkIcon from "./icons/dark-icon.svg";

export default function Game() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [aiSymbol, setAiSymbol] = useState(null);
  const [playerIsNext, setPlayerIsNext] = useState(null);
  const [status, setStatus] = useState("Choose your symbol");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (aiSymbol && !playerIsNext && !calculateWinner(squares)) {
      const aiMoveTimeout = setTimeout(() => {
        const aiSquares = aiMove(squares, aiSymbol);
        setSquares(aiSquares);
        setPlayerIsNext(true);
      }, 1200);

      return () => clearTimeout(aiMoveTimeout);
    }

    if (localStorage.getItem("isDarkMode") === "true") {
      document.body.classList.add("dark-mode");
      setIsDarkMode(true);
    }
  }, [aiSymbol, playerIsNext, squares]);

  function handleSymbolChoice(symbol) {
    setPlayerSymbol(symbol);
    setAiSymbol(symbol === "X" ? "O" : "X");
    setPlayerIsNext(Math.random() < 0.5);
  }

  function handlePlay(index) {
    if (playerIsNext === false) return;
    if (squares[index] || calculateWinner(squares)) return;

    const newSquares = squares.slice();
    newSquares[index] = playerIsNext ? playerSymbol : aiSymbol;
    setSquares(newSquares);
    setPlayerIsNext(!playerIsNext);
  }

  function gameReset() {
    setSquares(Array(9).fill(null));
    setPlayerSymbol(null);
    setAiSymbol(null);
    setPlayerIsNext(null);
    setStatus("Choose your symbol");
  }

  function toggleDarkMode() {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      localStorage.setItem("isDarkMode", newMode);
      return newMode;
    });
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
            <button onClick={() => handleSymbolChoice("X")}>X</button>
            <button onClick={() => handleSymbolChoice("O")}>O</button>
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
        <Board
          squares={squares}
          onPlay={handlePlay}
          status={status}
          playerIsNext={playerIsNext}
          playerSymbol={playerSymbol}
          aiSymbol={aiSymbol}
        />
      </div>
      <button className="game-controls">
        <button onClick={() => gameReset()}>Restart</button>
      </button>
    </div>
  );
}

function aiMove(squares, aiSymbol) {
  const availableMoves = squares
    .map((square, index) => (square === null ? index : null))
    .filter((index) => index !== null);

  const randomMove =
    availableMoves[Math.floor(Math.random() * availableMoves.length)];
  const newSquares = squares.slice();
  newSquares[randomMove] = aiSymbol;

  return newSquares;
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({
  squares,
  onPlay,
  status,
  playerIsNext,
  playerSymbol,
  aiSymbol,
}) {
  const winner = calculateWinner(squares);
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (!squares.includes(null)) {
    status = "Draw!";
  } else {
    status = playerIsNext
      ? `Player's turn (${playerSymbol})`
      : `AI's turn (${aiSymbol})`;
  }

  function handleClick(i) {
    onPlay(i);
  }

  return (
    <>
      <div className="status">
        <h1>{status}</h1>
      </div>
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
