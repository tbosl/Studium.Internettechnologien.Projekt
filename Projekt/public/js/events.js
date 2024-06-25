/**
 * File: events.js
 * 
 * Description:
 * This JavaScript file is focused on dynamically loading and displaying event-related
 * content on the events page from a JSON data source. The primary functionality is encapsulated
 * within the `loadPageContent` function, which takes JSON data as its argument and
 * updates the DOM to reflect event details.
 * 
 * The function `loadPageContent` specifically targets elements within the HTML designated
 * for displaying the calendar image and event information. It uses jQuery to update the
 * `src` and `alt` attributes of the calendar image and to insert informational text about
 * the events into the specified element. This approach allows for the event content of the
 * page to be easily updated or changed by modifying the JSON data file (`message-content.json`),
 * without the need for direct changes to the HTML structure.
 * 
 * Usage:
 * This file should be included in the HTML of the events page of a web application. It
 * requires jQuery for DOM manipulation and is designed to work with JSON data that follows
 * a specific structure, detailing the events' calendar image source, alt text, and
 * informational text.
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
    let content = data.events;
    loadSharedContent(content);
    $('#calender-image').attr('src', content.calenderImageSrc);
    $('#calender-image').attr('alt', content.calenderImageAlt);
    $('#info-text').html(content.infoText);
}