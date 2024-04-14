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
        await getAccounts(res.data.email,res.data._id,picture)
      }
    } catch(e){
      setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
    }
  }

  const getAccounts = async(userEmail,userId,picture) =>{
    let accounts = [{email:'All',permission:''},{email:userEmail,permission:'Owner'}]
    try{
        await axios.get(`${base_url}api/getowneremail`,{
            params:{email:userEmail},
            headers: {
            Authorization: `Bearer ${userId}`,
            Accept: 'application/json'
        }}).then((res)=>{
            if(res && res.data && res.data.colaboratorDetails){
              let data = res.data.colaboratorDetails.map((d)=>{return {email:d.ownerEmail,permission:d.details.filter((detail)=>detail.level === 'inventories')[0].permission}})
                accounts = [...accounts,...data]
            }
        })
    } catch(e){
      setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
    }
    setUser({email:userEmail,avatar:picture, userId:userId, accounts:accounts})

     
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

  const setColaborateDialog = (isOpen,permission,emails,listName) =>{
    if(permission && permission !== null && emails && emails.length>0 && props.user){
      setInventoryPermission(permission,emails,props.user.userId,props.user.email)
    }
    setColaborationDialog(isOpen)
  }
  const setInventoryPermission = async(permission,emails,userId,userEmail) =>{
    if(user && user.userId !== ''){
      try{
        await axios.post(`${base_url}api/setinventorycollaborator`,{colaboratorEmails:emails,permission:permission,
          invitationDate:new Date(Date.now()),level:'inventories',ownerEmail:userEmail},
          {headers: {
            Authorization: `Bearer ${userId}`,
            Accept: 'application/json'}}).then((res)=>{
          })
      } catch (e){
        setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
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