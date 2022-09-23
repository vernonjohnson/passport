// ----- Types
import type { Provider, ProviderOptions } from "../types";
import type { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";

// ----- Libs
import axios from "axios";

// ----- Credential verification
import { getAddress } from "../utils/signer";

export const yupScoreApi = "https://api.yup.io/score";

interface Data {
  blacklisted: boolean;
  yup_score: number;
}

interface YupScoreResult {
  data: Data;
}

export class YupScoreProvider implements Provider {
  // Give the provider a type so that we can select it with a payload
  type = "YupScoreProvider";

  // Options can be set here and/or via the constructor
  _options = {};

  // construct the provider instance with supplied options
  constructor(options: ProviderOptions = {}) {
    this._options = { ...this._options, ...options };
  }

  // Verify that address has yup score
  async verify(payload: RequestPayload): Promise<VerifiedPayload> {
    // if a signer is provider we will use that address to verify against
    const address = (await getAddress(payload)).toLowerCase();

    let yupScore = 0;
    let valid = true;
    try {
      const scoreData: YupScoreResult = await axios.get(`${yupScoreApi}?address=${address}`);
      yupScore = scoreData.data.yup_score;
      valid = !scoreData.data.blacklisted;
    } catch (e) {
      valid = false;
    }

    return Promise.resolve({
      valid,
      record: {
        yupScore: yupScore.toString(),
      },
    });
  }
}
