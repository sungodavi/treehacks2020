import React from 'react';
import moment from 'moment'
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

export default function Deposits(props) {
  const classes = useStyles();
  const now = moment();
  console.log("props", props);
  let agressionCount = 0;
  let agressionProbSum = 0;
  for(let i = 0; i < props.data.length; i++) {
    if(props.data[i].isAggression) {
      agressionCount++;
      agressionProbSum += props.data[i].aggressionProb;
    }
  }

  return (
    <React.Fragment>
      <Title>Inclusivity Tracker</Title>
      <Typography component="p" variant="h4">
        {(100 -  agressionProbSum / (props.data.length ? props.data.length : 1)* 100).toFixed(2)} / 100
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        on {now.format('MMMM DD, YYYY')}
      </Typography>
      < Title > Aggression Count </Title> 
      <Typography component = "p"
      variant = "h4" >
        {
          agressionCount
        }
         { " " }/ {props.data.length} </Typography >
    </React.Fragment>
  );
}
