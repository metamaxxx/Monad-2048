// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Game2048 {
    mapping(address => uint256) public highScores;
    mapping(address => bool) public hasActiveGame;
    
    event MoveSubmitted(address player, string direction, uint256 score);
    event NewGame(address player);
    event GameOver(address player, uint256 score);

    function submitMove(string memory direction) public {
        require(hasActiveGame[msg.sender], "No active game");
        emit MoveSubmitted(msg.sender, direction, 0);
    }

    function startNewGame() public {
        hasActiveGame[msg.sender] = true;
        emit NewGame(msg.sender);
    }

    function endGame(uint256 score) public {
        require(hasActiveGame[msg.sender], "No active game");
        hasActiveGame[msg.sender] = false;
        
        if (score > highScores[msg.sender]) {
            highScores[msg.sender] = score;
        }
        
        emit GameOver(msg.sender, score);
    }

    function getHighScore(address player) public view returns (uint256) {
        return highScores[player];
    }
} 