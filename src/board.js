import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import './styles/board.scss';


const Board = ({ username, roomname, socket}) => {
  const canvasRef = useRef(null);
  //const colorsRef = useRef(null);
  const  [isUserHide, setUserhide] = useState(true);
  const [users,setUsers]=useState([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    //const test = colorsRef.current;
    const context = canvas.getContext('2d');
    
    socket.on('joinRoom',(data)=>{
      let tempU=[]
      data.users.map(u=>{tempU.push({
        username : u.username,
        userId : u.id
      })})
      setUsers([...tempU]);
      const w = canvas.width;
      const h = canvas.height;
      data.points.map(point=>{
        drawLine(point.x0 * w, point.y0 * h, point.x1 * w, point.y1 * h, point.color)
      })
    })

    socket.on("hideUser",(pointsF)=>{
      console.log(pointsF);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;  
      pointsF.p_points_filtered.map(point=>{
        drawLine(point.x0 * w, point.y0 * h, point.x1 * w, point.y1 * h, point.color)
      })
    })

    socket.on("showUser",(pointsF)=>{
      const w = canvas.width;
      const h = canvas.height;  
      pointsF.p_points_filtered.map(point=>{
        drawLine(point.x0 * w, point.y0 * h, point.x1 * w, point.y1 * h, point.color)
      })
    })

    socket.on("data", (data)=>{
      setUsers([...data.users]);
    })

    socket.on('drawing', (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.data.x0 * w, data.data.y0 * h, data.data.x1 * w, data.data.y1 * h, data.data.color);
    });

    const colors = document.getElementsByClassName('color');
    console.log(colors, 'the colors');
    //console.log(test);
   
    const current = {
      color: 'black',
      x:50,
      y:50
    };

    
    const onColorUpdate = (e) => {
      current.color = e.target.className.split(' ')[1];
    };

   
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', onColorUpdate, false);
    }
    let drawing = false;

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) { return; }
      const w = canvas.width;
      const h = canvas.height;

      socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
      });
    };

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX ;
      current.y = e.clientY ;
    };

    const onMouseMove = (e) => {
      if (!drawing) { return; }
      drawLine(current.x, current.y, e.clientX , e.clientY, current.color, true);
      current.x = e.clientX ;
      current.y = e.clientY ;
      
    };

    const onMouseUp = (e) => {
      if (!drawing) { return; }
      drawing = false;
      drawLine(current.x, current.y, e.clientX , e.clientY , current.color, true);
    };

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', onMouseMove, false);

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize, false);
    onResize();
   
  }, []);

  return (
    <div>
     
        <canvas ref={canvasRef} className="whiteboard" />

        <div className="side-bar">
        <div className="wrap-colors">
           choose color <br/>
          <div  className="colors"> 
             <div className="color black" />
             <div className="color red" />
             <div className="color green" />
             <div className="color blue" />
             <div className="color yellow" />
          </div>    
        </div>
        <div className="wrap-users">
         The participants     
          {users.map((user,index)=>(<button className="buttonUser"  onClick={()=>{
             if(isUserHide){
              socket.emit('hideUserDraw',{userid : user.userId})
             }
             else{
               socket.emit('showUserDraw',{userid : user.userId})
             }
             setUserhide(!isUserHide)
            }} key={index} item={user} >{user.username}</button>))}
            </div>
        </div>
    </div>
  );
};

export default Board;