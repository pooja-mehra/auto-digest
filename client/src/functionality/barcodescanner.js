import React, { useRef, useEffect } from 'react';
import {Html5QrcodeScanner,Html5QrcodeScanType} from 'html5-qrcode';
import {isMobile} from 'react-device-detect';

const BarCodeScanner = (props) => {
    const scannerRef = useRef(null);

    const onScanSuccess = async (decodedText, decodedResult) =>{
        const code = window.sessionStorage.getItem('code')?window.sessionStorage.getItem('code'):''
        if(decodedText && decodedText !== '' && decodedText !== code){
            props.handleScan(decodedText)
            setTimeout(()=>{
                window.sessionStorage.removeItem('code')
            },4000)
        }
    }

    useEffect(()=>{
        document.getElementById('html5-qrcode-button-camera-stop') && 
            document.getElementById('html5-qrcode-button-camera-stop').addEventListener('click',(()=>{
                window.sessionStorage.removeItem('code')
                props.setScanStatus()}))
        if(!props.openScanner ){
            window.sessionStorage.removeItem('code')
            document.getElementById('html5-qrcode-button-camera-stop') && document.getElementById('html5-qrcode-button-camera-stop').click()
        } else{
            scannerRef.current.innerHTML === '' && handleStartScan()
        }
    })
    
    
    const handleStartScan = () => {
        const html5QrCode = new Html5QrcodeScanner(
            'scanner',
            { fps: 1, qrbox:qrboxFunction,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]},
            { facingMode:  isMobile?"environment":"user" }
            );
            html5QrCode.render(onScanSuccess);

  };

  const qrboxFunction = (viewfinderWidth, viewfinderHeight) =>{
    let minEdgePercentage = 0.8; 
    let qrboxHeight = Math.floor(viewfinderHeight * minEdgePercentage);
    let qrboxWidth= Math.floor(viewfinderWidth * minEdgePercentage);
    return {
        width: qrboxWidth,
        height: qrboxHeight
    };
}

  return (
      <div ref={scannerRef} style={{ width: '50vw',margin: 'auto'}} id={'scanner'} hidden={!props.openScanner}>
      </div>
  );
};

export default BarCodeScanner;
