/**
 * File: shared.js
 * 
 * Description:
 * This JavaScript file is crucial for initializing and dynamically loading shared content
 * across multiple pages of the application. It utilizes the Fetch API to retrieve page
 * content from a JSON file (`/page-contents.json`) and applies it to common elements such
 * as the header, navigation bar, footer, and background. The script ensures a consistent
 * look and feel across the website by centralizing the management of these elements.
 * 
 * The `loadContentOfHeadAndBackground` function specifically updates the header and
 * background elements based on the data fetched, including setting the logo source and
 * updating navigation links texts. The `loadNavigationBar` function dynamically generates the
 * navigation bar HTML, making it reusable and easily maintainable across different pages.
 * 
 * Additionally, the script provides a mechanism for loading page-specific content through
 * the `loadPageContent` function, which is defined in each page's specific JavaScript file.
 * This approach allows for a modular design where shared functionality is centralized in
 * this file, while page-specific behavior can be implemented separately.
 * 
 * Usage:
 * This file should be included in all HTML pages of the web application that require the
 * shared content. It ensures that the navigation bar, footer, and other common elements
 * are consistently presented across the site, while still allowing for page-specific
 * content to be loaded dynamically.
 * 
 * Date: 25.06.2024
 * Author: Tobias Bosl
 */


/**
 * Initialize the elements of the page based on the content of the json file.
 */
fetch('/page-contents.json')
    .then(response => response.json())
    .then(data => {
        $('body').css('display', 'none');
        loadContentOfHeadAndBackground(data);
        loadFooter(data);
        // Load the content of the unique page. This method is implemented in the specific js file of each page.
        loadPageContent(data);
        $('body').css('display', 'block');
    })
    .catch((error) => {
        console.error('Error:', error);
    });

/**
 * Load the content of the header and the 
 * @param {*} data The json object that contains the content of the pages.
 */
function loadContentOfHeadAndBackground(data) {
    loadNavigationBar();
    $("#background #logo").attr('src', data.header.iconSrc);
    $("#link-to-chat").text(data.header.chat);
    $("#link-to-events").text(data.header.events);
    $("#link-to-contacts").text(data.header.contacts);
}

/**
 * Dynamically load the navigation bar to make it reusable for all pages. 
 */
function loadNavigationBar() {
    $("header").html('<nav>'
        + '<ul>'
        + '<li>'
        + '<a href="index.html">'
        + '<img id="logo" width="80vh" alt="Logo">'
        + '</a>'
        + '</li>'
        + '<li>'
        + '<a class="links-to-other-pages" id="link-to-chat" href="chat.html"></a>'
        + '</li>'
        + '<li>'
        + '<a class="links-to-other-pages" id="link-to-events" href="events.html"></a>'
        + '</li>'
        + '<li>'
        + '<a class="links-to-other-pages" id="link-to-contacts" href="contacts.html"></a>'
        + '</li>'
        + '</ul>'
        + '</nav>');
}

/**
 * Dynamically load the footer of the page.
 * 
 * @param {*} data The json object that contains the content of the pages.
 */
function loadFooter(data) {
    $("#footer").html('<p>' + data.footer.content + '</p>');
}

/**
 * Load the content that is shared between all pages.
 * @param {*} content The json object that contains the content of the current page. 
 */
function loadSharedContent(content) {
    $('title').text(content.title);
    $('#headline-container h1').text(content.heading);
}