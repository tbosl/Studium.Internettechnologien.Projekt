/**
 * File: info.js
 * 
 * Description:
 * This JavaScript file is responsible for dynamically loading and displaying specific
 * content on the info page, based on JSON data provided. The primary function,
 * `loadPageContent`, is designed to parse JSON data and update various elements of the
 * web page with content such as video trailers, titles, and informational text.
 * 
 * The function `loadPageContent` takes the JSON data as input, extracts the relevant
 * content under the `info` key, and then calls `loadSharedContent` to handle shared
 * content across pages. It specifically updates the source (`src`) and title attributes
 * of the video element and inserts informational text into the designated element on the
 * page. This approach allows for a centralized and easily updatable way to manage page
 * content, enhancing maintainability and flexibility of the web application.
 * 
 * Usage:
 * This file should be included in the HTML of the information page.
 * It relies on jQuery for DOM manipulation and is designed to work with JSON data that
 * follows a specific structure, with keys for `trailerSrc`, `trailerTitle`, and
 * `infoText` under an `info` object. This structure allows for easy updates to the
 * content without direct modifications to the HTML code.
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
    let content = data.info;
    loadSharedContent(content);
    $('#video').attr('src', content.trailerSrc);
    $('#video').attr('title', content.trailerTitle);
    $('#info-text').html(content.infoText);
}