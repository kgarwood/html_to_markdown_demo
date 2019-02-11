# Demo
Temporary repository for a demo showing how pasted RTF can be converted to
markdown.


Clone this repository and view app/harness_demo.html in a browser.

View app/harness_demo.html in a browser.

Open the test data in tests/SampleRichTextFormatData.odt

Copy all of the document

Paste it into the text area of harness_demo.html

You should see three main ouptut areas:
 - HTML for rich text, which shows all the HTML that is used to support
   the rich text format data you pasted into the main text area.
 - Stripped HTML, which strips out HTML tags and attributes that will not
   be interpretted in the generation of markdown.
 - Markdown, which shows markdown text for the stripped HTML.
