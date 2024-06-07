fetch('/page-contents.json')
    .then(response => response.json())
    .then(data => {
        $('body').css('display', 'none');
        loadContent(data);
        $('body').css('display', 'block');
    })
    .catch((error) => {
        console.error('Error:', error);
    });

function loadContent(data) {
    let content = data.contacts;
    loadContentOfHeadAndBackground(data, content);
    $('#instagram-container a span').text(content.usernames.instagram);
    $('#twitch-container a span').text(content.usernames.twitch);
    $('#youtube-container a span').text(content.usernames.youtube);
    $('#discord-container a span').text(content.usernames.discord);
    $('#flyer-1').attr('src', content.images.flyer1.src);
    $('#flyer-1').attr('alt', content.images.flyer1.alt);

}