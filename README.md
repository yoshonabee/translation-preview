# translation-preview

## Features

- **Translation Preview for .pot and .po Files**: This extension allows you to preview translations for `.pot` and `.po` files directly within VSCode.
- **Supported Languages**: The extension activates on JavaScript, TypeScript, and Python files, providing hover information for translation keys.
- **Configuration Options**:

  - `translationPreview.languages`: Specify the list of language codes for which translations should be previewed. Default is `["en"]`.
  - `translationPreview.potPaths`: Define the list of paths to the `.pot` files containing translation keys. Default is `["./locale/messages.pot"]`.
  - `translationPreview.poPaths`: Define the list of paths to the `.po` files containing translations, using `{lang}` as a placeholder for the language code. Default is `["./locale/{lang}/LC_MESSAGES/messages.po"]`.
  - `translationPreview.translateFunctions`: List of translation function names to recognize in the code. Default is `["_", "t", "gettext", "i18n"]`.
- **Hover Provider**: Displays translation keys and their corresponding translations in different languages when hovering over recognized translation functions in the code.
- **Automatic Reload**: Automatically reloads translations when the configuration changes.

## Usage

1. Install the extension in VSCode.
2. Open a project containing `.pot` and `.po` files.
3. Hover over translation functions in your code to see the translation previews.

## Development

- **Build and Compile**: Use `npm run compile` to compile the TypeScript code.
- **Watch for Changes**: Use `npm run watch` to automatically recompile the code on changes.
- **Linting**: Use `npm run lint` to lint the codebase.

## License

This project is licensed under the MIT License.
