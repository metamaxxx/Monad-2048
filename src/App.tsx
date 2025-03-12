import { ChakraProvider, Box } from '@chakra-ui/react'
import { Game2048 } from './components/Game2048'

function App() {
  return (
    <ChakraProvider>
      <Box 
        minH="100vh" 
        bg="purple.700" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Game2048 />
      </Box>
    </ChakraProvider>
  )
}

export default App
