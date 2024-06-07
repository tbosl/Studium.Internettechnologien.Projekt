function loadContentOfHeadAndBackground(data, content) {
    $('title').text(content.title);
    $("#background #logo").attr('src', data.header.iconSrc);
    $("#links-to-chat").text(data.header.chat);
    $("#link-to-events").text(data.header.events);
    $("#link-to-contacts").text(data.header.contacts);
    $('#headline-container h1').text(content.heading);
}