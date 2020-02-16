import React from 'react';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import { AiFillWarning } from 'react-icons/ai'
import Title from './Title';

export default function Transcribe(props) {
  const { data } = props;

  return (
    <React.Fragment>
      <Title>Dialogue Tracker</Title>
      {renderLines(data)}
    </React.Fragment>
  );
}

function renderLines(data) {
  const startDate = data[0] ? data[0].timestamp : 0;
  return data.map(d => {
    let text = `${moment(d.timestamp - startDate).format('mm:ss')}`;
    if(d.speakerTag) {
      text += ` (Speaker ${d.speakerTag})`;
    }
    text += ` ${d.phrase}`;
    const textComponent = <Typography color={d.isAggression ? 'secondary' : 'primary' }>{text}</Typography>
    if(d.isAggression) {
      return (
        <div>
          <AiFillWarning />
          {textComponent}
        </div>
      )
    }
    return textComponent
  })
}
