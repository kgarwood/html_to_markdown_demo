
function convert_html_to_markdown(simplified_html) {
  //TurndownService is a JavaScript solution that converts HTML into
  //markdown.  Some of its default settings produce markdown that does
  //not fit what we want in Govspeak.

  // 'atx' ensures headings use # characters to denote level rather
  // than underlines. 'bulletListMarker' ensures bullets use a '-' rather
  // than the default '*'
  var turndownServiceOptions = {headingStyle: 'atx', bulletListMarker: '-'}
  var turndownService = new TurndownService(turndownServiceOptions);
  return turndownService.turndown(simplified_html);
}

function remove_unsupported_html_features(html) {
  //'code', 'pre' are not supported.  We discussed with Ben H and he
  //suggested we do not need it
  var white_listed_tags = [
    'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'cite', 'br', 'p']
  var white_listed_attributes = {
    'a': [ 'href', 'mailto']
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
