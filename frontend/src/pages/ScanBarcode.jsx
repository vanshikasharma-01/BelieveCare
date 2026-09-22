import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";
import { getMedicineByBarcode } from "../api/medicineApi";
import "../styles/scanBarcode.css";

const hints = new Map();

hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.CODE_128,
  BarcodeFormat.UPC_A,
]);

function ScanBarcode() {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const navigate = useNavigate();

  // Looks the scanned code up in inventory first:
  // - already in inventory  -> same as before, go restock it on /add-medicine
  // - NOT in inventory      -> go to the category picker to add it as new
  const handleScannedBarcode = async (scannedBarcode) => {
    setLookingUp(true);

    try {
      await getMedicineByBarcode(scannedBarcode);

      // No error means a match was found.
      navigate("/add-medicine", {
        state: {
          barcode: scannedBarcode,
        },
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // Not in inventory — let the owner add it as a brand-new
        // product, starting from picking its category. Carry the
        // scanned barcode along so it can be pre-filled in whichever
        // category form the owner ends up on.
        navigate("/add-medicine-manual", {
          state: {
            barcode: scannedBarcode,
          },
        });
      } else {
        console.error("Barcode lookup failed:", error);
        setCameraError("Could not check this barcode. Please try again.");
        setLookingUp(false);
      }
    }
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader(hints);
    let controls;

    const startScanner = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (devices.length === 0) {
          setCameraError("No camera found on this device.");
          return;
        }

        controls = await codeReader.decodeFromVideoDevice(
          devices[0].deviceId,
          videoRef.current,
          (result) => {
            if (result) {
              const scannedBarcode = result.getText();

              setBarcode(scannedBarcode);

              controls?.stop();

              handleScannedBarcode(scannedBarcode);
            }
          },
          {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "environment",
            },
          }
        );
      } catch (error) {
        console.error(error);
        setCameraError(
          "Could not access the camera. Check browser permissions."
        );
      }
    };

    startScanner();

    return () => {
      controls?.stop();
    };
  }, []);

  return (
    <>
      <AdminNavbar title="Scan Barcode" />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main scan-barcode-main">
          <h1>Barcode Scanner</h1>
          <p className="scan-subtitle">
            Point the camera at a medicine's barcode to add or restock it.
          </p>

          <div className="scan-video-frame">
            <video ref={videoRef} />
          </div>

          {cameraError && <p className="scan-hint">{cameraError}</p>}

          {lookingUp && <p className="scan-hint">Checking barcode...</p>}

          {barcode && !lookingUp && (
            <div className="scan-result-card">
              <h3>Scanned Barcode</h3>
              <div className="scan-code">{barcode}</div>
            </div>
          )}

          {!barcode && !cameraError && !lookingUp && (
            <p className="scan-hint">Waiting for a barcode...</p>
          )}

          <div className="scan-manual-entry">
            <p className="scan-manual-note">Don't have the barcode handy?</p>
            <button
              type="button"
              className="scan-manual-btn"
              onClick={() =>
                navigate("/add-medicine-manual", {
                  state: barcode ? { barcode } : undefined,
                })
              }
            >
              Add Manually
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScanBarcode;