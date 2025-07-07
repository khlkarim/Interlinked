import Stream from './components/Stream'
import Listen from './components/Listen'

import './App.css'
import PMProvider from './providers/PMProvider'
import { useState } from 'react';
import { log } from './utils/logger';

export type Action = 'streaming' | 'listening' | null;

function App() {
  const [action, setAction] = useState<Action>(null);

  function handleAction(action: Action) {
    log('action :', action);
    setAction(action);
  }

  return (
    <PMProvider>
      <div className='app box flex column'>
        <Stream action={action} handleAction={handleAction} />
        <Listen action={action} handleAction={handleAction} />
      </div>
    </PMProvider>
  )
}

export default App
