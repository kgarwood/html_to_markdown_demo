
function convert_html_to_markdown(simplified_html) {
  //TurndownService is a JavaScript solution that converts HTML into
  //markdown.  Some of its default settings produce markdown that does
  //not fit what we want in Govspeak.

  // 'atx' ensures headings use # characters to denote level rather
  // than underlines. 'bulletListMarker' ensures bullets use a '-' rather
  // than the default '*'
  var turndownServiceOptions = {headingStyle: 'atx', bulletListMarker: '-'}
  var turndownService = new TurndownService(turndownServiceOptions);

  //Turndown does not appear to directly support interpretting an HTML
  //abbr tag.
  turndownService.addRule('abbr', {
    filter: ['abbr'],
    replacement: function (content, node, options) {
      return ('*[' + content + ']:' + node.getAttribute('title'));
    }
  })

  return turndownService.turndown(simplified_html);
}

function remove_unsupported_html_features(html) {
  //'code', 'pre' are not supported.  We discussed with Ben H and he
  //suggested we do not need it
  var white_listed_tags = [
    'abbr', 'blockquote', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'cite', 'br', 'p']
  var white_listed_attributes = {
    'a': [ 'href', 'mailto'],
    'abbr': ['title']
  }
  //Sometimes the HTML for pasted RTF uses 'cite' instead of 'blockquote'
  //But in sanitizeHtml you can specify transformations to convert the
  //text used for one tag into another
  var tag_transformations = {'cite': 'blockquote'}
  return sanitizeHtml(html,
                      {allowedTags: white_listed_tags,
                       allowedAttributes: white_listed_attributes,
                       transformTags: tag_transformations})
}


function getInputSelection(textAreaElement) {
  // Adapted from code at
  // https://ourcodeworld.com/articles/read/282/how-to-get-the-current-cursor-position-and-selection-within-a-text-input-or-textarea-in-javascript
  // which is available under MIT
  var start = 0;
  var end = 0;
  var normalizedValue;
  var range;
  var textInputRange;
  var length;
  var endRange;

  if (typeof textAreaElement.selectionStart == "number" &&
      typeof textAreaElement.selectionEnd == "number") {
    start = textAreaElement.selectionStart;
    end = textAreaElement.selectionEnd;
  } else {
    range = document.selection.createRange();
    if (range && range.parentElement() == textAreaElement) {
      length = textAreaElement.value.length;
      normalizedValue = textAreaElement.value.replace(/\r\n/g, "\n");

      // Create a working TextRange that lives only in the input
      textInputRange = textAreaElement.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd don't return what we want
      // in those cases
      endRange = textAreaElement.createTextRange();
      endRange.collapse(false);

      if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
        start = end = len;
      } else {
        start = -textInputRange.moveStart("character", -length);
        start += normalizedValue.slice(0, start).split("\n").length - 1;

        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
          end = length;
        } else {
          end = -textInputRange.moveEnd("character", -length);
          end += normalizedValue.slice(0, end).split("\n").length - 1;
        }
      }
    }
  }

  return {
    start: start,
    end: end
  };
}

function insert_text(current_text,
                     start_selection_position,
                     end_selection_position,
                     text_to_insert) {
  before_cursor_text = current_text.substring(0, start_selection_position);
  after_cursor_text = current_text.substring(end_selection_position, current_text.length);
  modified_text = before_cursor_text + text_to_insert + after_cursor_text;
  after_paste_cursor_position = (before_cursor_text + text_to_insert).length;
  return [modified_text, after_paste_cursor_position];
}
