# 🌍 Multi-Language Tool Converter

A powerful web tool to convert between translation files (JSON/TS/JS) and Excel format, making it easy to manage multi-language content.

## ✨ Features

### 🔄 Two-Way Conversion

#### 1. JSON/TS/JS → Excel

- Upload multiple translation files (`.json`, `.ts`, `.js`)
- Automatically flatten nested objects to dot notation
- Generate single Excel file with all translations
- 2 empty rows between files for easy separation

#### 2. Excel → JSON

- Upload Excel file with multiple language columns
- Auto-detect available languages
- Select which languages to export
- Generate properly nested JSON files
- Download single file or ZIP archive

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Install additional package for Excel → JSON
pnpm add jszip
pnpm add -D @types/jszip

# Run development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage

### JSON/TS/JS → Excel

1. **Upload Files**

   - Drag & drop or click to browse
   - Support `.json`, `.ts`, `.js` files
   - Can upload multiple files at once

2. **Convert**

   - Click "Convert to Excel"
   - Wait for processing
   - Download `Multi-Language.xlsx`

3. **Excel Output**
   - 2 columns: KEY, VALUE
   - Flattened keys (e.g., `error.unknown`)
   - 2 empty rows between files

**Example Input (vi.ts):**

```typescript
const vi = {
  save: 'Lưu',
  error: {
    unknown: 'Lỗi không xác định',
  },
};
```

**Example Output (Excel):**
| KEY | VALUE |
|-----|-------|
| save | Lưu |
| error.unknown | Lỗi không xác định |

---

### Excel → JSON

1. **Prepare Excel**
   - First column: `KEY` (required)
   - Other columns: Language names (VI, EN, JAPAN, etc.)
   - Use dot notation for nested keys

**Example Excel:**
| KEY | VI | EN | JAPAN |
|-----|----|----|-------|
| save | Lưu | Save | 保存 |
| error.unknown | Lỗi | Error | エラー |

2. **Upload & Select**

   - Upload Excel file
   - Tool auto-detects languages
   - Check languages you want to export

3. **Convert**
   - Click "Convert from Excel"
   - Download JSON file(s)
   - Multiple languages → ZIP archive

**Example Output (vi.json):**

```json
{
  "save": "Lưu",
  "error": {
    "unknown": "Lỗi"
  }
}
```

---

## 📁 Supported Formats

### Input Formats

**JSON:**

```json
{
  "key": "value",
  "nested": {
    "key": "value"
  }
}
```

**TypeScript:**

```typescript
const translations = {
  key: 'value',
  nested: {
    key: 'value',
  },
};

export default translations;
```

**JavaScript:**

```javascript
const translations = {
  key: 'value',
  nested: {
    key: 'value',
  },
};

module.exports = translations;
```

**Excel:**

- First column: `KEY`
- Other columns: Language codes/names
- `.xlsx` or `.xls` format

---

## 🎯 Key Features

### Smart Parsing

- ✅ Parse JSON, TypeScript, JavaScript files
- ✅ Extract objects from variable declarations
- ✅ Support `const`, `export const`, `export default`
- ✅ Handle nested objects automatically

### Flexible Excel Format

- ✅ Auto-detect language columns
- ✅ Support unlimited languages
- ✅ Unflatten dot notation to nested structure
- ✅ Handle empty values gracefully

### User-Friendly UI

- ✅ Drag & drop file upload
- ✅ Real-time file validation
- ✅ Loading states with spinners
- ✅ Clear error messages
- ✅ Clean, minimal design

### Batch Processing

- ✅ Upload multiple files at once
- ✅ Export multiple languages as ZIP
- ✅ Efficient processing

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### File Processing

- **xlsx** - Excel file manipulation
- **@babel/parser** - Parse TS/JS code
- **@babel/traverse** - AST traversal
- **jszip** - Create ZIP archives
- **file-saver** - Download files

### UI Components

- **react-dropzone** - Drag & drop upload
- Custom components for file management

---

## 📂 Project Structure

```
multi-language-tool/
├── app/
│   ├── page.tsx              # Main page with tabs
│   └── layout.tsx            # Root layout
├── components/
│   ├── ConvertToExcel.tsx    # JSON/TS/JS → Excel
│   ├── ConvertFromExcel.tsx  # Excel → JSON
│   ├── FileUploader.tsx      # Drag & drop component
│   └── FileList.tsx          # File list display
├── lib/
│   ├── parsers/
│   │   ├── jsonParser.ts     # Parse JSON files
│   │   └── tsJsParser.ts     # Parse TS/JS files
│   ├── converters/
│   │   ├── toExcel.ts        # Generate Excel
│   │   └── fromExcel.ts      # Parse Excel
│   └── utils/
│       ├── flatten.ts        # Flatten objects
│       └── unflatten.ts      # Unflatten objects
└── test-files/               # Sample files for testing
```

---

## 🧪 Testing

### Test Files Included

Located in `test-files/`:

- Sample translation files in various formats
- Instructions for creating test Excel files
- Edge cases examples

### Manual Testing

1. **Test JSON/TS/JS → Excel:**

   - Upload sample files
   - Check Excel output format
   - Verify nested keys are flattened

2. **Test Excel → JSON:**
   - Create Excel with KEY + language columns
   - Select languages
   - Check JSON output structure

---

## 📝 Notes

### Nested Keys

- Use dot notation: `error.unknown`, `booking.details.roomType`
- Automatically flattened when converting to Excel
- Automatically unflattened when converting to JSON

### Special Characters

- Keys with dashes work fine: `"try-again": "Thử lại"`
- Unicode characters supported in values
- Emojis, accents, special symbols all work

### File Naming

- Excel output: Always `Multi-Language.xlsx`
- JSON output: `{language}.json` (e.g., `vi.json`, `en.json`)
- Multiple JSONs: `translations.zip`

---

## 🚦 Current Status

### ✅ Completed Features

**JSON/TS/JS → Excel (100%)**

- Multi-file upload
- All format support (.json, .ts, .js)
- Nested object flattening
- Excel generation with separators

**Excel → JSON (100%)**

- Excel parsing
- Auto language detection
- Language selection UI
- Nested object unflattening
- Single/ZIP download

### 🔮 Future Enhancements

- Custom separator options (comment rows)
- Preview before conversion
- Custom output filename
- Export to TypeScript/JavaScript (not just JSON)
- Batch conversion via CLI
- Validation rules for translations

---

## 📄 License

MIT

---

## 🤝 Contributing

Feel free to open issues or submit pull requests for improvements!

---

## 📧 Support

For questions or issues, please open an issue on the repository.

---

**Made with ❤️ for easier translation management**
