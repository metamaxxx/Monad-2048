import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Grid, GridItem, Container, Heading, Flex, VStack } from '@chakra-ui/react';
import { GameContract } from '../contracts/GameContract';

type Board = number[][];

export const Game2048: React.FC = () => {
    const [board, setBoard] = useState<Board>([]);
    const [score, setScore] = useState(0);
    const [gameContract] = useState(new GameContract());
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [alert, setAlert] = useState<{message: string, status: 'success' | 'warning' | 'error' | 'info'} | null>(null);

    useEffect(() => {
        if (isWalletConnected) {
            initializeBoard().catch(error => {
                console.error("Error in useEffect:", error);
                showAlert("Error creating new game", "error");
            });
        }
    }, [isWalletConnected]);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        if (isWalletConnected) {
            const handleKeyDown = (event: KeyboardEvent) => {
                switch (event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        move('up');
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        move('down');
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        move('left');
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        move('right');
                        break;
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isWalletConnected, board]);

    const showAlert = (message: string, status: 'success' | 'warning' | 'error' | 'info') => {
        setAlert({ message, status });
    };

    const initializeBoard = async () => {
        try {
            await gameContract.startNewGame();
            const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
            addNewTile(newBoard);
            addNewTile(newBoard);
            setBoard(newBoard);
            setScore(0);
            showAlert("New game started", "success");
        } catch (error) {
            console.error("Error initializing game:", error);
            showAlert("Error creating new game", "error");
        }
    };

    const addNewTile = (currentBoard: Board) => {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentBoard[i][j] === 0) {
                    emptyCells.push({ i, j });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            currentBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const connectWallet = async () => {
        try {
            const connected = await gameContract.connectWallet();
            if (connected) {
                const address = await gameContract.getWalletAddress();
                setWalletAddress(address);
                setIsWalletConnected(true);
                showAlert("Wallet connected", "success");
            } else {
                showAlert("Error connecting wallet", "error");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            showAlert("Error connecting wallet", "error");
        }
    };

    const disconnectWallet = () => {
        setIsWalletConnected(false);
        setWalletAddress('');
        setBoard([]);
        setScore(0);
        showAlert("Wallet disconnected", "info");
    };

    const move = async (direction: 'up' | 'down' | 'left' | 'right') => {
        if (!isWalletConnected) {
            showAlert("Please connect wallet", "warning");
            return;
        }

        const newBoard = [...board.map(row => [...row])];
        let moved = false;
        let newScore = score;

        // Логика движения
        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                const row = newBoard[i];
                const merged = new Array(4).fill(false);
                
                if (direction === 'left') {
                    for (let j = 1; j < 4; j++) {
                        if (row[j] !== 0) {
                            let k = j;
                            while (k > 0 && (row[k - 1] === 0 || (!merged[k - 1] && row[k - 1] === row[k]))) {
                                if (row[k - 1] === 0) {
                                    row[k - 1] = row[k];
                                    row[k] = 0;
                                    k--;
                                    moved = true;
                                } else if (row[k - 1] === row[k]) {
                                    row[k - 1] *= 2;
                                    newScore += row[k - 1];
                                    row[k] = 0;
                                    merged[k - 1] = true;
                                    moved = true;
                                    break;
                                }
                            }
                        }
                    }
                } else if (direction === 'right') {
                    for (let j = 2; j >= 0; j--) {
                        if (row[j] !== 0) {
                            let k = j;
                            while (k < 3 && (row[k + 1] === 0 || (!merged[k + 1] && row[k + 1] === row[k]))) {
                                if (row[k + 1] === 0) {
                                    row[k + 1] = row[k];
                                    row[k] = 0;
                                    k++;
                                    moved = true;
                                } else if (row[k + 1] === row[k]) {
                                    row[k + 1] *= 2;
                                    newScore += row[k + 1];
                                    row[k] = 0;
                                    merged[k + 1] = true;
                                    moved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Движение вверх/вниз
            for (let j = 0; j < 4; j++) {
                const merged = new Array(4).fill(false);
                
                if (direction === 'up') {
                    for (let i = 1; i < 4; i++) {
                        if (newBoard[i][j] !== 0) {
                            let k = i;
                            while (k > 0 && (newBoard[k - 1][j] === 0 || (!merged[k - 1] && newBoard[k - 1][j] === newBoard[k][j]))) {
                                if (newBoard[k - 1][j] === 0) {
                                    newBoard[k - 1][j] = newBoard[k][j];
                                    newBoard[k][j] = 0;
                                    k--;
                                    moved = true;
                                } else if (newBoard[k - 1][j] === newBoard[k][j]) {
                                    newBoard[k - 1][j] *= 2;
                                    newScore += newBoard[k - 1][j];
                                    newBoard[k][j] = 0;
                                    merged[k - 1] = true;
                                    moved = true;
                                    break;
                                }
                            }
                        }
                    }
                } else if (direction === 'down') {
                    for (let i = 2; i >= 0; i--) {
                        if (newBoard[i][j] !== 0) {
                            let k = i;
                            while (k < 3 && (newBoard[k + 1][j] === 0 || (!merged[k + 1] && newBoard[k + 1][j] === newBoard[k][j]))) {
                                if (newBoard[k + 1][j] === 0) {
                                    newBoard[k + 1][j] = newBoard[k][j];
                                    newBoard[k][j] = 0;
                                    k++;
                                    moved = true;
                                } else if (newBoard[k + 1][j] === newBoard[k][j]) {
                                    newBoard[k + 1][j] *= 2;
                                    newScore += newBoard[k + 1][j];
                                    newBoard[k][j] = 0;
                                    merged[k + 1] = true;
                                    moved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (moved) {
            // Сначала обновляем UI
            addNewTile(newBoard);
            setBoard(newBoard);
            setScore(newScore);

            // Затем отправляем транзакцию в фоновом режиме
            gameContract.sendMove(direction).catch(error => {
                console.error("Error sending move:", error);
                showAlert("Error sending transaction", "error");
            });
        }
    };

    const getAlertColor = (status: 'success' | 'warning' | 'error' | 'info') => {
        switch (status) {
            case 'success': return 'green.500';
            case 'warning': return 'yellow.500';
            case 'error': return 'red.500';
            case 'info': return 'blue.500';
        }
    };

    if (!isWalletConnected) {
        return (
            <Box 
                w="100vw" 
                h="100vh" 
                bg="purple.100" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
            >
                <Container 
                    maxW="container.sm" 
                    centerContent 
                    bg="white" 
                    p={8} 
                    borderRadius="xl" 
                    boxShadow="2xl"
                >
                    <Heading mb={8} color="purple.700" size="2xl">Monad 2048</Heading>
                    <Button 
                        onClick={connectWallet} 
                        size="lg" 
                        colorScheme="purple"
                        w="full"
                    >
                        Connect Wallet
                    </Button>
                </Container>
            </Box>
        );
    }

    return (
        <Box 
            w="100vw" 
            h="100vh" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            bg="purple.100"
            p={[2, 3, 4]}
            overflow="auto"
        >
            <Container 
                maxW={["95%", "90%", "500px"]}
                bg="white" 
                p={[3, 4, 5]} 
                borderRadius="xl" 
                boxShadow="2xl"
                minH="min-content"
            >
                {alert && (
                    <Box
                        bg={getAlertColor(alert.status)}
                        color="white"
                        p={2}
                        borderRadius="md"
                        mb={3}
                        textAlign="center"
                        fontSize="sm"
                    >
                        {alert.message}
                    </Box>
                )}

                <Flex 
                    justify="space-between" 
                    align="center" 
                    mb={4}
                    flexDir={["column", "row"]}
                    gap={[2, 0]}
                >
                    <Heading 
                        color="purple.700" 
                        size={["md", "lg"]}
                        textAlign={["center", "left"]}
                    >
                        Monad 2048
                    </Heading>
                    <Box textAlign={["center", "right"]}>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </Text>
                        <Button 
                            onClick={disconnectWallet} 
                            size="xs" 
                            colorScheme="red" 
                            variant="outline"
                        >
                            Disconnect
                        </Button>
                    </Box>
                </Flex>

                <Text 
                    fontSize={["lg", "xl"]} 
                    mb={3} 
                    textAlign="right" 
                    color="purple.700" 
                    fontWeight="bold"
                >
                    Score: {score}
                </Text>

                <Grid 
                    templateColumns="repeat(4, 1fr)" 
                    gap={[1, 2]} 
                    bg="purple.100" 
                    p={[2, 3]} 
                    borderRadius="lg"
                    mb={4}
                    maxW="350px"
                    mx="auto"
                    w="100%"
                >
                    {board.map((row, i) =>
                        row.map((cell, j) => (
                            <GridItem
                                key={`${i}-${j}`}
                                aspectRatio="1"
                                bg={cell ? "purple.500" : "purple.200"}
                                color="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize={["md", "lg", "xl"]}
                                fontWeight="bold"
                                borderRadius="md"
                                transition="all 0.2s"
                                _hover={{
                                    transform: cell ? "scale(1.05)" : "none",
                                }}
                            >
                                {cell || ''}
                            </GridItem>
                        ))
                    )}
                </Grid>

                <Grid 
                    templateColumns="repeat(3, 1fr)" 
                    gap={[1, 2]} 
                    maxW="150px" 
                    mx="auto" 
                    mb={4}
                >
                    <Box />
                    <Button onClick={() => move('up')} colorScheme="purple" variant="outline" size="xs">↑</Button>
                    <Box />
                    <Button onClick={() => move('left')} colorScheme="purple" variant="outline" size="xs">←</Button>
                    <Box />
                    <Button onClick={() => move('right')} colorScheme="purple" variant="outline" size="xs">→</Button>
                    <Box />
                    <Button onClick={() => move('down')} colorScheme="purple" variant="outline" size="xs">↓</Button>
                    <Box />
                </Grid>

                <Button 
                    onClick={initializeBoard} 
                    colorScheme="purple" 
                    w="full"
                    size="sm"
                >
                    New Game
                </Button>
            </Container>
        </Box>
    );
}; 