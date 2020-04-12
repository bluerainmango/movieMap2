import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
/*import ShareIcon from '@material-ui/icons/Share';*/
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme) => ({
  root: {
    // maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '20%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
}));

export default function FilmReviewCard() {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

//rgba(210, 204, 243, 0.816)
  return (
    <Card className={classes.root} style={{backgroundColor: '#99a0f9', border: "none", boxShadow: '0px -5px 20px 20px #99a0f9', borderRadius: 'none'}}>
        <CardHeader style={{backgroundColor: '#99a0f9', color: "white"}}
          avatar={
            <Avatar aria-label="film" className={classes.avatar}>
              R
            </Avatar>
          }

          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }

          action={
            <IconButton aria-label="add to favorites">
              <FavoriteIcon />
            </IconButton>
          }
          
          title={<div class="headerTitle" style={{fontSize:'34px', fontWeight: 'bold'}}>Movie Title</div>
            
          }
        />
      

        <CardContent style={{
          padding: '0px',
          backgroundColor: 'rgba(210, 204, 243, 0.816)'
          }}>
      

          <div class="right-block" style={{
            float: 'right',
            width: '70%',
            height: '500px'
            
          }} >
            
            <img src={"https://www.moviepostersusa.com/media/easyslide/rise-of-skywalker.jpg"} alt="poster" style={{height: '500px', width:'100%'}} />

          </div>

          <div class="left-block" style={{ 
            color: '#fff', 
            //backgroundColor: "rgba(210, 204, 243, 0.816)",
            backgroundColor: "#99a0f9",
            float: 'right',
            width: '30%',
            height: '500px',
            boxShadow: '100px 0px 150px 250px #99a0f9'
            }} >
          <Typography>Summary</Typography>
          <Typography>Rating</Typography>
          <Typography>Genre</Typography>
          <Typography>Cast</Typography>
          <Typography>Trailer</Typography>
          <Typography>Watch Options</Typography>
          </div>
        

        </CardContent>
    </Card>
  );
}

//https://www.moviepostersusa.com/media/easyslide/rise-of-skywalker.jpg
//https://cdn.cinematerial.com/p/297x/haeorwgk/1917-british-movie-poster-md.jpg?v=1579166770