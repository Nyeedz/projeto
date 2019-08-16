import { Button, Input, Upload, Icon, Divider } from 'antd';
import * as moment from 'moment';
import * as axios from 'axios';
import React from 'react';
import { url } from '../../utilities/constants';
const { TextArea } = Input;

export default class ExecucaoChamado extends React.Component {
  state = {
    chamado: null,
    comment: '',
    currentImage: '',
    currentImageTecnica: '',
    fileList: [],
    enviando: false
  };

  componentWillMount = () => {
    const { chamado } = this.props;

    this.setState({
      chamado,
      currentImage: chamado.fotos.length > 0 ? chamado.fotos[0]._id : null,
      currentImageTecnica:
        chamado.fotosTecnicas.length > 0 ? chamado.fotosTecnicas[0]._id : null
    });

    console.log(this.props.chamado);
  };

  finalizarChamado = async () => {
    try {
      const { chamado } = this.props;
      const jwt = localStorage.getItem('jwt');
      const config = {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      };
      const res = await axios.put(
        `${url}/chamados/${chamado._id}`,
        {
          status: 4,
          comentarioExecucao: this.state.comment
        },
        config
      );

      if (this.state.fileList.length > 0) {
        const adicao = await this.adicionarFotos();
        console.log(adicao);
      }

      this.props.loadChamado(chamado._id);

      console.log(res);
    } catch (err) {}
  };

  adicionarFotos = () => {
    const { fileList, selectedChamado } = this.state;
    const { chamado } = this.props;
    const jwt = localStorage.getItem('jwt');
    const fotosChamado = new FormData();

    fotosChamado.append('ref', 'chamados');
    fotosChamado.append('refId', chamado._id);
    fotosChamado.append('field', 'fotos');
    fileList.forEach(file => {
      fotosChamado.append('files', file, file.name);
    });

    const configUpload = {
      headers: {
        Accept: 'multipart/form-data',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${jwt}`
      }
    };
    return axios.post(`${url}/upload`, fotosChamado, configUpload);
  };

  previousPicture = () => {
    const { chamado, currentImage } = this.state;
    const index = chamado.fotos.findIndex(file => file._id === currentImage);

    if (index > 0) {
      this.setState({
        currentImage: chamado.fotos[index - 1]._id
      });
    }
  };

  nextPicture = () => {
    const { chamado, currentImage } = this.state;
    const index = chamado.fotos.findIndex(file => file._id === currentImage);

    if (chamado.fotos.length > index + 1) {
      this.setState({
        currentImage: chamado.fotos[index + 1]._id
      });
    }
  };

  previousPictureTecnico = () => {
    const { chamado, currentImageTecnica } = this.state;
    const index = chamado.fotosTecnicas.findIndex(
      file => file._id === currentImageTecnica
    );

    if (index > 0) {
      this.setState({
        currentImageTecnica: chamado.fotosTecnicas[index - 1]._id
      });
    }
  };

  nextPictureTecnico = () => {
    const { chamado, currentImageTecnica } = this.state;
    const index = chamado.fotosTecnicas.findIndex(
      file => file._id === currentImageTecnica
    );

    if (chamado.fotosTecnicas.length > index + 1) {
      this.setState({
        currentImageTecnica: chamado.fotosTecnicas[index + 1]._id
      });
    }
  };

  render() {
    const { chamado } = this.state;
    const uploadProps = {
      multiple: true,
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList
          };
        });
      },
      beforeUpload: file => {
        console.log(file);
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file]
        }));
        return false;
      },
      fileList: this.state.fileList
    };

    return (
      <div className="analise-box">
        <div className="left-panel">
          {!chamado.problema_repetido && (
            <h3 className="repetido">Problema repetido</h3>
          )}
          <div className="tempo-visita">
            <span className="label">Melhor dia para visita: </span>
            <span className="value">
              {moment(chamado.data_visita).format('DD/MM/YYYY HH:mm:ss')}
            </span>
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
          <Divider />
          <div className="comentario" style={{ marginBottom: '1rem' }}>
            <h2>Informações opcionais da execução</h2>
            <p>Comentário de execução</p>
            <TextArea
              rows={4}
              value={this.state.comment}
              onChange={event => {
                this.setState({
                  comment: event.target.value
                });
              }}
            />
          </div>
          <Upload {...uploadProps}>
            {this.state.fileList.length >= 4 ? (
              'Máximo 4 fotos'
            ) : (
              <Button>
                <Icon type="upload" /> Enviar fotos de execução (máximo 4)
              </Button>
            )}
          </Upload>
          <Button
            type="primary"
            style={{ marginTop: '2rem' }}
            onClick={this.finalizarChamado}
          >
            Finalizar execução do chamado
          </Button>
        </div>
        <div className="right-panel">
          <h3>Fotos do cliente</h3>
          <div className="carousel">
            {chamado.fotos.map(file => {
              return (
                <img
                  key={file._id}
                  className="carousel-image"
                  onClick={() => {
                    window.open(
                      `http://191.252.59.98:7100${file.url}`,
                      '_blank'
                    );
                  }}
                  style={{
                    display:
                      this.state.currentImage == file._id ? 'block' : 'none'
                  }}
                  src={`http://191.252.59.98:7100${file.url}`}
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
          <h3>Fotos do técnico</h3>
          <div className="carousel">
            {chamado.fotosTecnicas.map(file => {
              return (
                <img
                  key={file._id}
                  className="carousel-image"
                  onClick={() => {
                    window.open(
                      `http://191.252.59.98:7100${file.url}`,
                      '_blank'
                    );
                  }}
                  style={{
                    display:
                      this.state.currentImageTecnica == file._id
                        ? 'block'
                        : 'none'
                  }}
                  src={`http://191.252.59.98:7100${file.url}`}
                />
              );
            })}
            <button
              className="carousel-button left"
              onClick={this.previousPictureTecnico}
            >
              {'<'}
            </button>
            <button
              className="carousel-button right"
              onClick={this.nextPictureTecnico}
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
