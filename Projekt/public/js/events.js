function loadContent(data) {
    let content = data.events;
    loadSharedContent(content);
    $('#calender-image').attr('src', content.calenderImageSrc);
    $('#calender-image').attr('alt', content.calenderImageAlt);
    $('#info-text').html(content.infoText);
}