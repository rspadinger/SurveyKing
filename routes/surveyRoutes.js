const _ = require('lodash');
const Path = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

const Survey = mongoose.model('surveys');

module.exports = app => {
  app.get('/api/surveys', requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false
    });

    res.send(surveys);
  });

  app.get('/api/surveys/:surveyId/:choice', (req, res) => {
    res.send('Thanks for voting!');
  });

  app.post('/api/surveys/webhooks', (req, res) => {
    // console.log('************** DATA ****************');
    // console.log(req.body);
    // return res.send({});

    const p = new Path('/api/surveys/:surveyId/:choice');

    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact() //compact removes any array elements that are undefined
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        //normally, the following would be an async operation, but there is no need to define
        //async, await... because we don't need to wait for the DB update process to complete
        //we don't need to send anything back to sendgrid
        Survey.updateOne(
          //first, we find certain elements - where responded == false...
          {
            _id: surveyId, //in Mongo, ids need to be prefixed with underscore
            recipients: {
              $elemMatch: { email: email, responded: false }
            }
          },
          //then we update those elements
          {
            $inc: { [choice]: 1 },
            $set: { 'recipients.$.responded': true },
            lastResponded: new Date()
          }
        ).exec(); //we execute the query
      })
      .value();

    res.send({}); //sendgrid does not expect any response, so we just send an empty object
  });

  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now()
    });

    // Great place to send an email!
    const mailer = new Mailer(survey, surveyTemplate(survey));

    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      //422: something cannot be processed
      res.status(422).send(err);
    }
  });
};
