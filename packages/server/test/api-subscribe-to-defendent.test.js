const app = require('../server.js')
const supertest = require('supertest')
const request = supertest(app)
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

// Also want to unsuccessfully do it.

it('Successfully subscribes to a defendant', async function() {
  // Sends POST Request to /court-search endpoint
  const res = await request
  .post('/api/subscribe-to-defendant')
  .send(query)
  .set('Accept', 'application/json');
  expect(res.headers['content-type']).toMatch(/json/);
  expect(res.status).toEqual(200);
  expect(Array.isArray(res.body)).toBe(true)
  expect(res.body.length).toBeGreaterThan(1)
  const expected = [
    expect.stringMatching(/^JACKSON/)
  ];
  for (let i=0; i<res.body.length; ++i) {
    let itm = res.body[i]
    expect([itm['defendant']]).toEqual(
      expect.arrayContaining(expected)
    );
    expect(itm['cases'].length).toBeGreaterThan(0)
  }
});
