import Toolbar from '@mui/material/Toolbar';
import { useGoogleLogin } from '@react-oauth/google';
import axios from "axios";
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import GoogleIcon from '@mui/icons-material/Google';
import Chip from '@mui/material/Chip';
import SideDrawer from '../shared/sidedrawer';
import ColaborateDialog from '../shared/colaboratedialog';
import { UserContext } from "../App"
import Alert from '@mui/material/Alert';
import Demo from './demo'
import { Button } from '@mui/material';
const base_url = process.env.REACT_APP_BASE_URL

export default function MainToolabr(props){
  const [user, setUser] = useState({email:'',avatar:'',userId:'', accounts:[]})
  const [colborationDilaog,setColaborationDialog] = useState(false)
  const [colaboratorDetails,setColaboratorDetails] = useState([])
  const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none',msg:''});

  useEffect(()=>{
    props.setUser(user)
  },[user])

  useEffect(()=>{
    openAlert.isOpen && openAlert.isOpen === true && setTimeout(()=>{
      setOpenAlert({isOpen:false,status:'none',msg:''})
    },2000)
  },[openAlert])

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
        if(res && res.data && res.data.email && res.data.id){
          confirmUser(res.data.email,res.data.picture,res.data.id)
        } else{
          setOpenAlert({isOpen:true,status:'error',msg:'Invalid Google Account'})
        }
      })
      .catch((err) => setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
      );
    },
    onError: (error) => setOpenAlert({isOpen:true,status:'error',msg:'Login Failed!'})
  });

  const confirmUser = async(email,picture,id) =>{
    try{  
      let res = await axios.post(`${base_url}api/confirmuser`,{email:email,creationDate:new Date(Date.now())},
      {headers: {
        Authorization: `Bearer ${id}`,
        Accept: 'application/json'}
      })
       if(res && res.status === 200){
        let accounts = [{email:'All',details:{level:'',permission:''}},{email:email,details:{level:'accounts',permission:'Owner'}}]
        let data = await getAccounts(res.data.email,res.data._id,picture)
        setUser({email:email,avatar:picture, userId:res.data._id, accounts:data && data.length >0?[...accounts,...data]:accounts})
      }
    } catch(e){
      setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
    }
  }

  const getAccounts = async(userEmail,userId,picture) =>{
    try{
        let res = await axios.get(`${base_url}api/getowneremail`,{
            params:{email:userEmail},
            headers: {
            Authorization: `Bearer ${userId}`,
            Accept: 'application/json'
        }})
        if(res && res.data && res.data.colaboratorDetails){
          let data = res.data.colaboratorDetails.map((d)=>{return {email:d.ownerEmail,details:d.details.filter((detail)=>detail.level !== 'shoppinglist')[0]}})
          .filter((p)=>p.details !== undefined).map((d)=>{return {email:d.email,details:{level:d.details.level,permission:d.details.permission}}})
          return data
        }
    } catch(e){
      console.log('No collaboration data present!')
    }

     
}
  const signout = async() =>{
    if(user && user.userId !== ''){
      /*try{  
        await axios.post(`${base_url}signout`).then((res)=>{
         if(res && res.data && res.data.dbconnect === false){*/
         setUser({email:'',avatar:'',userId:'', accounts:[]})
          window.sessionStorage.clear()
         /*}
       })
      } catch(e){
        console.log(e)
      }*/
    }
  }
  const showColaborationDialog = async() =>{
    setColaborationDialog(true)
  }

  const setColaborateDialog = (isOpen,permission,emails,listName,accountType) =>{
    if(permission && permission !== null && emails && emails.length>0 && props.user && accountType){
      setInventoryPermission(permission,emails,props.user.userId,props.user.email,accountType)
    }
    setColaborationDialog(isOpen)
  }
  const setInventoryPermission = async(permission,emails,userId,userEmail,accountType) =>{
    if(user && user.userId !== ''){
      try{
        await axios.post(`${base_url}api/setinventorycollaborator`,{colaboratorEmails:emails,permission:permission,
          invitationDate:new Date(Date.now()),level:accountType.toLowerCase(),ownerEmail:userEmail},
          {headers: {
            Authorization: `Bearer ${userId}`,
            Accept: 'application/json'}}).then((res)=>{
          })
      } catch (e){
        console.log('No collaboration data present!')
      }
  }
}
  return(
    <div>
    {
      openAlert.isOpen &&
      <Alert severity={openAlert.status}>{openAlert.msg}</Alert>
    }
      <Toolbar style={{backgroundColor:'#482880'}}>
        <div style={{width: '100%',float: 'left'}}>
        <div style={{float:'left', backgroundColor:'#482880'}} >
        <SideDrawer signout={signout} showColaborationDialog ={showColaborationDialog} />
        </div>
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
            label='SIGN IN'
            variant="outlined"
            style={{color:'white' }}
            id='googlelogin'
            onClick={() => login()}
          />
          }
          </div>
          <div style={{float:'right', backgroundColor:'#482880', marginRight:10}} >
          <Demo frame={0}/>
          </div>
        </div>
       
      </Toolbar>
      {
        colborationDilaog &&
        <UserContext.Consumer>
        {value => <ColaborateDialog colborationDilaog={colborationDilaog} setColaborateDialog={setColaborateDialog}
        listName={null} colaboratorDetails={colaboratorDetails} userId={value?value.userId:null} userEmail={value?value.email:null}/>}
        </UserContext.Consumer>
      }
      </div>
    );
}