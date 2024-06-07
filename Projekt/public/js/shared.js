fetch('/page-contents.json')
    .then(response => response.json())
    .then(data => {
        $('body').css('display', 'none');
        loadContentOfHeadAndBackground(data);
        loadContent(data);
        $('body').css('display', 'block');
    })
    .catch((error) => {
        console.error('Error:', error);
    });

function loadContentOfHeadAndBackground(data) {
    $("#background #logo").attr('src', data.header.iconSrc);
    $("#link-to-chat").text(data.header.chat);
    $("#link-to-events").text(data.header.events);
    $("#link-to-contacts").text(data.header.contacts);
}

function loadSharedContent(content) {
    $('title').text(content.title);
    console.log(content.heading);
    $('#headline-container h1').text(content.heading);
}