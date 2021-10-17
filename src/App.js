import logo from './logo.svg';
import './App.scss';
import Board from './board';
import Homepage from './home'
import io from 'socket.io-client';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React, {useEffect} from 'react';
import Drawpage from './drawpage';
const  socket = io.connect('/');

function Appmain(props) {
  useEffect(()=>{console.log(props)},[])

  return (
    <React.Fragment>
      <div className="right">
         <Board
          username={props.match.params.username}
          roomname={props.match.params.roomname}
          socket={socket}
        />
      </div>
    </React.Fragment>
  );
}

function App(props) {
  
  return (
   <> 
   
<Router>
<div className="App">
  <Switch>
    <Route path="/" exact>
      <Homepage socket={socket} />
    </Route>
    <Route path="/Drawpage/:roomname/:username" component={Appmain}  />
  
  </Switch>
</div>
</Router>
   
   </>
  );
}


export default App;
