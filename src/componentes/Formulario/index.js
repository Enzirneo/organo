import './Formulario.css'
import CampoTexto from '../CampoTexto';
import ListaSuspensa from '../ListaSuspensa';
import Botao from '../Botao';
import { useState } from 'react'

const Formulario = (props) => {

    const [nome, setNome] = useState('')
    const [função, setFunção] = useState('')
    const [imagem, setImagem] = useState('')
    const [jogo, setJogo] = useState('')

    const aoSalvar = (evento) => {
        evento.preventDefault()
        props.aoJogadorCadastrado({
            nome, 
            função, 
            imagem, 
            jogo
        })
        setNome('')
        setFunção('')
        setImagem('')
        setJogo('')
    }

    return(
        <section className="formulario">
            <form onSubmit={aoSalvar}>
                <h2>Preencha os dados para criar o card do Jogador</h2>
                <CampoTexto
                    obrigatorio={true} 
                    label="Nick" 
                    placeholder="Digite seu nick"
                    valor={nome}
                    aoAlterado={valor => setNome(valor)}
                />
                <CampoTexto 
                    obrigatorio={true} 
                    label="Função" 
                    placeholder="Digite sua função"
                    valor={função}
                    aoAlterado={valor => setFunção(valor)}
                />
                <CampoTexto 
                    obrigatorio={true} 
                    label="Imagem" 
                    placeholder="Digite o endereço da imagem"
                    valor={imagem}
                    aoAlterado={valor => setImagem(valor)}
                />
                <ListaSuspensa 
                    obrigatorio={true} 
                    label="Jogo"
                    itens ={props.jogos}
                    valor={jogo}
                    aoAlterado={valor => setJogo(valor)}
                />
                <div className='btn'>
                    <Botao>
                    Criar Card
                    </Botao>
                </div>
                
            </form>   
        </section>
    )

}

export default Formulario