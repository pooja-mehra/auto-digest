import { animated,useTransition, useSpring } from '@react-spring/web'
import {useEffect} from 'react';

export default function Pointer(props){
    const {position} = props
    useEffect(()=>{
        console.log(position)
    })
    const cursorAnime = useSpring({
        from: { opacity:0.5},
        to: [
          
          { opacity:0},
          {opacity:0.5},
          { opacity:0},
          {opacity:0.5},
        ],
        loop: false,
      })
        return(
          <animated.div style={{
            width: 30,
            height: 30,
            background: 'pink',
            borderRadius: 30,
            ...cursorAnime
            }}>
        </animated.div>
        )
    
}