import * as fs from 'fs';
import * as path from 'path';

export interface Translation {
  msgid: string;
  msgstr: string;
}

export function parsePoFile(filePath: string): Translation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entries = content.split('\n\n');
  
  return entries.map(entry => {
    const msgid = entry.match(/msgid "(.*?)"/)?.[1] || '';
    const msgstr = entry.match(/msgstr "(.*?)"/)?.[1] || '';
    return { msgid, msgstr };
  }).filter(t => t.msgid && t.msgstr);
}

export function findTranslation(translations: Translation[], key: string): string | undefined {
  return translations.find(t => t.msgid === key)?.msgstr;
}