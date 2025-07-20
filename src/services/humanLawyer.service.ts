import { EngineVerdict, VerdictModel } from '../models/Verdict';

export class HumanLawyerService {
  public async saveVerdict(verdict: EngineVerdict) {
    const newVerdict = new VerdictModel(verdict);
    await newVerdict.save();
  }

  public async getVerdictForMatch(matchId: string): Promise<EngineVerdict | null> {
    return await VerdictModel.findOne({ matchId }).exec();
  }

  public async getAllVerdicts(): Promise<EngineVerdict[]> {
    return await VerdictModel.find({}).exec();
  }
}
