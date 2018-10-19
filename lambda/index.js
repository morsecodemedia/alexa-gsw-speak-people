/* eslint no-use-before-define: 0 */
// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

// core functionality for speak people skill
const GetNewTermHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewTermIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random term/acronym by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomTerm = requestAttributes.t('TERMS');
    // concatenates a standard message with the random term and definition
    const speakOutput = requestAttributes.t('GET_TERM_MESSAGE') + randomTerm;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomTerm)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-Aug-01: AMAZON.FallbackIntent is only currently available in en-* locales.
  //              This handler will not be triggered except in those locales, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
    });
    localizationClient.localize = function localize() {
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    };
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewTermHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

// translations
const enData = {
  translation: {
    SKILL_NAME: 'GSW: Speak People',
    GET_TERM_MESSAGE: 'Here\'s your term: ',
    HELP_MESSAGE: 'You can say tell me a space fact, or, you can say exit... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    FALLBACK_MESSAGE: 'The Speak People skill can\'t help you with that. It can help you learn terms and acronyms that are used daily at GSW. What can I help you with?',
    FALLBACK_REPROMPT: 'What can I help you with?',
    ERROR_MESSAGE: 'Sorry, an error occurred.',
    STOP_MESSAGE: 'Goodbye!',
    TERMS:
      [
        '2253: Final approval. Also see: DOFU.',
        'AFD: Approval for Dissemination.',
        'AFU: Approved for Use.',
        'BWS: Billing Work Sheets. Account updates these monthly for accounting.',
        'Buddy: Our old time entry program. Long live the sock puppet.',
        'CMLR: Commercial Medical Legal Review.',
        'CMO: Core Message Document.',
        'CRTD: Creation Release to Development. These are the art files (mostly PSDs) that are handed off to the developers to begin coding.',
        'CTP: Change to Production. Form used for Shire IT for deployment.',
        'CTR: Click Through Rate. Rate that websites or banners are clicked.',
        'CVA: Core Visual Aid. Also see: MVA.',
        'DOFU: Date of First Use. The first time a piece will be used or seen.',
        'DMVA: Digital Master Visual Aid. Also see: ICVA and IVA.',
        'DSA: Disease State Awareness.',
        'DTC: Direct to Consumer.',
        'FDA: Food and Drug Administration.',
        'FRD: Functional Requirement Document.',
        'ICVA: Interactive Core Visual Aid. Also see: DMVA and IVA.',
        'ISI: Important Safety Information.',
        'MARC: Endo\'s Med/Legal Review meetings.',
        'MBR: Monthly Business Review. A monthly meeting to predict forecasting.',
        'MLR: Med/Legal Review.',
        'MMP: Multi-Media Presentation.',
        'MOA: Mechanism of Action.',
        'MOD: Mechanism of Disease.',
        'MVA: Master Visual Aid.',
        'NSM: National Sales Meeting.',
        'PARC: Teva\'s Med/Legal Review meetings.',
        'PI: Prescribing Information.',
        'POA: Plan of Action meeting.',
        'POV: Point of View.',
        'QA: Quality Assurance. Strategy for how the product will be tested.',
        'QC: Quality Control. The act of testing the product.',
        'REMS: Risk Evaluation Mitigation Strategy. Used to educate about the drug (managed by a medical communications group).',
        'UI: User Interface. The Form to UX\'s Function.',
        'UX: User Experience. The Function to UI\'s Form.',
        'Vault: System used to submit projects to client\'s Med/Legal reviewers. Also see: Zinc.',
        'Zinc: System used to submit projects to client\'s Med/Legal reviewers. Also see: Vault.',
      ],
  },
};

const enusData = {
  translation: {
    SKILL_NAME: 'GSW: Speak People',
  },
};

// constructs i18n and l10n data structure
// translations for this sample can be found at the end of this file
const languageStrings = {
  'en': enData,
  'en-US': enusData,
};
