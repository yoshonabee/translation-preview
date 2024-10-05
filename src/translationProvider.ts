import * as vscode from 'vscode';
import * as path from 'path';
import { parsePoFile, findTranslation, Translation } from './poParser';

export class TranslationProvider implements vscode.HoverProvider {
  private potTranslations: Translation[] = [];
  private poTranslations: Map<string, Translation[]> = new Map();
  private translateFunctions: string[] = [];

  constructor() {
    this.loadTranslations();
    vscode.workspace.onDidChangeConfiguration(() => this.loadTranslations());
  }

  private loadTranslations() {
    const config = vscode.workspace.getConfiguration('translationPreview');
    const languages = config.get<string[]>('languages', ['en']);
    const potPaths = config.get<string[]>('potPaths', ['./locales/messages.pot']);
    const poPaths = config.get<string[]>('poPaths', ['./locales/{lang}/LC_MESSAGES/messages.po']);
    this.translateFunctions = config.get<string[]>('translateFunctions', ['_', 't']);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (workspaceFolder) {
      this.potTranslations = [];
      potPaths.forEach(potPath => {
        this.potTranslations.push(...parsePoFile(path.join(workspaceFolder, potPath)));
      });

      this.poTranslations.clear();
      languages.forEach(lang => {
        poPaths.forEach(poPath => {
          const langPoPath = poPath.replace('{lang}', lang);
          const translations = parsePoFile(path.join(workspaceFolder, langPoPath));
          if (!this.poTranslations.has(lang)) {
            this.poTranslations.set(lang, []);
          }
          this.poTranslations.get(lang)?.push(...translations);
        });
      });
    }
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position.line).text;
    const translationFunctionRegex = new RegExp(`(${this.translateFunctions.join('|')})\\s*\\(\\s*['"](.+?)['"]\\s*\\)`, 'g');
    
    let match;
    while ((match = translationFunctionRegex.exec(line)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      
      if (position.character >= startIndex && position.character <= endIndex) {
        const key = match[2];
        const potTranslation = findTranslation(this.potTranslations, key);
        
        const content = new vscode.MarkdownString();
        if (potTranslation) content.appendMarkdown(`**Key:** ${potTranslation}\n\n`);

        this.poTranslations.forEach((translations, lang) => {
          const poTranslation = findTranslation(translations, key);
          if (poTranslation) {
            content.appendMarkdown(`**${lang}:** ${poTranslation}\n\n`);
          }
        });

        return new vscode.Hover(content, new vscode.Range(position.line, startIndex, position.line, endIndex));
      }
    }

    return null;
  }
}