/**
 * Load the content of the page based on the provided json data.
 * (Stored at project root: message-content.json)
 * 
 * @param {*} data The json data containing the content of the project. 
 */
function loadPageContent(data) {
    let content = data.contacts;
    loadSharedContent(content);
    $('#instagram-container a span').text(content.usernames.instagram);
    $('#twitch-container a span').text(content.usernames.twitch);
    $('#youtube-container a span').text(content.usernames.youtube);
    $('#discord-container a span').text(content.usernames.discord);
    $('#flyer-1').attr('src', content.images.flyer1.src);
    $('#flyer-1').attr('alt', content.images.flyer1.alt);
}