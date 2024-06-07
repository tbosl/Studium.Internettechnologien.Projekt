/**
 * Load the content of the page based on the provided json data.
 * (Stored at project root: message-content.json)
 * 
 * @param {*} data The json data containing the content of the project. 
 */
function loadPageContent(data) {
    let content = data.info;
    loadSharedContent(content);
    $('#video').attr('src', content.trailerSrc);
    $('#video').attr('title', content.trailerTitle);
    $('#info-text').html(content.infoText);
}