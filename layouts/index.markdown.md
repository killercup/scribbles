---
title: {{ site.Title | jsonify }}
description: {{ site.Params.description | jsonify }}
url: {{ .Permalink }}
---

# {{ site.Title }}

{{ site.Params.description }}

## Posts
{{ range site.RegularPages.ByDate.Reverse }}
- [{{ .Title }}]({{ (.OutputFormats.Get "Markdown").Permalink }}) ({{ .Date.Format "2006-01-02" }})
{{- end }}
