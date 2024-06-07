function loadContent(data) {
    let content = data.info;
    loadSharedContent(content);
    $('#video').attr('src', content.trailerSrc);
    $('#video').attr('title', content.trailerTitle);
    $('#info-text').html(content.infoText);
}