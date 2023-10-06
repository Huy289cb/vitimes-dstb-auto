
import axios from "axios";
import data from './data.js';
import https from 'https';
// constants to replace below
const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlUktVWG10TFhKMHBBNkxBS29aWko1ZlU0VDhCdmxKdERCb3pXanFFdnhjIn0.eyJleHAiOjE2OTYzMzQ1MzcsImlhdCI6MTY5NjI5ODUzOSwiYXV0aF90aW1lIjoxNjk2Mjk4NTM3LCJqdGkiOiIzMmM3ODVjNS1jYmQzLTQ0MDktYWY0Mi01YzAzNzgxNjRhYjUiLCJpc3MiOiJodHRwczovL3Nzby52aXRpbWVzLm9yZy9hdXRoL3JlYWxtcy9nbG9iaXRzIiwic3ViIjoiMDQzNTA1MzEtNWJmZC00YjQ4LWJjMmEtODliNThlYzEwM2M5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic3NvQ2xpZW50LTEiLCJub25jZSI6IjQ5YjI0NmM5LTA4ODgtNDJiMi04MGQyLTc3MjBjMTEzM2MyZCIsInNlc3Npb25fc3RhdGUiOiIwYWJmMzk1Zi1hODNjLTQwMTAtYTgyYi02NTIwZjYyZjYyOTIiLCJhY3IiOiIwIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSIsIm5hbWUiOiJBZG1pbiBTdXBlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIiwiZ2l2ZW5fbmFtZSI6IkFkbWluIiwiZmFtaWx5X25hbWUiOiJTdXBlciJ9.WRhxa0K1p1bpCTIuN4wNb0nyRr5kfrbcahZoTAuVF38GX2S5VFusGXZORttaBXh52ZqzXw05Y56exfTEOXo1uI6OVHhPGkwGttjsjS9Y9TkfjyoDYmn6Y-mh5pAog1laREf1e-fzKxTiWd0vQcHUdVjIcHWmwpkVFXvZCfxDX3HfMFwFtSBOzcWc8jq64hc5zUMW51ugtYZ4mzSrxD-f81euG0GsGsfAJ53404wpaG0VW_W8vftajkOODAkwuUfkywo5elBCARIWaew024ysRo2eHBSvwWAxl3o990R4WqKaKGdzrccPphPJoeV1PHTA3Bdd_4Ra3JS6GTTW0IYPCA";
const MAX_SIZE = 200;
// const API_PATH = "https://hiscndstb.vitimes.org/sync/test/Patient/v2/synctool/syncPatientFromOldVitimes";
const API_PATH = "http://localhost:8071/sync/test/Patient/v2/synctool/syncPatientFromOldVitimes";

let currentIndex = 0;
// end constants

// DO NOT DO THIS IF SHARING PRIVATE DATA WITH SERVICE
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
axios.defaults.httpsAgent = httpsAgent
axios.defaults.headers.common["Authorization"] = "Bearer " + token;

const body = {
    "pageSize": MAX_SIZE,
    "patientIdStarts": 0,
    "pageIndex": 0,
    "searchByTreatment": true,
    "treatmentBeginDate": "2020-01-01",
    "treatmentEndDate": "2024-02-10",
    "idRecordDebugIntValue": null,
    "patientIds": []
}

function newAbortSignal(timeoutMs) {
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), timeoutMs || 0);
  
    return abortController.signal;
}

const pushing = async () => {
    if (data.length === 0) {
        console.log("😊😊😊 no data!")
        process.exit(0);
        return
    }
    if (data.length < (currentIndex - 1)) {
        console.log("😊😊😊 pushing done!")
        process.exit(0);
        return
    }
    const toIndex = currentIndex + (MAX_SIZE-1);
    const pushingData = data.filter((d, i) => i>=currentIndex && i <=toIndex);
    console.log("🔥🔥🔥 ~ file: index.mjs:45 ~ pushing ~ pushingData:", pushingData)

    try {
        console.log(`🔥🔥🔥 ~ pushing from ${currentIndex} to ${toIndex}`)
        const dto = {
            ...body,
            patientIds: pushingData
        }
        console.time("⌚⌚⌚ ~ time pushing: ")
        const resPushing = await axios.post(API_PATH, dto, {signal: newAbortSignal(MAX_SIZE*72000)});
        console.timeEnd("⌚⌚⌚ ~ time pushing: ")
        if (resPushing != null && resPushing.data) {
            currentIndex += (MAX_SIZE);
            console.log('👍👍👍 ~ pushing success!');
            console.log("📆📆📆 ~ pushing again after 15s")
            setTimeout(() => {
                pushing();
            }, 15000); //15s
            // if (resPushing.data === pushingData[pushingData.length - 1]) {
            // } else {
            //     if (pushingData.includes(resPushing.data)) {
            //         let newCurrentIndex = pushingData.indexOf(resPushing.data);
            //         if (newCurrentIndex === 0 || !!newCurrentIndex) {
            //             newCurrentIndex +=1;
            //         }
            //         currentIndex+=newCurrentIndex;
            //         console.log(`👍👍👍 ~ pushing success from ${currentIndex-newCurrentIndex} to ${currentIndex}`);
            //         console.log("📆📆📆 ~ pushing again after 15s")
            //         setTimeout(() => {
            //             pushing();
            //         }, 15000); //15s
            //     }
            // }
        }

    } catch (err) {
        console.timeEnd("⌚⌚⌚ ~ time pushing: ")
        if (axios.isCancel(err)) {
            console.log(`Request canceled after ${MAX_SIZE*72000/60000}m`, err.message);
            console.log("📆📆📆 ~ pushing again after 15s")
            setTimeout(() => {
                pushing();
            }, 15000); //15s
          } else {
            console.error(err.message);
            return
          }
    }
    

}

pushing();