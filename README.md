# exif-viewer
A single-file JavaScript EXIF metadata parser.

## Usage
### index.html
Drag an image into the "Drag files here" area or click to select an image from your file system.  
Metadata is categorized into "Basic" and "All" tags.

### exif-viewer.js
You can include the file in your codebase:
```html
<script src="path/to/exif-viewer.js"></script>

```

Or fetch it directly from GitHub:

```html
<script src="[https://raw.githubusercontent.com/pavlik-dev/exif-viewer/refs/heads/master/exif-viewer.js](https://raw.githubusercontent.com/pavlik-dev/exif-viewer/refs/heads/master/exif-viewer.js)"></script>

```

Or from GitHub Pages:

```html
<script src="[https://pavlik-dev.github.io/exif-viewer/exif-viewer.js](https://pavlik-dev.github.io/exif-viewer/exif-viewer.js)"></script>

```

Then, pass the raw bytes into the `parse_exif` function as a `Uint8Array`. This can be done by reading a file from the user or from a data URL:

```js
function tryParse(file) {
    const reader = new FileReader();

    reader.onload = () => {
        const arrayBuffer = reader.result;
        const uint8View = new Uint8Array(arrayBuffer);
        try {
            const fields = parse_exif(uint8View);
            fields.forEach((v, i) => {
                console.log(i, v);
            });
        } catch (err) {
            console.error(err.message);
        }
    };

    reader.readAsArrayBuffer(file);
}

```
