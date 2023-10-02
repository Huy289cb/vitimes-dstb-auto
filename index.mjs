
import axios from "axios";
import data from './data.js';
import https from 'https';
// constants to replace below
const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlUktVWG10TFhKMHBBNkxBS29aWko1ZlU0VDhCdmxKdERCb3pXanFFdnhjIn0.eyJleHAiOjE2OTYyMDYzMDIsImlhdCI6MTY5NjE3MDMwMywiYXV0aF90aW1lIjoxNjk2MTcwMzAyLCJqdGkiOiI3ZDUzMThkOC1hZTgxLTQ3MGQtODNkYS04YmM0NjM5NDZhNTIiLCJpc3MiOiJodHRwczovL3Nzby52aXRpbWVzLm9yZy9hdXRoL3JlYWxtcy9nbG9iaXRzIiwic3ViIjoiMDQzNTA1MzEtNWJmZC00YjQ4LWJjMmEtODliNThlYzEwM2M5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic3NvQ2xpZW50LTEiLCJub25jZSI6Ijc0MzI4Y2RjLTAxOTYtNGI3YS04MWM2LTJkZjVkYWU2NGNhZSIsInNlc3Npb25fc3RhdGUiOiJhNDhlYjI5My05ODNjLTQ0NjktYmQxNi1hOGZjNDc5ZGQyY2MiLCJhY3IiOiIxIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSIsIm5hbWUiOiJBZG1pbiBTdXBlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIiwiZ2l2ZW5fbmFtZSI6IkFkbWluIiwiZmFtaWx5X25hbWUiOiJTdXBlciJ9.c0MzQ4fZxR-5smtl7CScfQyZNWeYZT1t6SINY6MIzL3gD0sVNZnCSh3q0BZOPqUVFqTvJggYOKoUswXCudfioFR8g6URDEV6gmHNEDkQAsaf0NgxZnvJ-00BIczA4EPrTVrHx0uKkAKWSBf96SSs0GN8UaVx33waGtiHzl5QhcVGpakpeYuilsXk8qtPEYnQGR4utAyXh0DSI1NxgAesQ6VLeF7frUzFcdcd1r7_FYgm1CxxNC8YN7RSzldNmM23oux9CKvVBRpnOVv0zkqq0N8cYGRV9-qEZxGIfKsJuqpaLc84Zp7TO0WHG5hBWpGYrgVYfSfTov4WkJu6CfI1ig";
const MAX_SIZE = 10;
// const API_PATH = "https://hiscndstb.vitimes.org/sync/test/Patient/v2/synctool/syncPatientFromOldVitimes";
const API_PATH = "http://localhost:8071/sync/test/Patient/v2/synctool/syncPatientFromOldVitimes";
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

let currentIndex = 0;

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
        const resPushing = await axios.post(API_PATH, dto, {signal: newAbortSignal(720000)}); //12m
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
        if (axios.isCancel(err)) {
            console.log('Request canceled after 12m', err.message);
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