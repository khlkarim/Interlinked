import Stream from './components/Stream'
import Listen from './components/Listen'

import './App.css'
import PMProvider from './providers/PMProvider'

function App() {
  return (
    <PMProvider>
      <div className='app box flex column'>
        <Stream />
        <Listen />
      </div>
    </PMProvider>
  )
}

export default App
