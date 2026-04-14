---
title: '{{ replace (slicestr .File.ContentBaseName 11) "-" " " | title }}'
publishDate: '{{ time.Now.Format "2006-01-02" }}'
updatedAt: '{{ time.Now.Format "2006-01-02" }}'
draft: true
---
