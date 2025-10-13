import NumberSpeechTrainer from './components/NumberSpeechTrainer'
import { Analytics } from '@vercel/analytics/react';
import TrainerSelector from './components/TrainerSelector';

function App() {
  return  (

        <div className="App">
          <TrainerSelector />
          <Analytics />
        </div>


    );
}

export default App