import Stream from './components/Stream'
import Listen from './components/Listen'

import './App.css'

function App() {
  return (
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
  )
}

export default App
