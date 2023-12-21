import { MockAPIComponent, APIData } from './Types';
import JsonDataProvider from './JsonDataProvider';

class MockAPI {
  async getData() {
    return await JsonDataProvider.callMockApiCall();
  }
}

export default MockAPI;