import { Button, Input } from 'antd';
import * as moment from 'moment';
import {
  PdfMakeWrapper,
  Columns,
  Txt,
  Stack,
  Table,
  Cell,
  Img
} from 'pdfmake-wrapper';
import React from 'react';
const { TextArea } = Input;

export default class VisitaTecnica extends React.Component {
  state = {
    chamado: null,
    currentImage: '',
    currentImageTecnica: '',
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

  downloadDocument = async () => {
    const { chamado } = this.props;
    const pdf = new PdfMakeWrapper();

    this.setState({ enviando: true });
    const data_encerramento = moment(
      chamado.data_encerramento.substring(0, 10) +
        '' +
        chamado.data_encerramento.substring(11, 19),
      'YYYY-MM-DD HH:mm:ss'
    ).format('DD/MM/YYYY HH:mm:ss');
    const data_abertura = moment(
      chamado.data_abertura.substring(0, 10) +
        '' +
        chamado.data_abertura.substring(11, 19),
      'YYYY-MM-DD HH:mm:ss'
    ).format('DD/MM/YYYY HH:mm:ss');
    const data_visita = moment(
      chamado.data_visita.substring(0, 10) +
        '' +
        chamado.data_visita.substring(11, 19),
      'YYYY-MM-DD HH:mm:ss'
    ).format('DD/MM/YYYY HH:mm:ss');

    console.log(chamado);

    pdf.add(
      new Txt('Informações do chamado')
        .bold()
        .fontSize(24)
        .alignment('center').end
    );

    pdf.add(pdf.ln(1));
    pdf.add(
      new Txt(chamado.procedente ? 'Procedente' : 'Improcedente')
        .bold()
        .fontSize(18)
        .color(chamado.procedente ? 'green' : 'red')
        .alignment('center').end
    );

    if (chamado.problema_repetido) {
      pdf.add(pdf.ln(1));
      pdf.add(
        new Txt('Problema repetido')
          .bold()
          .fontSize(16)
          .color('red')
          .alignment('center').end
      );
    }

    pdf.add(pdf.ln(5));
    pdf.add(new Txt('Cliente: ').bold().fontSize(16).end);
    pdf.add(pdf.ln(1));
    pdf.add(
      new Txt(chamado.user.tipo_morador ? 'Sindico' : 'Morador').bold().end
    );
    pdf.add(pdf.ln(2));
    pdf.add(
      new Columns([
        `Nome: ${chamado.user.nome} ${chamado.user.sobrenome}`,
        new Txt('Data de abertura do chamado: ').bold().alignment('right').end
      ]).end
    );
    pdf.add(
      new Columns([
        'Email: ' + chamado.user.email,
        new Txt(data_abertura).alignment('right').end
      ]).end
    );
    pdf.add(
      new Columns([
        '',
        new Txt('Data de visita: ').bold().alignment('right').end
      ]).end
    );
    pdf.add(
      new Columns([
        'Telefone: ' + chamado.user.telefone,
        new Txt(data_visita).alignment('right').end
      ]).end
    );
    pdf.add(
      new Columns([
        '',
        new Txt('Data de encerramento do chamado: ').bold().alignment('right')
          .end
      ]).end
    );
    pdf.add(
      new Columns(['', new Txt(data_encerramento).alignment('right').end]).end
    );
    new Columns();
    pdf.add(pdf.ln(3));
    pdf.add(
      new Table([
        [
          '',
          new Txt('Condominio').bold().end,
          new Txt('Tipologia').bold().end,
          new Txt(this.getRightColumnTipologiaTitle(chamado)).bold().end,
          new Txt('Garantia').bold().end,
          new Txt('Subitem garantia').bold().end
        ],
        [
          new Txt('Nome:').bold().end,
          chamado.condominio.nome,
          chamado.tipologia.nome,
          this.getRightColumnTipologiaData(chamado),
          chamado.garantia.nome,
          chamado.subitem.nome
        ]
      ]).alignment('center').end
    );
    pdf.add(pdf.ln(2));
    pdf.add(new Txt('Comentário: ').bold().fontSize(16).end);
    pdf.add(pdf.ln(1));
    pdf.add(chamado.comentario);
    pdf.add(pdf.ln(8));

    pdf.add(new Txt('Fotos do cliente: ').bold().fontSize(16).end);
    pdf.add(pdf.ln(1));

    const fotos = await Promise.all(
      chamado.fotos.map(foto => {
        return new Img(`http://191.252.59.98:7100${foto.url}`)
          .width(510)
          .margin([0, 0, 0, 10])
          .build();
      })
    );

    fotos.map(item => {
      pdf.add(item);
    });

    pdf.add(new Txt('Fotos técnicas: ').bold().fontSize(16).end);
    pdf.add(pdf.ln(1));

    const fotosTecnicas = await Promise.all(
      chamado.fotosTecnicas.map(foto => {
        return new Img(`http://191.252.59.98:7100${foto.url}`)
          .width(510)
          .margin([0, 0, 0, 10])
          .build();
      })
    );

    fotosTecnicas.map(item => {
      pdf.add(item);
    });

    pdf.pageMargins([40, 60, 40, 60]);
    pdf.header(moment().format('LLLL'));

    pdf.create().download();

    this.setState({ enviando: false });
  };

  getRightColumnTipologiaTitle = chamado => {
    if (chamado.unidade) {
      return 'Unidade';
    }

    if (chamado.areacomumgeral) {
      return 'Área comum geral';
    }

    if (chamado.areatipologia) {
      return 'Área comum tipologia';
    }
  };

  getRightColumnTipologiaData = chamado => {
    if (chamado.unidade) {
      return chamado.unidade.nome;
    }

    if (chamado.areacomumgeral) {
      return chamado.areacomumgeral.nome;
    }

    if (chamado.areatipologia) {
      return chamado.areatipologia.nome;
    }
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
          <Button
            type="primary"
            icon="download"
            loading={this.state.enviando}
            onClick={this.downloadDocument}
          >
            Baixar documento
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
