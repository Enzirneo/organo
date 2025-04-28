import { useState } from 'react';
import Banner from './componentes/Banner'
import Formulario from './componentes/Formulario';
import Jogo from './componentes/Jogo';

function App() {

  const jogos = [
    {
      nome: 'Valorant',
      corPrimaria: '#FF4655',
      corSecundaria: 'url("/imagens/valorant.png")'
    },

    {
      nome: 'League of Legends',
      corPrimaria: '#C8AA6E',
      corSecundaria: 'url("/imagens/lol.jpeg")'
    },

    {
      nome: 'Counter Strike 2',
      corPrimaria: '#283780',
      corSecundaria: 'url("/imagens/CS2.png")'
    },

    {
      nome: 'Dota 2',
      corPrimaria: '#FF6046',
      corSecundaria: 'url("/imagens/dota2.png")'
    },
    
    {
      nome: 'Overwatch 2',
      corPrimaria: '#F06414',
      corSecundaria: 'url("/imagens/overwatch.png")'
    },

    {
      nome: 'Rocket League',
      corPrimaria: '#E87722',
      corSecundaria: 'url("/imagens/rocketleague.png")'
    },

    {
      nome: 'Marvel Rivals',
      corPrimaria: '#F7DC2A',
      corSecundaria: 'url("/imagens/marvelrivals.png")'
    }

    
  ]

  const [jogadores, setJogadores] = useState([])

  const aoNovoJogadorAdicionado = (jogador) => {
    setJogadores([...jogadores, jogador])
  }

  return (
    <div className="App">
      <Banner />
      <Formulario jogos={jogos.map(jogo => jogo.nome)} aoJogadorCadastrado={jogador => aoNovoJogadorAdicionado(jogador)}/>
      
      {jogos.map(jogo => <Jogo 
        key={jogo.nome} 
        nome={jogo.nome}
        corPrimaria={jogo.corPrimaria}
        corSecundaria={jogo.corSecundaria}
        jogadores={jogadores.filter(jogador => jogador.jogo === jogo.nome)}
      />)}
      
    </div>
  );
}

export default App;
