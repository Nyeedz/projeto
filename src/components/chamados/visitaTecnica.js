import React from 'react';
import { Input } from 'antd';
import * as moment from 'moment';
const { TextArea } = Input;

export default class VisitaTecnica extends React.Component {
  state = {
    chamado: null,
    currentImage: ''
  };

  componentWillMount = () => {
    const { chamado } = this.props;

    this.setState({
      chamado,
      currentImage: chamado.files.length > 0 ? chamado.files[0]._id : null
    });

    console.log(this.props.chamado);
  };

  previousPicture = () => {
    const { chamado, currentImage } = this.state;
    const index = chamado.files.findIndex(file => file._id === currentImage);

    if (index > 0) {
      this.setState({
        currentImage: chamado.files[index - 1]._id
      });
    }
  };

  nextPicture = () => {
    const { chamado, currentImage } = this.state;
    const index = chamado.files.findIndex(file => file._id === currentImage);

    if (chamado.files.length > index + 1) {
      this.setState({
        currentImage: chamado.files[index + 1]._id
      });
    }
  };

  render() {
    const { chamado } = this.state;

    return (
      <div className="analise-box">
        <div className="left-panel">
          {!chamado.problema_repetido && (
            <h3 className="repetido">Problema repetido</h3>
          )}
          <div className="tempo-visita">
            <span className="label">Melhor dia para visita: </span>
            <span className="value">{moment(chamado.data_visita).format('DD/MM/YYYY HH:mm:ss')}</span>
          </div>
          <div className="block-info">
            <div>
              <h3>Cliente:</h3>
              <p>{chamado.user.nome}</p>
            </div>
            <div>
              <h3>Contato:</h3>
              <p>{chamado.contato}</p>
            </div>
          </div>
          <div className="block-info">
            <div>
              <h3>Topologia:</h3>
              <p>{chamado.tipologia.nome}</p>
            </div>
            <div>
              <h3>Unidade:</h3>
              <p>{chamado.unidade.nome}</p>
            </div>
          </div>
          <div className="block-info">
            <div>
              <h3>Garantia:</h3>
              <p>{chamado.garantia.nome}</p>
            </div>
            <div>
              <h3>Subitem:</h3>
              <p>{chamado.subitem ? chamado.subitem.nome : 'n disponível'}</p>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="carousel">
            {chamado.files.map(file => {
              return (
                <img
                  key={file._id}
                  className="carousel-image"
                  style={{
                    display:
                      this.state.currentImage == file._id ? 'block' : 'none'
                  }}
                  src={`http://localhost:1337${file.url}`}
                />
              );
            })}
            <button
              className="carousel-button left"
              onClick={this.previousPicture}
            >
              {'<'}
            </button>
            <button
              className="carousel-button right"
              onClick={this.nextPicture}
            >
              {'>'}
            </button>
          </div>
          <div className="comentario">
            <p>Comentário</p>
            <TextArea rows={4} value={chamado.comentario} readOnly={true} />
          </div>
        </div>
      </div>
    );
  }
}
