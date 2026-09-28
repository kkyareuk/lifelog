import {characterContactSpeech} from './speech-styles.js?v=20260909dev305';
// Preserve the selected letter. Style must never replace its story with a fixed greeting.
export const CONTACT_VOICE_VERSION=7;
export function characterMomentSpeech(character,neutral,{language='ko'}={}){
  return characterContactSpeech(character,neutral,{language});
}
