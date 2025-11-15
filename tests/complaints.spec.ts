import { ComplaintsController } from '../src/complaints/complaints.controller';
import { cleanup, createMockRequest } from './test.utils.spec';
import jsonData from '../gov_api/exampleInput.json';

describe('sendComplaint', () => {
  const { sendComplaint } = new ComplaintsController();
  let request: any;

  beforeEach(() => {
    request = createMockRequest(jsonData);
  });

  afterEach(() => {
    cleanup();
  });

  it('should return debug response when debug is true', async () => {
    const result = await sendComplaint(request.body);

    expect(result.success).toBe(true);
    expect(result.debug).toBe(true);
    expect(result.xml).toBeDefined();
  });

  it('should handle missing required fields', async () => {
    request.body = { debug: true };

    await expect(sendComplaint(request.body)).rejects.toThrow('Input must have userData and databusData');
  });
});
