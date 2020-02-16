import React, { useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useTheme } from '@material-ui/core/styles';
import { Legend, LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Title from './Title';

function Chart(props) {
  const { data, name, date } = props;
  const [text, setText] = useState('');
  const confidence = true;
  const theme = useTheme();

  return (
    <React.Fragment>
      {
       name &&
       (
         <div>
           <Title>{name} ({moment(date).format('MMMM DD, YYYY')}): {text.trim()}</Title>
         </div>
       )
      }
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 40,
          }}
        >
          <XAxis
            dataKey="timestamp"
            stroke={theme.palette.text.secondary}
          />
          <YAxis stroke={theme.palette.text.secondary}>
            <Label
              position="left"
              style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
            />
          </YAxis>
          <Legend verticalAlign="top" height={36}/>
          {renderLines(data, setText, theme, confidence)}
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}

function formatData(data) {
  if(!data[0].speakerTag) {
    return data;
  }

  return data.map(d => {
    const newData = Object.assign({}, d);
    if(d.speakerTag !== 1) {
      newData[`aggressionProb${d.speakerTag}`] = d.aggressionProb;
      delete newData.aggressionProb;
    }
    return newData;
  });
}

function renderLines(data, setText, theme, confidence) {
  const lines = [
   <Line key="1" name="Aggregation Probability" type="monotone" dataKey="aggressionProb" stroke={theme.palette.primary.main} dot={{ onClick: onPointClick(setText) }} />
  ];
  if(data[0].confidence && confidence) {
    lines.push(<Line key="2" name="Confidence" type="monotone" dataKey="confidence" stroke={'orange'} dot={{ onClick: onPointClick(setText) }} />)
  }
  return lines;
}

function getNumSpeakers(data) {
  if(!data || !data[0].speakerTag) {
    return 1;
  }
  return Math.max(...data.map(d => d.speakerTag));
}

function onPointClick(setText) {
  return d => {
    console.log('Data', d);
    return setText(d.payload.phrase);
  }
}

Chart.propTypes = {
  data: PropTypes.array
};

Chart.defaultProps = {
  data: []
};

export default Chart;
