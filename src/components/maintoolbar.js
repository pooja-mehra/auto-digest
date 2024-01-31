import Toolbar from '@mui/material/Toolbar';
import { useGoogleLogin } from '@react-oauth/google';
import axios from "axios";
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import GoogleIcon from '@mui/icons-material/Google';
import Chip from '@mui/material/Chip';

export default function MainToolabr(props){
  const [user, setUser] = useState({email:'',avatar:'',userId:''})

  useEffect(()=>{
    props.setUser(user)
  },[user])

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      await axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
          headers: {
              Authorization: `Bearer ${codeResponse.access_token}`,
              Accept: 'application/json'
          }
      })
      .then((res) => {
        if(res && res.data && res.data.email){
          confirmUser(res.data.email,res.data.picture)
          alert('confirm')
        } else{
          alert('fail')
          console.log('Invalid Google Account')
        }
      })
      .catch((err) => console.log(err));
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const confirmUser = async(email,picture) =>{
    try{  
      await axios.post("http://localhost:8080/api/confirmuser",{email:email,creationDate:new Date(Date.now())}).then((res)=>{
       if(res && res.status === 200){
        setUser({email:res.data.email,avatar:picture, userId:res.data._id})
       }
      })
    } catch(e){
      console.log(e)
    }
  }
  
  return(
      <Toolbar style={{backgroundColor:'#482880'}}>
        <div style={{width: '100%',float: 'left'}}>
          <div style={{float:'right', backgroundColor:'#482880'}} >
          {
            user && user.email !== ''? 
              <Chip
                avatar={<Avatar alt="Natacha" src={user.avatar} />}
                label={user.email}
                variant="outlined"
                style={{color:'white' }}
              />
            : 
            <Chip
            avatar={<GoogleIcon size="small" style={{color:"#5393ff"}}></GoogleIcon>}
            label='SIGN IN WITH'
            variant="outlined"
            style={{color:'white' }}
            onClick={() => login()}
          />
          }
          </div>
        </div>
      </Toolbar>
    );
}