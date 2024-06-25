/**
 * File: contacts.js
 * 
 * Description:
 * This JavaScript file is dedicated to dynamically loading and displaying contact
 * information and social media links on the contacts page, based on JSON data provided. The
 * primary function, `loadPageContent`, takes JSON data as input and updates the DOM
 * elements to reflect the contact details, social media usernames, links, and logos,
 * as well as images specified in the JSON file (`message-content.json`).
 * 
 * The function specifically targets elements within the HTML that are designated for
 * displaying Instagram, Twitch, YouTube, and Discord information, along with two
 * promotional flyers. It uses jQuery to select these elements and update their
 * attributes (`href`, `src`, `alt`, and text content) to match the data provided in
 * the JSON. This approach allows for a flexible and easily updatable contact page
 * where changes to contact information or social media links can be made centrally
 * within the JSON file, without the need to directly modify the HTML.
 * 
 * Usage:
 * This file should be included in the HTML of the contact page
 * It requires jQuery for DOM manipulation and is designed to be called with JSON data
 * that follows a specific structure, as outlined in `message-content.json`. This
 * structure includes sections for socials (Instagram, Twitch, YouTube, Discord) and
 * images (flyers), each with relevant sub-properties (username, link, logo for socials;
 * src, alt for images).
 * 
 * Date: 25.06.2024
 * Author: Tobias Bosl
 */


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
    $('#flyer-2').attr('src', content.images.flyer2.src);
    $('#flyer-2').attr('alt', content.images.flyer2.alt);
}