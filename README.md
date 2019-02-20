# Demo
Temporary repository for a demo showing how pasted RTF can be converted to
markdown.

Try copying and pasting content from plain text and RTF editors into
the [demo](https://kgarwood.github.io/html_to_markdown_demo/app/harness_demo.html).

1. Clone this repository and view `app/harness_demo.html` in a browser.

2. View `app/harness_demo.html` in a browser.

3. Open the test data in `tests/SampleRichTextFormatData.odt`

4. Copy all of the document to the clipboard.

5. Paste it into the text area of `app/harness_demo.html`

You should see three main output areas:
 - HTML for rich text, which shows all the HTML that is used to support
   the rich text format data you pasted into the main text area.
 - Stripped HTML, which strips out HTML tags and attributes that will not
   be interpretted in the generation of markdown.
 - Markdown, which shows markdown text for the stripped HTML.

# Overview of Design
This demo uses copy-paste actions with the system clipboard to generate a
Markdown formatted version of content copied from word processing
applications. Most often the use case involves copying Rich Text Format data
to the clipboard and having the demo automatically generate Markdown code for
it.

Word processing applications will typically copy data either as plain text or
HTML formatted text to the clipboard.  HTML code on the clipboard can be
verbose and contain tags that are not readily supported in Markdown.

The basic process supported here is:
1. Use [sanitize-html](https://www.npmjs.com/package/sanitize-html) to strip
the verbose HTML of any tags or attributes that will not be supported in
Markdown.  We will call this the 'simplified html'.
2. Pass the simplified html to code that uses [Turndown](https://github.com/domchristie/turndown)
3. Ensure the generated markdown code is compatible with a Markdown viewer.

# Configuring sanitize-html
[sanitize-html](https://www.npmjs.com/package/sanitize-html) removes all the HTML tags
that would otherwise end up in the final Markdown code and serve no use. It will only
preserve HTML code if it matches a white list of accepted tags and a white list of
accepted tag attributes. It also supports transformations which allow one kind of tag
found in the input as another kind of tag in the output. In this demo, only the following
tags are accepted:
* headings: `h2...h6`
* lists and their elements: `ul, ol, li`
* paragraphs: `p`
* block texts: `blockquote` and `cite`
* anchor tags: `a`, along with `href` attributes. (no images)
* line break character: `br`

The demo only uses one transformation: it converts cite to blockquote tags.

##Configuring Turndown
[Turndown](https://github.com/domchristie/turndown) turns HTML into Markdown but some
of its default settings have had to be altered. They include:
* rendering list items using `-` rather than `*`
* rendering headings using sequences of # characters rather than through different kinds of
underlines.

# Design Issues

## Word Processing Issue: Variance in how applications copy to the clipboard
In the scenario where users copy and paste data from an RTF editor, the
conversion to Markdown will be dependent on how that editor copies data to
the clip board.  

Copying HTML code from a plain text editor provides the most predictable
markdown output because all the HTML codes from the content are fed to
sanitize-html, which is then fed to Turndown.  

But trying to copy and paste Rich Text assumes that the RTF editor will
use HTML tags that can be processed by the demo.  During testing, it seemed
that few editors would generate HTML tags such as `abbr`, `blockquote`,
and `cite`.  Tables were another problem: many RTF editors would use HTML
spans to support rendering a table.

## Cross-Browser JavaScript Issue: Support in IE11
Each kind of browser uses an API to interact with the clipboard scratch space,
and support for features can vary. Edge, Chrome and FireFox all support the
ability to interpret clipboard content as `text/plain` or `text/html`.
However, IE11 only recognises text and this means it is unable to interpret
HTML data from the clip board.

Richard Shurtz provides an excellent article about this [issue]
(https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/)

He notes:
>"The clipboard object in Internet Explorer doesn’t expose text/html via
JavaScript. It does, however, support copying and pasting HTML into
contenteditable elements. We can leverage this if we let the browser perform
its default copy and paste, but ‘hijack’ the events to get/put the HTML data
we want"

He provides a [code snippet](https://jsfiddle.net/vtjnr6ea/) for how this hack
should be done and this may well be a starting point for supporting copy and
paste for just IE browsers.

## Cross-Browser JavaScript Issue: Is the clipboard content text or HTML?
There is a key user-facing issue to decide: when users copy and paste content,
should they know whether their content is plain text or HTML? Or should a
copy-and-paste activity be smart enough to know what kind of content it is
processing?  The pros and cons relate to both user and technical perspectives.

Letting the copy-and-copy feature be smart enough to detect whether the
clipboard data are in HTML or plain text would make it easier for users, but
if the feature made a mistake of deciding which format to use, it might mean
users had to do more work to correct formatting issues.

Interpreting whether clip board data is in `text/plain` or `text/html` depends
both on how applications copy their data onto the system clipboard and what
features are in the API the browser uses to interact with the clip board
area (see IE11 issue).

I would suggest that it is better to provide an option that lets users
specify whether they're pasting data that is meant to be HTML or plain text
and to add some user training.  It makes for more UI controls but it allows
users to have more say in how they would intend a potentially large amount of
copied data to be processed.

When user select the HTML format option and paste into the text area, the demo
first tries to get data from the clipboard using `text/html`.  
If that returns nothing, it tries again using `text/plain`. Otherwise,
the demo does not attempt to interrogate the clip board data to determine if
it should be read using one format or another.

## Sanitize-html Issue: Supporting browser rather than Node context
[sanitize-html](https://www.npmjs.com/package/sanitize-html) is designed to
mainly work with an installation of Node.js rather than to work in a browser.

## Turndown Issue: Preventing Turndown from escaping pasted markdown content
The demo should support the scenario where a user copies markdown text and pastes it into the
text area.  In early tests, the problem was that pasted markdown appeared to be escaped, which
made it unable to be rendered in a particular markdown viewer.

The Turndown documents mention: "Turndown uses backslashes (\) to escape Markdown characters
in the HTML input. This ensures that these characters are not interpreted as Markdown when
the output is compiled back to HTML".  

For this demo, the default implementation of the escape() function that escapes Markdown
has been overidden by another implementation that does no escaping at all.  The new
behaviour should be well tested to identify any characters that still should be escaped.

Testing shows that if Markdown text is copied and pasted from an RTF editor it works.
But if it is copied and pasted either from a plain text editor or a text area, the
Markdown tags are preserved but the newline characters are removed.

Viewing the verbose initial HTML and the stripped HTML in console log output showed that
in these scenarios, new line characters were being retained even though in the ```<div></div>```
sections, the newline characters disappeared. It also showed the newline characters disappeared
in the output from Turndown.

Advice:
1. I think that the verbose and stripped HTML versions of pasted outputs retain new lines
   but the ```<div></div>``` elements that show that are somehow losing it.
2. I suspect Turndown is actually causing new line characters to be stripped in the 
   final markdown result.  Have a look at [turndown.js](https://github.com/domchristie/turndown/blob/master/src/turndown.js) and
   trace through uses of ```leadingNewLinesRegExp``` and ```trailingNewLinesRegExp```. I
   suspect this may somehow be causing new line characters to disappear in these cases.




## Turndown Issue: Support for Tables
Markdown has no specific support for tables and in many projects, HTML codes
for formatting tables are just left in the Markdown code. The demo lets you try
out three different policies for handling tables:
* ignore all HTML codes used to describe tables (`table`, `td`, `tr`, `th` tags)
* preserve HTML tags
* try to convert HTML table tags into a plain text table

Ignoring table codes is done by removing them from the white list of
accepted HTML tags that is used by
[sanitize-html](https://www.npmjs.com/package/sanitize-html).  Preserving tags
is done by white listing the tags and by configuring [Turndown](https://github.com/domchristie/turndown)
to keep any of those tags without alteration.  To render the HTML table as a
plain text table, the demo relies on [turndown-plugin-gfm](https://github.com/domchristie/turndown-plugin-gfm), a plugin
that supports Github flavoured markedown extensions. It has been developed by
Dom Christie, the same author of Turndown.  

In the preserve HTML tags option, the output will retain all the HTML table
tags as well as the `<tbody>` tag.  I'm not yet clear why it does this.

In the option for converting HTML table tags, if the plugin is unable to process
the HTML table tags, it will by default just preserve them like the other option.

Copying and pasting tables works best when HTML code is copied from a plain
text editor.  In scenarios involving tables copied from RTF editors, the
tables are not preserved. This is because table cells end up looking like:

```
<td><p>Table cell contents</p></td>
```
The Turndown gfm plugin can't cope with the extra inserted characters.
