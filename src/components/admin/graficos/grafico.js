import React from 'react';
import { Line } from 'react-chartjs-2';

class GraficoPergunta extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: props.chartData,
      chartOptions: {
        title: {
          display: this.props.displayTitle,
          text: 'Resumo gráfico',
          fontSize: this.props.fontSize
        },
        legend: {
          display: this.props.displayLegend,
          position: this.props.legendPosition
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    };
  }

  static defaultProps = {
    displayTitle: true,
    displayLegend: true,
    legendPosition: 'right',
    fontSize: 22
  };

  render() {
    return (
      <Line
        data={this.state.chartData}
        options={this.state.chartOptions}
        style={{ marginTop: '1rem' }}
        height={100}
        width={300}
      />
    );
  }
}

export default GraficoPergunta;
