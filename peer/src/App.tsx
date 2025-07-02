import Stream from './components/Stream'
import Listen from './components/Listen'

import './App.css'
import PeerProvider from './providers/PeerProvider'

function App() {
  return (
    <PeerProvider>
      <div 
        className='app box flex' 
        style={{ 
          flexDirection: 'column', 
          justifyContent: 'space-around', 
          alignItems: 'stretch' 
        }}
      >
        <Stream />
        <Listen />
      </div>
    </PeerProvider>
  )
}

export default App
