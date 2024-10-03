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
    const potPath = config.get<string>('potPath', './locales/messages.pot');
    const poPath = config.get<string>('poPath', './locales/{lang}/LC_MESSAGES/messages.po');
    this.translateFunctions = config.get<string[]>('translateFunctions', ['_', 't']);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (workspaceFolder) {
      this.potTranslations = parsePoFile(path.join(workspaceFolder, potPath));
      
      languages.forEach(lang => {
        const langPoPath = poPath.replace('{lang}', lang);
        this.poTranslations.set(lang, parsePoFile(path.join(workspaceFolder, langPoPath)));
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