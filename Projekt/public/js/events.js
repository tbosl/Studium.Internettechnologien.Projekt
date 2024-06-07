/**
 * Load the content of the page based on the provided json data.
 * (Stored at project root: message-content.json)
 * 
 * @param {*} data The json data containing the content of the project. 
 */
function loadPageContent(data) {
    let content = data.events;
    loadSharedContent(content);
    $('#calender-image').attr('src', content.calenderImageSrc);
    $('#calender-image').attr('alt', content.calenderImageAlt);
    $('#info-text').html(content.infoText);
}