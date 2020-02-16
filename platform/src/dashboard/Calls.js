import React, { useState} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';
import Sound from 'react-sound';
import { AiFillPlayCircle, AiFillPauseCircle } from 'react-icons/ai';



function Row(props) {


          let [play, setPlay] = useState(false);
          let [pos, setPosition] = useState(0);

            let { row, onCallClick } = props;
            console.log(props);
             let agressionCount = 0;
             let insultCount = 0;
             for (let i = 0; i < row.sentences.length; i++) {
               if (row.sentences[i].aggressionProb > 0.5 && row.sentences[i].aggressionProb < 0.8) {
                 agressionCount++;
               } else if (row.sentences[i].aggressionProb >= 0.75) {
                  insultCount++;
               }
             }
            return (
              <TableRow onClick={() => onCallClick(row)} key={row._id}>
                <TableCell>
                  {row.audioUrl ? <>
                  <Sound
                    url={row.audioUrl}
                    playStatus={play ? Sound.status.PLAYING : Sound.status.PAUSED}
                    position={pos}
                    onPlaying={({ position }) => setPosition(position)}
                    onFinishedPlaying={() => { setPosition(0); setPlay(false)}}
                  />
                  {play ? <AiFillPauseCircle onClick={() => setPlay(false)} /> :
                  <AiFillPlayCircle onClick={() => setPlay(true)} />}
                  </> : <>{"   "}</> }
                  {" " + row.name}
                </TableCell>

                <TableCell>{row.createdAt.toString()}</TableCell>
                <TableCell>{agressionCount}</TableCell>
                <TableCell>{insultCount}</TableCell>
              </TableRow>
            );

}

export default function Orders(props) {



  const { calls, onCallClick } = props;
  console.log(calls);
  return (
    <React.Fragment>
      <Title>Recent Calls</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>

            <TableCell>Date</TableCell>
            <TableCell>Aggressions</TableCell>
            <TableCell>Insults</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {calls.map(row => <Row row={row} onCallClick={onCallClick}/>)}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
