import { addLog } from "../../../util/logger";


export async function upcoming() {

    // const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);
  
  try {
    
    //   await dbService.connect();

    // 1.  fetch today Matches Data
    // add signals to signal array including time 

    addLog('Pipeline complete.');
  } catch (error) {
    console.error('Live pipeline failed:', error);
  } finally {
   // await dbService.close();
  }

}
