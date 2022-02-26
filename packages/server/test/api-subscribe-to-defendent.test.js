const app = require('../server.js')
const supertest = require('supertest')
const request = supertest(app)
const { knex } = require('../util/db');

const query = {
  "selectedDefendant":"JACKSON,BRIAN,KEITH.11/04",
  "phone_number":process.env.TEST_PHONE_NUMBER,
  "details":{
     "defendant":"JACKSON,BRIAN,KEITH",
     "dob":"11/04",
     "cases":[
        {
           "court":"District",
           "courtDate":"02/16/2022",
           "courtRoom":"002B",
           "session":"AM",
           "caseNumber":"20CR080142",
           "linkToCaseDetails":"http://www1.aoc.state.nc.us/www/calendars.Offense.do?submit=submit&case=1002020080142&court=CR",
           "citationNumber":"Y0048344"
        },
        {
           "court":"District",
           "courtDate":"02/16/2022",
           "courtRoom":"002B",
           "session":"AM",
           "caseNumber":"20CR080143",
           "linkToCaseDetails":"http://www1.aoc.state.nc.us/www/calendars.Offense.do?submit=submit&case=1002020080143&court=CR",
           "citationNumber":"Y0048343"
        }
     ],
     "completed":false
  }
}

jest.mock('../util/twilio-client', () => {
  return {
    twilioClient: {
      messages: {
        create: async function (obj) {
          const msg = 'You have subscribed to notifications for BRIAN KEITH JACKSON . You may find details of charges on the NC Judicial Branch site: https://www1.aoc.state.nc.us/www/calendars.Criminal.do?county=100&court=BTH+&defendant=JACKSON,BRIAN,KEITH&start=0&navindex=0&fromcrimquery=yes&submit=Search'
          return Promise.resolve({ body: msg});
        }
      }
    }
  };
});

it('Successfully subscribes to a defendant', async function() {
  // Sends POST Request to /court-search endpoint
  const res = await request
  .post('/api/subscribe-to-defendant')
  .send(query)
  .set('Accept', 'application/json');
  expect(res.headers['content-type']).toMatch(/json/);
  expect(res.status).toEqual(200);
  expect(res.body.code).toEqual(200);
  expect(res.body.message).toEqual('Successfully subscribed');
  expect(res.body.index).toBeGreaterThan(0);
  let subscribers = await knex('subscribers').select().where({
    id: res.body.index
  });
  expect(subscribers.length).toEqual(1);
});
