import React, { useRef, useEffect } from 'react';
import {Html5QrcodeScanner,Html5QrcodeScanType} from 'html5-qrcode';
import {isMobile} from 'react-device-detect';

const BarCodeScanner = (props) => {
    const scannerRef = useRef(null);

    const onScanSuccess = async (decodedText, decodedResult) =>{
        const code = localStorage.getItem('code')?localStorage.getItem('code'):''
        if(decodedText && decodedText !== '' && decodedText !== code){
            props.handleScan(decodedText)
            setTimeout(()=>{
                localStorage.removeItem('code')
            },4000)
        }
    }

    useEffect(()=>{
        document.getElementById('html5-qrcode-button-camera-stop') && 
            document.getElementById('html5-qrcode-button-camera-stop').addEventListener('click',(()=>{
                localStorage.removeItem('code')
                props.setScanStatus()}))
        if(!props.openScanner ){
            localStorage.removeItem('code')
            document.getElementById('html5-qrcode-button-camera-stop') && document.getElementById('html5-qrcode-button-camera-stop').click()
        } else{
            scannerRef.current.innerHTML === '' && handleStartScan()
        }
    })
    
    
    const handleStartScan = () => {
        const html5QrCode = new Html5QrcodeScanner(
            'scanner',
            { fps: 1, qrbox:{height:250,width:320},
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]},
            { facingMode:  isMobile?"environment":"user" }
            );
            html5QrCode.render(onScanSuccess);

  };

  return (
      <div ref={scannerRef} style={{ width: '350px',margin: 'auto',height:'300px' }} id={'scanner'} hidden={!props.openScanner}>
      </div>
  );
};

export default BarCodeScanner;
