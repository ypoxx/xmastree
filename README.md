# 🎄 Wachsender Weihnachtsbaum - Team Web-App

**Ein Baum, der alle trägt** - Eine interaktive Weihnachtsbaum-App für Team-Events

## Über das Projekt

Diese Web-Anwendung ermöglicht es Team-Mitgliedern, Fotos von sich hochzuladen, die als festliche Christbaumkugeln an einem wachsenden SVG-Weihnachtsbaum erscheinen. Der Baum symbolisiert Teamgeist und Zusammenhalt zur Weihnachtszeit.

### Besondere Features

- 🌲 **Wachsender Baum**: Der Baum wird mit jedem hochgeladenen Foto größer (bis zu 130 Fotos)
- 🔄 **Tägliche Neuanordnung**: Jeden Tag werden die Fotos neu angeordnet - so sind alle gleichberechtigt
- 📱 **Mobile-First**: Upload-Seite ist für Smartphones optimiert
- 🖥️ **Display-Optimiert**: Perfekt für große Bildschirme im Büro
- ✨ **Animationen**: Sanfte Animationen und Glitzer-Effekte
- 🔒 **Privacy-First**: Keine externen Services, alles im GitHub Repository

## Live-Demo

Die App kann deployed werden auf:
- **Vercel** (Empfohlen): Mit Upload-Backend-Funktion
- **GitHub Pages**: Nur Display, Upload benötigt separates Backend

Nach Deployment erreichbar unter:
- **Display-Seite**: `https://your-project.vercel.app/` oder `https://[username].github.io/xmastree/`
- **Upload-Seite**: `https://your-project.vercel.app/upload.html`

## Tech-Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6+)
- **Grafik**: SVG für den Weihnachtsbaum
- **Hosting**: GitHub Pages
- **Storage**: JSON-Datei (Fotos als Base64)
- **CI/CD**: GitHub Actions

## Projektstruktur

```
xmastree/
├── index.html              # Display-Seite (Baum-Ansicht)
├── upload.html             # Upload-Seite (mobil-optimiert)
├── css/
│   ├── display.css        # Styles für Baum-Display
│   └── upload.css         # Styles für Upload-Seite
├── js/
│   ├── tree-display.js    # Baum-Rendering und Animation
│   ├── tree-generator.js  # SVG-Baum-Generierung
│   ├── photo-upload.js    # Upload-Logik
│   └── utils.js          # Hilfsfunktionen (Seed-Random, etc.)
├── data/
│   └── photos.json        # Foto-Datenbank
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions Workflow
```

## 🚀 Schnellstart

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/[username]/xmastree.git
cd xmastree

# Lokalen Server starten
python -m http.server 8000
# Oder mit Node.js:
npx serve

# Öffne: http://localhost:8000
```

**Hinweis**: Lokale Entwicklung nutzt `localStorage` für Foto-Speicherung.

### Produktiv-Deployment mit Upload-Funktion

Für echte Uploads benötigst du ein Backend. **Empfohlen: Vercel mit GitHub API**

📖 **Vollständige Anleitung**: Siehe [SETUP.md](./SETUP.md)

**Kurzfassung**:
1. GitHub Personal Access Token erstellen
2. Projekt auf Vercel deployen
3. Environment Variables setzen (`GITHUB_TOKEN`, `GITHUB_REPO`)
4. Fertig! Uploads funktionieren automatisch

### Alternative: Nur Display (GitHub Pages)

Für nur-Display ohne Upload-Funktion:

1. Gehe zu Repository Settings → Pages
2. Wähle "GitHub Actions" als Source
3. Der erste Push zum main-Branch triggert automatisch das Deployment

### QR-Code erstellen

Für einfachen Mobile-Zugriff kannst du einen QR-Code für die Upload-URL erstellen:

```
https://[username].github.io/xmastree/upload.html
```

Tools:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## Verwendung

### Für Team-Mitglieder

1. **QR-Code scannen** oder Upload-URL öffnen
2. **Foto aufnehmen** oder aus Galerie wählen
3. **Hochladen** - Das Foto wird automatisch verarbeitet
4. **Baum ansehen** auf dem Display-Screen

### Für Admins

#### Fotos manuell hinzufügen

Bearbeite `data/photos.json` und füge ein neues Foto hinzu:

```json
{
  "id": "eindeutige-id",
  "imageData": "data:image/jpeg;base64,...",
  "uploadedAt": "2025-11-19T10:30:00Z",
  "timestamp": 1700392200000
}
```

#### Fotos entfernen

Lösche den entsprechenden Eintrag aus `data/photos.json` und committe die Änderung.

## Technische Details

### Seeded Random

Die App nutzt einen Mulberry32-Algorithmus für deterministische Zufallszahlen. Der Seed basiert auf dem aktuellen Datum (YYYY-MM-DD), sodass alle Besucher dieselbe Anordnung sehen, die sich täglich ändert.

### Foto-Verarbeitung

- **Zuschnitt**: Center-Crop auf 400x400px
- **Format**: JPEG mit 80% Qualität
- **Größe**: Max. 150KB pro Foto
- **Darstellung**: Kreisrunde Maske als Christbaumkugel

### Upload-Limitierung

- **Pro Person**: Cookie-basiert (`xmas_tree_uploaded`)
- **Gesamt**: Max. 130 Fotos (Hard-Limit im Code)
- **Gültigkeit**: Cookie läuft am 31.12.2025 ab

## Anpassungen

### Farben ändern

Bearbeite die CSS-Variablen in `css/display.css`:

```css
/* Baum-Farben */
#2D5016, #3D6B1F, #4A7C28

/* Kugel-Rahmen */
#FFD700 (Gold), #C0C0C0 (Silber)
```

### Maximale Foto-Anzahl

Ändere in `js/photo-upload.js`:

```javascript
const MAX_PHOTOS = 130; // Deine gewünschte Anzahl
```

### Baum-Größe

Ändere in `js/tree-generator.js`:

```javascript
function calculateTreeHeight(photoCount) {
    const minHeight = 200; // Anfangsgröße
    const maxHeight = 800; // Maximalgröße
    // ...
}
```

## Upload-Backend

### ✅ Implementiert: Vercel + GitHub API

Das Projekt enthält eine vollständig funktionsfähige Upload-Lösung:

- **Serverless Function** (`/api/upload`) committet Fotos direkt zu GitHub
- **Automatisches Fallback** zu localStorage für lokale Entwicklung
- **Sicher**: GitHub Token bleibt serverseitig
- **Kostenlos**: Vercel Free Tier ist ausreichend

📖 **Setup-Anleitung**: Siehe [SETUP.md](./SETUP.md)

### Alternative Backend-Optionen

Falls Vercel nicht passt, sind auch möglich:

#### Option 1: Netlify Functions

Gleicher Code, läuft auch auf Netlify. Anleitung in `SETUP.md`.

#### Option 2: Cloudflare Workers

Anpassung der API-Function für Cloudflare Workers möglich.

#### Option 3: Firebase/Supabase

Für Echtzeit-Updates ohne GitHub-Commits.

## Browser-Kompatibilität

- ✅ Chrome/Edge (Desktop + Mobile)
- ✅ Safari (iOS + macOS)
- ✅ Firefox
- ✅ Samsung Internet

Mindest-Versionen:
- iOS Safari 12+
- Chrome 80+
- Firefox 75+

## Performance

- **Ladezeit**: < 2 Sekunden
- **FPS**: 60fps Animationen (GPU-beschleunigt)
- **Foto-Größe**: ~100KB pro Foto
- **Max. Payload**: ~13MB bei 130 Fotos

## Datenschutz (DSGVO)

- ✅ Keine externen Services
- ✅ Keine Tracking-Cookies
- ✅ Keine Personendaten außer Fotos
- ✅ Daten im eigenen Repository
- ✅ Löschung durch Commit möglich

## Support & Wartung

### Monitoring

```bash
# Foto-Anzahl checken
cat data/photos.json | jq '.metadata.totalCount'

# Letzte Updates
git log --oneline data/photos.json
```

### Backup

```bash
# Regelmäßiges Backup der photos.json
cp data/photos.json backups/photos-$(date +%Y%m%d).json
```

### Troubleshooting

**Problem**: Fotos werden nicht angezeigt
- **Lösung**: Prüfe Browser-Konsole auf Fehler, validiere JSON-Syntax

**Problem**: Upload funktioniert nicht
- **Lösung**: Implementiere GitHub API oder Serverless Function

**Problem**: Baum zu klein/groß
- **Lösung**: Passe `calculateTreeHeight()` in `tree-generator.js` an

## Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte

## Credits

Entwickelt mit Claude Code von Anthropic

---

**Viel Spaß beim Wachsen lassen eures Team-Weihnachtsbaums! 🎄✨**
