# CLAUDE.md - Technische Dokumentation

## Projektübersicht

**Wachsender Weihnachtsbaum Web-App**

Eine interaktive Weihnachtsbaum-Anwendung, bei der Team-Mitglieder Fotos hochladen können, die als Christbaumkugeln an einem wachsenden SVG-Baum erscheinen.

### Kernkonzepte

1. **Seeded Random**: Tägliche Neuanordnung aller Fotos basierend auf Datum als Seed
2. **SVG Tree Generation**: Dynamische Baum-Generierung basierend auf Foto-Anzahl
3. **Base64 Storage**: Fotos werden als Base64 im JSON gespeichert
4. **Client-Side Processing**: Alle Foto-Verarbeitung im Browser
5. **Cookie-Based Limiting**: Verhindert Mehrfach-Uploads

## Architektur

### Datenfluss

```
Upload Page:
1. User wählt Foto
2. compressImage() verarbeitet zu 400x400px Base64
3. savePhotoData() aktualisiert photos.json
4. Cookie wird gesetzt

Display Page:
1. loadPhotoData() lädt photos.json
2. getTodaySeed() generiert Datum-Seed
3. generateTree() erstellt SVG-Baum
4. generatePhotoPositions() berechnet Positionen
5. Rendering mit Animationen
6. Polling alle 30s für Updates
```

### Datei-Zwecke

#### JavaScript-Module

**utils.js**
- `seededRandom(seed)`: Mulberry32 PRNG für deterministische Zufallszahlen
- `getTodaySeed()`: Konvertiert YYYY-MM-DD zu numerischem Seed
- `compressImage(file, maxSize, quality)`: Client-side Bildverarbeitung
- `circlesCollide()`: Kollisionserkennung für Kugel-Platzierung
- `setCookie()` / `getCookie()`: Upload-Tracking

**tree-generator.js**
- `calculateTreeHeight(photoCount)`: Linear-Interpolation 200px → 800px
- `getBranchLevels(photoCount)`: Dynamische Äste (3/5/7 basierend auf Anzahl)
- `generateTree(photoCount)`: SVG-Baum mit Farbverläufen, Filter-Defs
- `generatePhotoPositions()`: Seed-basierte Positionsberechnung mit Collision-Detection

**tree-display.js**
- `initTreeDisplay()`: Haupt-Initialisierung
- `loadAndRenderTree()`: Lädt JSON, vergleicht mit Cache, triggert Render
- `renderTree(photoData, isNewPhoto)`: DOM-Manipulation für Baum + Kugeln
- `startPolling()`: setInterval(30000) für Auto-Refresh
- Event-Handler für Resize

**photo-upload.js**
- `handleFileSelect()`: File-Input-Handler mit Validierung
- `handleUpload()`: JSON-Update-Logik (derzeit localStorage-Fallback)
- `checkUploadStatus()`: Cookie-Check
- `showPreview()`: Runde Vorschau-Darstellung

#### CSS-Architektur

**display.css**
- Starry-Background mit keyframe-Animation
- SVG-Tree-Styles mit GPU-beschleunigten Transforms
- Ornament-Klassen mit hover-Effekten
- Responsive Breakpoints (768px, 1920px)
- Print-Styles

**upload.css**
- Mobile-First-Design (min-height: 44px Touch-Targets)
- Backdrop-Filter für Glassmorphism
- Animation-States (fadeIn, bounce, spin)
- Touch-Device-Optimierungen (@media hover: none)

## Kritische Implementierungen

### Seeded Random (SEHR WICHTIG!)

```javascript
function seededRandom(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
```

**Warum Mulberry32?**
- Deterministisch: Gleicher Seed → gleiche Sequenz
- Performant: Bitwise-Operations, keine Loops
- Ausreichende Qualität für UI-Randomisierung

**Seed-Generierung:**
```javascript
const today = new Date();
const dateString = `${year}${month}${day}`; // "20251119"
const seed = parseInt(dateString, 10);
```

Alle Besucher sehen dieselbe Anordnung pro Tag, da der Seed global aus dem Datum generiert wird.

### Foto-Positionierung mit Collision-Detection

```javascript
function generatePhotoPositions(photoCount, treeHeight, treeWidth, seed) {
    const rng = seededRandom(seed);
    const positions = [];
    const maxAttempts = 100;

    for (let i = 0; i < photoCount; i++) {
        let attempts = 0;
        while (attempts < maxAttempts) {
            const newPosition = {
                x: calculateX(rng),
                y: calculateY(rng),
                rotation: (rng() - 0.5) * 10,
                radius: baseRadius + variation(rng)
            };

            if (!hasCollision(newPosition, positions)) {
                positions.push(newPosition);
                break;
            }
            attempts++;
        }
    }
    return positions;
}
```

**Wichtig:**
- Baum-Form berücksichtigen (Triangle Shape)
- Min. 10px Abstand zwischen Kugeln
- Fallback-Spirale bei zu vielen Kollisionen

### SVG-Optimierungen

```xml
<defs>
  <!-- Einmalig definiert, mehrfach verwendet -->
  <linearGradient id="treeGradient">...</linearGradient>
  <filter id="glitter">...</filter>
</defs>
```

**Performance-Tipps:**
- CSS Transforms statt SVG-Attribute für Animationen
- `will-change: transform` für häufig animierte Elemente
- `requestAnimationFrame` bei komplexen Animationen

### Base64-Kompression

```javascript
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 400;
ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 400, 400);
const base64 = canvas.toDataURL('image/jpeg', 0.8);
```

**Warum 400x400 @ 0.8 Quality?**
- 400px: Ausreichend für 50-70px Darstellung (2x Retina)
- 0.8 JPEG: Guter Kompromiss Qualität/Größe (~100-120KB)
- Center-Crop: Gesichter bleiben im Fokus

## Datenbank-Schema

### photos.json

```json
{
  "photos": [
    {
      "id": "uuid-v4",
      "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
      "uploadedAt": "2025-11-19T10:30:00Z",
      "timestamp": 1700392200000
    }
  ],
  "metadata": {
    "totalCount": 1,
    "maxPhotos": 130,
    "lastUpdated": "2025-11-19T10:30:00Z"
  }
}
```

**Validierung:**
- `id`: UUID v4 (generateUUID())
- `imageData`: Base64 JPEG Data-URL
- `uploadedAt`: ISO 8601 String
- `timestamp`: Unix-Timestamp (Millisekunden)
- `totalCount`: MUSS === photos.length sein

## Deployment

### GitHub Pages Setup

1. **Repository Settings**:
   - Pages → Source: GitHub Actions
   - Branch wird automatisch erkannt

2. **Workflow-Trigger**:
   - Push zu `main` oder `master`
   - Manuell via `workflow_dispatch`

3. **Permissions**:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

### Produktiv-Einsatz: Upload-Backend

**WICHTIG**: Die aktuelle Implementation hat KEIN funktionierendes Upload-Backend!

#### Option A: GitHub API (Empfohlen für kleine Teams)

```javascript
async function savePhotoData(photoData) {
    const token = process.env.GITHUB_TOKEN; // Via Secrets
    const repo = 'user/xmastree';
    const path = 'data/photos.json';

    // 1. GET current file SHA
    const currentFile = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        { headers: { Authorization: `token ${token}` } }
    );
    const { sha } = await currentFile.json();

    // 2. PUT updated content
    await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add photo ${photoData.photos.length}`,
                content: btoa(JSON.stringify(photoData, null, 2)),
                sha: sha
            })
        }
    );
}
```

**Vorteile**: Keine zusätzliche Infra
**Nachteile**: API-Rate-Limits, Token-Management, Race-Conditions

#### Option B: Serverless Function (Empfohlen für >50 Personen)

**Vercel/Netlify Function:**

```javascript
// api/upload.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageData } = req.body;

    // Validierung
    if (!imageData || !imageData.startsWith('data:image/jpeg;base64,')) {
        return res.status(400).json({ error: 'Invalid image data' });
    }

    // Foto zu JSON hinzufügen via GitHub API
    // oder direkte File-System-Operation (Vercel nur)

    return res.status(200).json({ success: true });
}
```

**Frontend-Integration:**

```javascript
async function savePhotoData(photoData) {
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageData: photoData.photos[photoData.photos.length - 1].imageData
        })
    });

    if (!response.ok) throw new Error('Upload failed');
}
```

#### Option C: Firebase/Supabase

**Vorteile**: Echtzeit-Updates, keine Race-Conditions
**Nachteile**: Externe Abhängigkeit, Kosten

## Testing

### Manuelle Test-Checkliste

- [ ] Upload funktioniert auf iOS Safari
- [ ] Upload funktioniert auf Android Chrome
- [ ] Foto erscheint als Kugel
- [ ] Tägliche Randomisierung (Datum ändern in DevTools)
- [ ] Baum wächst linear (5, 20, 50, 130 Fotos testen)
- [ ] Cookie verhindert Mehrfach-Upload
- [ ] 130-Foto-Limit eingehalten
- [ ] Auto-Refresh nach 30s
- [ ] Responsive auf 320px Breite
- [ ] Display auf 4K-Screen

### Test-Daten generieren

```javascript
// In Browser-Konsole:
const testData = {
    photos: [],
    metadata: { totalCount: 0, maxPhotos: 130, lastUpdated: new Date().toISOString() }
};

// 50 Test-Fotos
for (let i = 0; i < 50; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `hsl(${i * 7}, 70%, 60%)`;
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = 'white';
    ctx.font = '100px Arial';
    ctx.fillText(i + 1, 150, 220);

    testData.photos.push({
        id: crypto.randomUUID(),
        imageData: canvas.toDataURL('image/jpeg', 0.8),
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now()
    });
}

testData.metadata.totalCount = testData.photos.length;
console.log(JSON.stringify(testData, null, 2));
```

## Häufige Probleme & Lösungen

### Problem: Fotos überlappen sich

**Ursache**: Collision-Detection fehlgeschlagen oder zu viele Fotos
**Lösung**:
- Erhöhe `maxAttempts` in `generatePhotoPositions()`
- Reduziere `ornamentRadius`
- Implementiere besseren Fallback-Algorithmus

### Problem: Baum wächst nicht gleichmäßig

**Ursache**: Nicht-lineare Interpolation
**Lösung**: Prüfe `calculateTreeHeight()` Formel

### Problem: Verschiedene Nutzer sehen unterschiedliche Anordnungen

**Ursache**: Datum-Seed nicht korrekt berechnet
**Lösung**:
- Prüfe Zeitzone (verwende UTC!)
- Validiere `getTodaySeed()` Output
- Cache-Problem: Hard-Reload (Cmd+Shift+R)

### Problem: Upload-Button deaktiviert nach Fehler

**Ursache**: Error-Handler setzt Button nicht zurück
**Lösung**: In `catch`-Block Button re-enablen

### Problem: JSON zu groß (>100MB)

**Ursache**: Zu viele Fotos oder schlechte Kompression
**Lösung**:
- Reduziere JPEG-Quality auf 0.7
- Reduziere Bildgröße auf 300x300px
- Implementiere externes Storage (S3, Cloudinary)

## Performance-Optimierung

### Lazy-Loading für viele Fotos

```javascript
// Für >100 Fotos
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    });
});

ornaments.forEach(ornament => {
    const img = ornament.querySelector('img');
    img.dataset.src = photo.imageData;
    img.src = 'placeholder.jpg';
    observer.observe(img);
});
```

### WebWorker für Bildverarbeitung

```javascript
// upload-worker.js
self.onmessage = async function(e) {
    const { file } = e.data;
    const compressed = await compressImage(file, 400, 0.8);
    self.postMessage({ compressed });
};

// photo-upload.js
const worker = new Worker('upload-worker.js');
worker.postMessage({ file });
worker.onmessage = (e) => {
    showPreview(e.data.compressed);
};
```

## Erweiterungsmöglichkeiten

### Feature-Ideen

1. **Name-Labels**: Optional Namen unter Kugeln anzeigen
2. **Filter**: Nach Upload-Datum filtern
3. **Galerie-Modus**: Alle Fotos in Grid-Ansicht
4. **Admin-Panel**: Fotos moderieren/löschen
5. **Themes**: Verschiedene Baum-Styles (Modern, Retro, etc.)
6. **Export**: Baum als PNG/SVG exportieren
7. **Social Sharing**: Baum-Screenshot teilen
8. **Statistiken**: Upload-Timeline, Engagement-Metrics

### Code-Erweiterungen

**Namen hinzufügen:**

```javascript
// In photos.json:
{
  "id": "...",
  "imageData": "...",
  "name": "Max M.", // Optional
  "uploadedAt": "..."
}

// In tree-display.js:
function createOrnament(photo, position, index, isNew) {
    // ... existing code ...

    if (photo.name) {
        const label = document.createElement('div');
        label.className = 'ornament-label';
        label.textContent = photo.name;
        ornament.appendChild(label);
    }
}
```

**Export-Funktion:**

```javascript
async function exportTree() {
    const svg = document.querySelector('.christmas-tree');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'weihnachtsbaum.png';
            a.click();
        });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
}
```

## Maintenance-Aufgaben

### Regelmäßig (täglich während Event)

- [ ] `git pull` und Baum-Display prüfen
- [ ] Foto-Anzahl checken: `jq '.metadata.totalCount' data/photos.json`
- [ ] Browser-Konsole auf Errors prüfen

### Wöchentlich

- [ ] Backup erstellen: `cp data/photos.json backups/photos-$(date +%Y%m%d).json`
- [ ] Disk-Space prüfen (JSON-Größe)

### Nach Event

- [ ] Finale Version taggen: `git tag v1.0-final`
- [ ] JSON archivieren
- [ ] Repository auf "Read-Only" setzen (optional)

## Kontakte & Support

Bei technischen Fragen zu diesem Projekt:

1. Prüfe diese Dokumentation
2. Schaue in Browser-Konsole (F12)
3. Validiere JSON-Syntax: `jq . data/photos.json`
4. Erstelle GitHub Issue mit Fehlerbeschreibung

---

**Letzte Aktualisierung**: 2025-11-19
**Version**: 1.0
**Entwickelt mit**: Claude Code (Sonnet 4.5)
