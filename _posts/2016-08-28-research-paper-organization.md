---
title: Research paper organization
categories:
- academia
- idea
---
I have a directory full of research papers I have read or want to read. They are all named `[last name of primary author][year][first word in title].{pdf,bib}` (there is a PDF and [BibTeX] file for each publication). This works quite well, as this is the same naming schema that [Google Scholar][scholar] uses in their BibTeX citations.

I want to expand this, though. Some time ago I starting writing a simple GUI application to list these files with their metadata (using [Electron] and [bibtex-parser]), but I never quite got it to a state where I actually wanted to use it.

One of my goals with this is to keep all the metadata in a plain text format right beside the files, and not in some database in a third-party application.

Any (pseudo-)academic thing I write, I try to write in Markdown and use [pandoc] to make nice printables PDFs (via TeX, of course). [pandoc-citeproc] can read bibliographic references from YAML or BibTeX files, with quite a few metadata fields (see [CSL types][csl]). Ideally, I can just use a simple text file listing some file names and easily build an bibliography that pandoc can understand.


[BibTeX]: https://en.wikipedia.org/wiki/BibTeX
[scholar]: http://scholar.google.com
[Electron]: http://electron.atom.io
[bibtex-parser]: http://npmjs.com/package/bibtex-parser
[pandoc]: http://pandoc.org
[pandoc-citeproc]: https://github.com/jgm/pandoc-citeproc
[csl]: http://docs.citationstyles.org/en/stable/specification.html#appendix-iii-types