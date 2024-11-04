import { useEffect, useState } from "react";
import { ChessBoard } from "../components/Chessboard";
import { Chess } from "chess.js";
import { useSocket } from "../hooks/socket";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const INVALID_MOVE = "invalid_move";

export const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameOver, setGameOver] = useState(false);
  const [invalidMove, setInvalidMove] = useState(false);
  const [gameStatus, setGameStatus] = useState("");
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    try {
      if (!socket) return;

      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case INIT_GAME:
            setBoard(chess.board());
            setGameOver(false);
            setGameStatus("Game started! Make your move.");
            setMoveCount(0);
            break;

          case MOVE:
            const move = message.payload;
            chess.move(move);
            setBoard(chess.board());
            setMoveCount(prev => prev + 1);
            setGameStatus(`Move ${moveCount + 1}: ${move.from} to ${move.to}`);
            break;

          case INVALID_MOVE:
            setInvalidMove(true);
            setGameStatus("Invalid move attempted!");
            break;

          case GAME_OVER:
            setGameOver(true);
            setGameStatus("Game Over!");
            break;

          default:
            console.log("Unknown message type");
            break;
        }
      };

      socket.onmessage = handleMessage;
      return () => {
        socket.onmessage = null;
      };
    } catch (err) {
      console.error(err);
      setGameStatus("An error occurred!");
    }
  }, [socket, chess, moveCount]);

  useEffect(() => {
    if (invalidMove) {
      setTimeout(() => {
        setInvalidMove(false);
      }, 3000);
    }
  }, [invalidMove]);

  if (!socket) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin text-blue-500 text-2xl">⟳</div>
          <p className="text-white text-lg">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="lg:hidden w-full bg-gray-800/50 backdrop-blur-sm fixed top-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-2xl">♟</span>
            <h1 className="text-white text-lg font-bold">Chess Game</h1>
          </div>
          <div className="text-white text-sm">
            Moves: {moveCount}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
          <div className="w-full lg:w-2/3 mt-16 lg:mt-0">
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="aspect-square w-full">
                <ChessBoard 
                  chess={chess} 
                  setBoard={setBoard} 
                  socket={socket} 
                  board={board}
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500 text-2xl">♔</span>
                <h2 className="text-xl font-bold text-white">Game Status</h2>
              </div>

              <div className={`p-4 rounded-lg mb-4 ${
                invalidMove ? 'bg-red-900/50' : 'bg-blue-900/50'
              }`}>
                <div className="text-white font-semibold mb-1">
                  {invalidMove ? "Invalid Move!" : "Status"}
                </div>
                <div className="text-gray-300 text-sm">
                  {gameStatus || "Waiting to start..."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-white text-sm">
                    Moves: {moveCount}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-white text-sm">
                    Turn: {chess.turn() === 'w' ? 'White' : 'Black'}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                {!gameOver ? (
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 
                      text-white font-medium rounded-lg transition-all duration-200 
                      hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                    onClick={() => {
                      socket.send(JSON.stringify({ type: INIT_GAME }));
                    }}
                  >
                    Start New Game
                  </button>
                ) : (
                  <div className="w-full py-3 text-center bg-yellow-500/20 rounded-lg">
                    <span className="text-yellow-500 font-bold animate-pulse">
                      Game Over!
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Click "Start New Game" to begin</li>
                <li>• Click squares to move pieces</li>
                <li>• Invalid moves will be rejected</li>
                <li>• Game ends on checkmate or stalemate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm p-4">
        <div className="flex justify-center">
          {!gameOver ? (
            <button
              type="button"
              className="w-full max-w-xs px-6 py-3 bg-green-600 hover:bg-green-700 
                text-white font-medium rounded-lg transition-colors duration-200"
              onClick={() => {
                socket.send(JSON.stringify({ type: INIT_GAME }));
              }}
            >
              Start New Game
            </button>
          ) : (
            <div className="w-full max-w-xs py-3 text-center">
              <span className="text-yellow-500 font-bold animate-pulse">
                Game Over!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;