// import { useEffect, useRef } from "react";
// import { BrowserMultiFormatReader } from "@zxing/browser";

// function BarcodeScanner({ onDetected }) {

//   const videoRef = useRef(null);

//   useEffect(() => {

//     const codeReader = new BrowserMultiFormatReader();

//     codeReader.decodeFromVideoDevice(
//       undefined,
//       videoRef.current,
//       (result) => {

//         if (result) {

//           onDetected(result.getText());

//           codeReader.reset();

//         }

//       }
//     );

//     return () => codeReader.reset();

//   }, [onDetected]);

//   return (

//     <div>

//       <video

//         ref={videoRef}

//         style={{
//           width: "100%",
//           maxWidth: "500px",
//           borderRadius: "10px"
//         }}

//       />

//     </div>

//   );

// }

// export default BarcodeScanner;

import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

function BarcodeScanner({ onDetected }: BarcodeScannerProps) {

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {

    const codeReader = new BrowserMultiFormatReader();

    let controls: any;

    const startScanner = async () => {

      if (!videoRef.current) return;

      controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {

          if (result) {

            onDetected(result.getText());

            // Stop scanner after detecting barcode
            controls?.stop();

          }

        }
      );

    };


    startScanner();


    return () => {

      // Stop camera when component closes
      controls?.stop();

    };


  }, [onDetected]);


  return (

    <div>

      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "10px"
        }}
      />

    </div>

  );

}

export default BarcodeScanner;