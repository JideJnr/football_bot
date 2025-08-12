import { addLog } from '../../../util/logger';

export async function today() {

//  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);
  
  try {
    
    // await dbService.connect();  
    // fetch today match
    // judge all today matches
    // call super judge to judge all judges
    // save all judge verdict to db
      
    addLog('Pipeline complete.');
  } catch (error) {
    console.error('Live pipeline failed:', error);
  } finally {
    //   await dbService.close();
  }

}
