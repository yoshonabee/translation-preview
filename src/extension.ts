import * as vscode from 'vscode';
import { TranslationProvider } from './translationProvider';

export function activate(context: vscode.ExtensionContext) {
  const translationProvider = new TranslationProvider();

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ['javascript', 'typescript', 'python'],
      translationProvider
    )
  );
}

export function deactivate() {}