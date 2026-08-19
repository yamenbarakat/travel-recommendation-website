# TravelBloom

IBM JavaScript Programming Essentials final project: a responsive three-page travel recommendation website with data loaded from a local JSON file.

## Run locally

The Fetch API requires the project to be served over HTTP rather than opened as a `file://` URL.

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Search examples

- Category: `beach`, `beaches`, `temple`, `temples`, `country`, `countries`
- Country: `Japan`, `Brazil`, `Australia`
- Destination/tag: `Kyoto`, `architecture`, `food`, `island`

Reset clears the query and recommendation cards. The contact form is intentionally client-side because the course project does not include a backend.
