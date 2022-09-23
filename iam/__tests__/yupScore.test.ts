// ---- Test subject
import { RequestPayload } from "@gitcoin/passport-types";
import { YupScoreProvider, yupScoreApi } from "../src/providers/yupScore";

// ----- Libs
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const MOCK_ADDRESS = "0xcF314CE817E25b4F784bC1f24c9A79A525fEC50f";
const MOCK_ADDRESS_LOWER = MOCK_ADDRESS.toLocaleLowerCase();

const validYupScoreResponse = {
  data: {
    yup_score: 10,
    blacklisted: false,
  },
};

const invalidYupScoreResponse = {
  data: {
    yup_score: 0,
    blacklisted: true,
  },
};
// const AxiosPost = jest.spyOn(axios.prototype, "post");

interface RequestData {
  query: string;
}

describe("Attempt verification", function () {
  it("handles valid verification attempt", async () => {
    jest.clearAllMocks();

    const yupScoreUrl = `${yupScoreApi}?address=${MOCK_ADDRESS_LOWER}`;
    mockedAxios.get.mockImplementation(async (url) => {
      if (url === yupScoreUrl) {
        return validYupScoreResponse;
      }
    });

    const yupScoreProvider = new YupScoreProvider();
    const verifiedPayload = await yupScoreProvider.verify({
      address: MOCK_ADDRESS,
    } as RequestPayload);

    // Check that all the subgraph URLs have been queried, up to the one we mocked with relevant data
    expect(mockedAxios.get.mock.calls.length).toEqual(1);
    expect(mockedAxios.get.mock.calls[0][0]).toEqual(yupScoreUrl);

    expect(verifiedPayload).toEqual({
      valid: true,
      record: {
        yupScore: "10",
      },
    });
  });

  it("handles invalid verification attempt", async () => {
    jest.clearAllMocks();

    const yupScoreUrl = `${yupScoreApi}?address=${MOCK_ADDRESS_LOWER}`;
    mockedAxios.get.mockImplementation(async (url) => {
      if (url === yupScoreUrl) {
        return invalidYupScoreResponse;
      }
    });

    const yupScoreProvider = new YupScoreProvider();
    const verifiedPayload = await yupScoreProvider.verify({
      address: MOCK_ADDRESS,
    } as RequestPayload);

    // Check that all the subgraph URLs have been queried, up to the one we mocked with relevant data
    expect(mockedAxios.get.mock.calls.length).toEqual(1);
    expect(mockedAxios.get.mock.calls[0][0]).toEqual(yupScoreUrl);

    expect(verifiedPayload).toEqual({
      valid: false,
      record: {
        yupScore: "0",
      },
    });
  });
});
