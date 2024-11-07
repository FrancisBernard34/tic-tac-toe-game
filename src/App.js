import React, { useState, useEffect, useRef } from "react";
import lightIcon from "./icons/light-icon.svg";
import darkIcon from "./icons/dark-icon.svg";

export default function Game() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [lastSquares, setLastSquares] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [aiSymbol, setAiSymbol] = useState(null);
  const [playerIsNext, setPlayerIsNext] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Choose your symbol");
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesCountForChangeDifficulty, setGamesCountForChangeDifficulty] =
    useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [resetting, setResetting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const aiMoveTimeout = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("isDarkMode") === "true") {
      document.body.classList.add("dark-mode");
      setIsDarkMode(true);
    }

    const savedGamesPlayed = localStorage.getItem("gamesPlayed");
    if (savedGamesPlayed) setGamesPlayed(parseInt(savedGamesPlayed));

    const savedDifficultyLevel = localStorage.getItem("difficultyLevel");
    if (savedDifficultyLevel)
      setDifficultyLevel(parseInt(savedDifficultyLevel));

    const savedGamesCountForChangeDifficulty = localStorage.getItem(
      "gamesCountForChangeDifficulty"
    );
    if (savedGamesCountForChangeDifficulty)
      setGamesCountForChangeDifficulty(
        parseInt(savedGamesCountForChangeDifficulty)
      );

    if (playerIsNext === true) {
      setStatusMessage(`Player's turn (${playerSymbol})`);
    } else if (playerIsNext === false) {
      setStatusMessage(`AI's turn (${aiSymbol})`);
      handleAiMove();
    }
  }, [playerIsNext]);

  useEffect(() => {
    if (gamesCountForChangeDifficulty > 6 && difficultyLevel === 2) {
      setDifficultyLevel(3);
      localStorage.setItem("difficultyLevel", 3);
    } else if (gamesCountForChangeDifficulty > 3 && difficultyLevel === 1) {
      setDifficultyLevel(2);
      localStorage.setItem("difficultyLevel", 2);
    }
  }, [gamesCountForChangeDifficulty, difficultyLevel]);

  function handleSymbolChoice(symbol) {
    setPlayerSymbol(symbol);
    setAiSymbol(symbol === "X" ? "O" : "X");
    setPlayerIsNext(Math.random() < 0.5);
  }

  function changeStatusMessage(playerIsNext, winner) {
    if (winner) {
      if (winner === playerSymbol) {
        setStatusMessage("You won!");
      } else {
        setStatusMessage("You lost!");
      }
    } else if (!squares.includes(null)) {
      setStatusMessage("Draw!");
    } else {
      setStatusMessage(
        playerIsNext
          ? `Player's turn (${playerSymbol})`
          : `AI's turn (${aiSymbol})`
      );
    }
  }

  function aiMove(squares, playerSymbol, aiSymbol) {
    if (difficultyLevel === 1) return randomMove(squares, aiSymbol);
    if (difficultyLevel == 2)
      return blockingMove(squares, playerSymbol, aiSymbol);

    return minimaxMove(squares, aiSymbol, playerSymbol);
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
      setSquares(aiSquares);

      if (calculateWinner(aiSquares) === aiSymbol) {
        setStatusMessage("You lost.");
        setGamesPlayed(gamesPlayed + 1);
        localStorage.setItem("gamesPlayed", gamesPlayed + 1);
      } else if (aiSquares.every((square) => square !== null)) {
        setStatusMessage("Draw!");
        setGamesPlayed(gamesPlayed + 1);
        localStorage.setItem("gamesPlayed", gamesPlayed + 1);
      } else {
        changeStatusMessage(playerIsNext, null);
        setPlayerIsNext(true);
      }
    }, 1200);
  }

  function handlePlayerMove(index) {
    if (playerIsNext === false || squares[index] || calculateWinner(squares))
      return;

    setIsButtonDisabled(false);
    setLastSquares(squares);
    const newSquares = squares.slice();
    newSquares[index] = playerIsNext ? playerSymbol : aiSymbol;
    setSquares(newSquares);
    if (calculateWinner(newSquares) === playerSymbol) {
      setStatusMessage("You won!");
      setGamesPlayed(gamesPlayed + 1);
      setGamesCountForChangeDifficulty(gamesCountForChangeDifficulty + 1);
      localStorage.setItem("gamesPlayed", gamesPlayed + 1);
      localStorage.setItem(
        "gamesCountForChangeDifficulty",
        gamesCountForChangeDifficulty + 1
      );
    } else if (newSquares.every((square) => square !== null)) {
      setStatusMessage("Draw!");
      setGamesPlayed(gamesPlayed + 1);
      localStorage.setItem("gamesPlayed", gamesPlayed + 1);
    } else {
      setPlayerIsNext(false);
    }
  }

  function randomMove(squares, aiSymbol) {
    const availableMoves = squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    const randomMove =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const newSquares = squares.slice();
    newSquares[randomMove] = aiSymbol;

    return newSquares;
  }

  function blockingMove(squares, playerSymbol, aiSymbol) {
    const availableMoves = squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    for (let index of availableMoves) {
      const testSquares = squares.slice();
      testSquares[index] = aiSymbol;
      if (calculateWinner(testSquares) === aiSymbol) {
        testSquares[index] = aiSymbol;
        return testSquares;
      }
    }

    for (let index of availableMoves) {
      const testSquares = squares.slice();
      testSquares[index] = playerSymbol;
      if (calculateWinner(testSquares) === playerSymbol) {
        testSquares[index] = aiSymbol;
        return testSquares;
      }
    }

    return randomMove(squares, aiSymbol);
  }

  function minimax(squares, isMaximizing, aiSymbol, playerSymbol) {
    const winner = calculateWinner(squares);

    if (winner === aiSymbol) return { score: 1 };
    if (winner === playerSymbol) return { score: -1 };
    if (squares.every(Boolean)) return { score: 0 };

    const availableMoves = squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = null;
      for (const index of availableMoves) {
        const newSquares = squares.slice();
        newSquares[index] = aiSymbol;
        const result = minimax(newSquares, false, aiSymbol, playerSymbol);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = index;
        }
      }
      return { index: bestMove, score: bestScore };
    } else {
      let bestScore = Infinity;
      let bestMove = null;
      for (const index of availableMoves) {
        const newSquares = squares.slice();
        newSquares[index] = playerSymbol;
        const result = minimax(newSquares, true, aiSymbol, playerSymbol);
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = index;
        }
      }
      return { index: bestMove, score: bestScore };
    }
  }

  function minimaxMove(squares, aiSymbol, playerSymbol) {
    if (squares.every((square) => square === null)) {
      const randomMove = Math.floor(Math.random() * squares.length);
      const newSquares = squares.slice();
      newSquares[randomMove] = aiSymbol;
      return newSquares;
    }
    const bestMove = minimax(squares, true, aiSymbol, playerSymbol);
    const newSquares = squares.slice();
    newSquares[bestMove.index] = aiSymbol;
    return newSquares;
  }

  function gameReset() {
    setResetting(true);

    if (aiMoveTimeout.current) {
      clearTimeout(aiMoveTimeout.current);
      aiMoveTimeout.current = null;
    }

    setSquares(Array(9).fill(null));
    setPlayerSymbol(null);
    setAiSymbol(null);
    setPlayerIsNext(null);
    setStatusMessage("Choose your symbol");

    setTimeout(() => setResetting(false), 300);
  }

  function aiReset() {
    setGamesCountForChangeDifficulty(0);
    setDifficultyLevel(1);
    localStorage.setItem("difficultyLevel", 1);
    localStorage.setItem("gamesCountForChangeDifficulty", 0);
  }

  function goBackOneMove() {
    if (playerIsNext === false) return;

    setIsButtonDisabled(true);
    setSquares(lastSquares);
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
