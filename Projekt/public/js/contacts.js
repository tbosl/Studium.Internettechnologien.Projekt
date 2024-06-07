/**
 * Load the content of the page based on the provided json data.
 * (Stored at project root: message-content.json)
 * 
 * @param {*} data The json data containing the content of the project. 
 */
function loadPageContent(data) {
    let content = data.contacts;
    loadSharedContent(content);
    $('#instagram-container a span').text(content.socials.instagram.username);
    $('#instagram-container a').attr('href', content.socials.instagram.link);
    $('#instagram-container a img').attr('src', content.socials.instagram.logo);
    $('#twitch-container a span').text(content.socials.twitch.username);
    $('#twitch-container a').attr('href', content.socials.twitch.link);
    $('#twitch-container a img').attr('src', content.socials.twitch.logo);
    $('#youtube-container a span').text(content.socials.youtube.username);
    $('#youtube-container a').attr('href', content.socials.youtube.link);
    $('#youtube-container a img').attr('src', content.socials.youtube.logo);
    $('#discord-container a span').text(content.socials.discord.username);
    $('#discord-container a').attr('href', content.socials.discord.link);
    $('#discord-container a img').attr('src', content.socials.discord.logo);
    $('#flyer-1').attr('src', content.images.flyer1.src);
    $('#flyer-1').attr('alt', content.images.flyer1.alt);
}