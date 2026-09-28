import apiApp from '../src/api.ts';

export default function handler(req: any, res: any) {
  return apiApp(req, res);
}
