import Jogador from '../Jogador'
import './Jogo.css'

const Jogo = (props) => {
    return (
        <section className={`jogo jogo-${props.nome.toLowerCase().replace(/\s/g, '-')}`} style={{backgroundImage: props.corSecundaria}}>
            <h3 style={{borderColor: props.corPrimaria}}>{props.nome}</h3>
            <div className='jogadores'>{props.jogadores.map(jogador => <Jogador 
                corDeFundo={props.corPrimaria}
                key={jogador.nome}
                nome={jogador.nome} 
                função={jogador.função}
                imagem={jogador.imagem} />)}
            </div>
        </section>
    )
}

export default Jogo