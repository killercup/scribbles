---
title: {{ .Title | jsonify }}
description: {{ .Description | default .Summary | plainify | htmlUnescape | truncate 200 | jsonify }}
image: {{ print .Slug "-og.png" | absURL }}
url: {{ .Permalink }}
author: {{ site.Params.author | jsonify }}
date: {{ .Date.Format "2006-01-02" }}
{{- with .Params.categories }}
categories: {{ . | jsonify }}
{{- end }}
---

# {{ .Title }}

{{ .RawContent }}
