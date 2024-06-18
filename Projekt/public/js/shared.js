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