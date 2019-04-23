import React from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button, Slider, Icon, Divider } from 'antd';
import placeholder from '../../../images/avatar-placeholder.png';

class EditAvatarModal extends React.Component {
  state = {
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 150,
    preview: null,
    width: 240,
    height: 240,
    loading: false
  };

  handleNewImage = e => {
    this.setState({ image: e.target.files[0] });
  };

  handleSave = data => {
    const img = this.editor.getImageScaledToCanvas().toDataURL();
    this.props.saveImage(img);
    this.props.fechar();
  };

  updateProfile = () => {};

  handleScale = value => {
    const scale = value;
    this.setState({ scale });
  };

  handleAllowZoomOut = ({ target: { checked: allowZoomOut } }) => {
    this.setState({ allowZoomOut });
  };

  rotateLeft = e => {
    e.preventDefault();

    this.setState({
      rotate: this.state.rotate - 90
    });
  };

  rotateRight = e => {
    e.preventDefault();
    this.setState({
      rotate: this.state.rotate + 90
    });
  };

  handleBorderRadius = e => {
    const borderRadius = parseInt(e.target.value, 10);
    this.setState({ borderRadius });
  };

  handleXPosition = e => {
    const x = parseFloat(e.target.value);
    this.setState({ position: { ...this.state.position, x } });
  };

  handleYPosition = e => {
    const y = parseFloat(e.target.value);
    this.setState({ position: { ...this.state.position, y } });
  };

  handleWidth = e => {
    const width = parseInt(e.target.value, 10);
    this.setState({ width });
  };

  handleHeight = e => {
    const height = parseInt(e.target.value, 10);
    this.setState({ height });
  };

  logCallback(e) {
    console.log('callback', e);
  }

  setEditorRef = editor => {
    if (editor) this.editor = editor;
  };

  handlePositionChange = position => {
    console.log('Position set to', position);
    this.setState({ position });
  };

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <AvatarEditor
          ref={this.setEditorRef}
          scale={parseFloat(this.state.scale)}
          width={this.state.width}
          height={this.state.height}
          position={this.state.position}
          onPositionChange={this.handlePositionChange}
          rotate={parseFloat(this.state.rotate)}
          onSave={this.handleSave}
          onLoadFailure={this.logCallback.bind(this, 'onLoadFailed')}
          onLoadSuccess={this.logCallback.bind(this, 'onLoadSuccess')}
          onImageReady={this.logCallback.bind(this, 'onImageReady')}
          onImageLoad={this.logCallback.bind(this, 'onImageLoad')}
          onDropFile={this.logCallback.bind(this, 'onDropFile')}
          image={
            this.state.image
              ? this.state.image
              : this.props.imagem
                ? this.props.imagem
                : placeholder
          }
        />
        <Button
          onClick={e => this.upload.click()}
          style={{ marginTop: '1rem', marginBottom: '1rem' }}
        >
          <Icon type="upload" /> Selecione a imagem
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={ref => (this.upload = ref)}
          disabled={this.state.loading}
          hidden
          onChange={this.handleNewImage}
        />
        <div className="row avatarEdit-buttons">
          <div className="col text-center">
            <h5>Zoom</h5>
            <Slider
              defaultValue={1}
              min={this.state.allowZoomOut ? 0.1 : 1}
              max={2}
              step={0.01}
              disabled={this.state.loading}
              onChange={this.handleScale}
            />
          </div>

          <h5>Girar foto</h5>
          <Button.Group>
            <Button
              type="default"
              disabled={this.state.loading}
              onClick={this.rotateLeft}
            >
              Esquerda
            </Button>
            <Button
              type="default"
              disabled={this.state.loading}
              onClick={this.rotateRight}
            >
              Direita
            </Button>
          </Button.Group>
        </div>
        <Divider />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            width: '100%'
          }}
        >
          <Button type="primary" onClick={this.handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    );
  }
}
export default EditAvatarModal;
