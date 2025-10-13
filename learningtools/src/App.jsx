import NumberSpeechTrainer from './components/NumberSpeechTrainer'
import { Analytics } from '@vercel/analytics/react';

function App() {
  return  (

        <div className="App">
          <NumberSpeechTrainer />
          <Analytics />
        </div>


    );
}

export default App